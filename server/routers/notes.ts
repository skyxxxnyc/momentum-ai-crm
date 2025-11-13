import { desc, eq, and } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { notes, users } from "../../drizzle/schema";

export const notesRouter = router({
  // Get notes for a specific entity
  byEntity: protectedProcedure
    .input(
      z.object({
        entityType: z.string(),
        entityId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const result = await db
        .select({
          id: notes.id,
          userId: notes.userId,
          userName: users.name,
          userAvatar: users.avatar,
          entityType: notes.entityType,
          entityId: notes.entityId,
          content: notes.content,
          createdAt: notes.createdAt,
          updatedAt: notes.updatedAt,
        })
        .from(notes)
        .leftJoin(users, eq(notes.userId, users.id))
        .where(
          and(
            eq(notes.entityType, input.entityType),
            eq(notes.entityId, input.entityId)
          )
        )
        .orderBy(desc(notes.createdAt));

      return result;
    }),

  // Create a note
  create: protectedProcedure
    .input(
      z.object({
        entityType: z.string(),
        entityId: z.number(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.insert(notes).values({
        userId: ctx.user.id,
        entityType: input.entityType,
        entityId: input.entityId,
        content: input.content,
      });

      return { id: result.insertId };
    }),

  // Update a note
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify ownership
      const note = await db
        .select()
        .from(notes)
        .where(eq(notes.id, input.id))
        .limit(1);

      if (!note[0] || note[0].userId !== ctx.user.id) {
        throw new Error("Not authorized to update this note");
      }

      await db
        .update(notes)
        .set({ content: input.content })
        .where(eq(notes.id, input.id));

      return { success: true };
    }),

  // Delete a note
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify ownership
      const note = await db
        .select()
        .from(notes)
        .where(eq(notes.id, input.id))
        .limit(1);

      if (!note[0] || note[0].userId !== ctx.user.id) {
        throw new Error("Not authorized to delete this note");
      }

      await db.delete(notes).where(eq(notes.id, input.id));

      return { success: true };
    }),
});
