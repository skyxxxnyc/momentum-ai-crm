import { desc, eq, and, sql } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  emailSequences,
  emailSequenceSteps,
  emailSequenceEnrollments,
  contacts,
  emailMessages,
} from "../../drizzle/schema";

export const emailSequencesRouter = router({
  // List all sequences
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const result = await db
      .select()
      .from(emailSequences)
      .where(eq(emailSequences.ownerId, ctx.user.id))
      .orderBy(desc(emailSequences.createdAt));

    return result;
  }),

  // Get a single sequence with steps
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;

      const sequence = await db
        .select()
        .from(emailSequences)
        .where(eq(emailSequences.id, input.id))
        .limit(1);

      if (!sequence[0] || sequence[0].ownerId !== ctx.user.id) {
        return null;
      }

      const steps = await db
        .select()
        .from(emailSequenceSteps)
        .where(eq(emailSequenceSteps.sequenceId, input.id))
        .orderBy(emailSequenceSteps.stepNumber);

      return { ...sequence[0], steps };
    }),

  // Get sequence analytics
  analytics: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;

      // Verify ownership
      const sequence = await db
        .select()
        .from(emailSequences)
        .where(eq(emailSequences.id, input.id))
        .limit(1);

      if (!sequence[0] || sequence[0].ownerId !== ctx.user.id) {
        return null;
      }

      // Get enrollment stats
      const enrollments = await db
        .select({
          status: emailSequenceEnrollments.status,
          count: sql<number>`count(*)`,
        })
        .from(emailSequenceEnrollments)
        .where(eq(emailSequenceEnrollments.sequenceId, input.id))
        .groupBy(emailSequenceEnrollments.status);

      // Get email performance stats
      const emailStats = await db
        .select({
          total: sql<number>`count(*)`,
          opened: sql<number>`sum(case when ${emailMessages.status} = 'opened' then 1 else 0 end)`,
          clicked: sql<number>`sum(case when ${emailMessages.status} = 'clicked' then 1 else 0 end)`,
        })
        .from(emailMessages)
        .leftJoin(
          emailSequenceEnrollments,
          eq(emailMessages.threadId, emailSequenceEnrollments.id)
        )
        .where(eq(emailSequenceEnrollments.sequenceId, input.id));

      const stats = emailStats[0] || { total: 0, opened: 0, clicked: 0 };
      const openRate = stats.total > 0 ? (Number(stats.opened) / Number(stats.total)) * 100 : 0;
      const clickRate = stats.total > 0 ? (Number(stats.clicked) / Number(stats.total)) * 100 : 0;

      return {
        enrollments: enrollments.reduce((acc, e) => {
          acc[e.status] = Number(e.count);
          return acc;
        }, {} as Record<string, number>),
        emailsSent: Number(stats.total),
        openRate: Math.round(openRate * 10) / 10,
        clickRate: Math.round(clickRate * 10) / 10,
      };
    }),

  // Create a sequence
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        status: z.enum(["active", "paused", "archived"]).default("paused"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.insert(emailSequences).values({
        ...input,
        ownerId: ctx.user.id,
      });

      return { id: result.insertId };
    }),

  // Update a sequence
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        status: z.enum(["active", "paused", "archived"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify ownership
      const sequence = await db
        .select()
        .from(emailSequences)
        .where(eq(emailSequences.id, input.id))
        .limit(1);

      if (!sequence[0] || sequence[0].ownerId !== ctx.user.id) {
        throw new Error("Not authorized");
      }

      const updateData: any = { ...input };
      delete updateData.id;

      await db
        .update(emailSequences)
        .set(updateData)
        .where(eq(emailSequences.id, input.id));

      return { success: true };
    }),

  // Delete a sequence
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify ownership
      const sequence = await db
        .select()
        .from(emailSequences)
        .where(eq(emailSequences.id, input.id))
        .limit(1);

      if (!sequence[0] || sequence[0].ownerId !== ctx.user.id) {
        throw new Error("Not authorized");
      }

      // Delete steps and enrollments first
      await db.delete(emailSequenceSteps).where(eq(emailSequenceSteps.sequenceId, input.id));
      await db
        .delete(emailSequenceEnrollments)
        .where(eq(emailSequenceEnrollments.sequenceId, input.id));
      await db.delete(emailSequences).where(eq(emailSequences.id, input.id));

      return { success: true };
    }),

  // Add a step to sequence
  addStep: protectedProcedure
    .input(
      z.object({
        sequenceId: z.number(),
        subject: z.string().min(1),
        body: z.string().min(1),
        delayDays: z.number().min(0).default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify ownership
      const sequence = await db
        .select()
        .from(emailSequences)
        .where(eq(emailSequences.id, input.sequenceId))
        .limit(1);

      if (!sequence[0] || sequence[0].ownerId !== ctx.user.id) {
        throw new Error("Not authorized");
      }

      // Get next step number
      const steps = await db
        .select()
        .from(emailSequenceSteps)
        .where(eq(emailSequenceSteps.sequenceId, input.sequenceId))
        .orderBy(desc(emailSequenceSteps.stepNumber))
        .limit(1);

      const stepNumber = steps[0] ? steps[0].stepNumber + 1 : 1;

      const result = await db.insert(emailSequenceSteps).values({
        sequenceId: input.sequenceId,
        stepNumber,
        subject: input.subject,
        body: input.body,
        delayDays: input.delayDays,
      });

      return { id: result.insertId, stepNumber };
    }),

  // Update a step
  updateStep: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        subject: z.string().min(1).optional(),
        body: z.string().min(1).optional(),
        delayDays: z.number().min(0).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const updateData: any = { ...input };
      delete updateData.id;

      await db
        .update(emailSequenceSteps)
        .set(updateData)
        .where(eq(emailSequenceSteps.id, input.id));

      return { success: true };
    }),

  // Delete a step
  deleteStep: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(emailSequenceSteps).where(eq(emailSequenceSteps.id, input.id));

      return { success: true };
    }),

  // Enroll a contact in sequence
  enrollContact: protectedProcedure
    .input(
      z.object({
        sequenceId: z.number(),
        contactId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if already enrolled
      const existing = await db
        .select()
        .from(emailSequenceEnrollments)
        .where(
          and(
            eq(emailSequenceEnrollments.sequenceId, input.sequenceId),
            eq(emailSequenceEnrollments.contactId, input.contactId)
          )
        )
        .limit(1);

      if (existing[0]) {
        throw new Error("Contact already enrolled in this sequence");
      }

      const result = await db.insert(emailSequenceEnrollments).values({
        sequenceId: input.sequenceId,
        contactId: input.contactId,
        currentStep: 0,
        status: "active",
      });

      return { id: result.insertId };
    }),

  // Get enrollments for a sequence
  enrollments: protectedProcedure
    .input(z.object({ sequenceId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const result = await db
        .select({
          id: emailSequenceEnrollments.id,
          contactId: emailSequenceEnrollments.contactId,
          contactName: sql<string>`CONCAT(${contacts.firstName}, ' ', ${contacts.lastName})`,
          contactEmail: contacts.email,
          currentStep: emailSequenceEnrollments.currentStep,
          status: emailSequenceEnrollments.status,
          enrolledAt: emailSequenceEnrollments.enrolledAt,
          completedAt: emailSequenceEnrollments.completedAt,
        })
        .from(emailSequenceEnrollments)
        .leftJoin(contacts, eq(emailSequenceEnrollments.contactId, contacts.id))
        .where(eq(emailSequenceEnrollments.sequenceId, input.sequenceId))
        .orderBy(desc(emailSequenceEnrollments.enrolledAt));

      return result;
    }),

  // Unenroll a contact
  unenroll: protectedProcedure
    .input(z.object({ enrollmentId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(emailSequenceEnrollments)
        .set({ status: "unsubscribed" })
        .where(eq(emailSequenceEnrollments.id, input.enrollmentId));

      return { success: true };
    }),
});
