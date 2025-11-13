import { z } from "zod";
import { eq, desc, and, like, or } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { sequenceTemplates, emailSequenceSteps, emailSequences } from "../../drizzle/schema";
import { TRPCError } from "@trpc/server";

export const sequenceTemplatesRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        category: z.string().optional(),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const conditions = [eq(sequenceTemplates.createdBy, ctx.user.id)];
      
      if (input?.category) {
        conditions.push(eq(sequenceTemplates.category, input.category));
      }
      
      if (input?.search) {
        conditions.push(
          or(
            like(sequenceTemplates.name, `%${input.search}%`),
            like(sequenceTemplates.description, `%${input.search}%`)
          )!
        );
      }

      const templates = await db
        .select()
        .from(sequenceTemplates)
        .where(and(...conditions))
        .orderBy(desc(sequenceTemplates.createdAt));

      return templates;
    }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [template] = await db
        .select()
        .from(sequenceTemplates)
        .where(eq(sequenceTemplates.id, input.id))
        .limit(1);

      if (!template) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
      }

      if (template.createdBy !== ctx.user.id && !template.isPublic) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      return template;
    }),

  saveFromSequence: protectedProcedure
    .input(
      z.object({
        sequenceId: z.number(),
        name: z.string().min(1),
        description: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Get sequence and its steps
      const [sequence] = await db
        .select()
        .from(emailSequences)
        .where(eq(emailSequences.id, input.sequenceId))
        .limit(1);

      if (!sequence) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Sequence not found" });
      }

      const steps = await db
        .select()
        .from(emailSequenceSteps)
        .where(eq(emailSequenceSteps.sequenceId, input.sequenceId))
        .orderBy(emailSequenceSteps.stepNumber);

      if (steps.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot save template from sequence with no steps" });
      }

      // Create template
      const [template] = await db
        .insert(sequenceTemplates)
        .values({
          name: input.name,
          description: input.description || sequence.description,
          category: input.category,
          tags: input.tags,
          steps: steps.map(step => ({
            stepNumber: step.stepNumber,
            subject: step.subject,
            body: step.body,
            delayDays: step.delayDays,
          })),
          createdBy: ctx.user.id,
          usageCount: 0,
        });

      return { id: template.insertId };
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        steps: z.array(
          z.object({
            stepNumber: z.number(),
            subject: z.string(),
            body: z.string(),
            delayDays: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [template] = await db
        .insert(sequenceTemplates)
        .values({
          name: input.name,
          description: input.description,
          category: input.category,
          tags: input.tags,
          steps: input.steps,
          createdBy: ctx.user.id,
          usageCount: 0,
        });

      return { id: template.insertId };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [template] = await db
        .select()
        .from(sequenceTemplates)
        .where(eq(sequenceTemplates.id, input.id))
        .limit(1);

      if (!template) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
      }

      if (template.createdBy !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      await db
        .update(sequenceTemplates)
        .set({
          name: input.name,
          description: input.description,
          category: input.category,
          tags: input.tags,
        })
        .where(eq(sequenceTemplates.id, input.id));

      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [template] = await db
        .select()
        .from(sequenceTemplates)
        .where(eq(sequenceTemplates.id, input.id))
        .limit(1);

      if (!template) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
      }

      if (template.createdBy !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      await db
        .delete(sequenceTemplates)
        .where(eq(sequenceTemplates.id, input.id));

      return { success: true };
    }),

  cloneToSequence: protectedProcedure
    .input(
      z.object({
        templateId: z.number(),
        name: z.string().min(1),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Get template
      const [template] = await db
        .select()
        .from(sequenceTemplates)
        .where(eq(sequenceTemplates.id, input.templateId))
        .limit(1);

      if (!template) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
      }

      if (template.createdBy !== ctx.user.id && !template.isPublic) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      // Create new sequence
      const [sequence] = await db
        .insert(emailSequences)
        .values({
          name: input.name,
          description: input.description || template.description,
          status: "draft",
          createdBy: ctx.user.id,
        });

      const sequenceId = sequence.insertId;

      // Create steps from template
      const steps = template.steps as Array<{
        stepNumber: number;
        subject: string;
        body: string;
        delayDays: number;
      }>;

      for (const step of steps) {
        await db.insert(emailSequenceSteps).values({
          sequenceId,
          stepNumber: step.stepNumber,
          subject: step.subject,
          body: step.body,
          delayDays: step.delayDays,
        });
      }

      // Increment usage count
      await db
        .update(sequenceTemplates)
        .set({
          usageCount: (template.usageCount || 0) + 1,
        })
        .where(eq(sequenceTemplates.id, input.templateId));

      return { id: sequenceId };
    }),

  categories: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const templates = await db
      .select({ category: sequenceTemplates.category })
      .from(sequenceTemplates)
      .where(eq(sequenceTemplates.createdBy, ctx.user.id));

    const categories = [...new Set(templates.map(t => t.category).filter(Boolean))];
    return categories;
  }),
});
