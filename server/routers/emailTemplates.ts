import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { emailTemplates } from "../../drizzle/schema";

export const emailTemplatesRouter = router({
  // List all templates
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const result = await db
      .select()
      .from(emailTemplates)
      .where(eq(emailTemplates.ownerId, ctx.user.id))
      .orderBy(desc(emailTemplates.createdAt));

    return result;
  }),

  // Get a single template
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;

      const result = await db
        .select()
        .from(emailTemplates)
        .where(eq(emailTemplates.id, input.id))
        .limit(1);

      if (!result[0] || result[0].ownerId !== ctx.user.id) {
        return null;
      }

      return result[0];
    }),

  // Create a template
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        subject: z.string().min(1),
        body: z.string().min(1),
        category: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.insert(emailTemplates).values({
        ...input,
        ownerId: ctx.user.id,
      });

      return { id: result.insertId };
    }),

  // Update a template
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        subject: z.string().min(1).optional(),
        body: z.string().min(1).optional(),
        category: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify ownership
      const template = await db
        .select()
        .from(emailTemplates)
        .where(eq(emailTemplates.id, input.id))
        .limit(1);

      if (!template[0] || template[0].ownerId !== ctx.user.id) {
        throw new Error("Not authorized to update this template");
      }

      const updateData: any = { ...input };
      delete updateData.id;

      await db
        .update(emailTemplates)
        .set(updateData)
        .where(eq(emailTemplates.id, input.id));

      return { success: true };
    }),

  // Delete a template
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify ownership
      const template = await db
        .select()
        .from(emailTemplates)
        .where(eq(emailTemplates.id, input.id))
        .limit(1);

      if (!template[0] || template[0].ownerId !== ctx.user.id) {
        throw new Error("Not authorized to delete this template");
      }

      await db.delete(emailTemplates).where(eq(emailTemplates.id, input.id));

      return { success: true };
    }),
});
