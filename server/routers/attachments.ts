import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { attachments } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { storagePut } from "../storage";
import { TRPCError } from "@trpc/server";

export const attachmentsRouter = router({
  // Upload file attachment
  upload: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileData: z.string(), // base64 encoded
        mimeType: z.string(),
        entityType: z.enum(["deal", "company"]),
        entityId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Decode base64 file data
      const buffer = Buffer.from(input.fileData, "base64");
      const fileSize = buffer.length;

      // Generate unique S3 key
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(7);
      const fileKey = `attachments/${ctx.user.id}/${input.entityType}/${input.entityId}/${timestamp}-${randomSuffix}-${input.fileName}`;

      // Upload to S3
      const { url } = await storagePut(fileKey, buffer, input.mimeType);

      // Save to database
      const result = await db.insert(attachments).values({
        fileName: input.fileName,
        fileKey,
        fileUrl: url,
        fileSize,
        mimeType: input.mimeType,
        entityType: input.entityType,
        entityId: input.entityId,
        ownerId: ctx.user.id,
      });

      const insertId = Number(result.insertId);

      return {
        id: insertId,
        fileName: input.fileName,
        fileUrl: url,
        fileSize,
        mimeType: input.mimeType,
      };
    }),

  // List attachments for an entity
  list: protectedProcedure
    .input(
      z.object({
        entityType: z.enum(["deal", "company"]),
        entityId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];

      const results = await db
        .select()
        .from(attachments)
        .where(
          and(
            eq(attachments.entityType, input.entityType),
            eq(attachments.entityId, input.entityId),
            eq(attachments.ownerId, ctx.user.id)
          )
        )
        .orderBy(attachments.createdAt);

      return results;
    }),

  // Delete attachment
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Get attachment to verify ownership
      const result = await db
        .select()
        .from(attachments)
        .where(and(eq(attachments.id, input.id), eq(attachments.ownerId, ctx.user.id)))
        .limit(1);

      if (result.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Attachment not found" });
      }

      // Delete from database
      await db.delete(attachments).where(eq(attachments.id, input.id));

      // Note: S3 file cleanup could be added here with storageDelete if needed
      // For now, we keep files in S3 for data retention

      return { success: true };
    }),
});
