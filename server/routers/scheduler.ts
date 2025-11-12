import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { prospectingSchedules } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { scheduleProspectingJob, unscheduleProspectingJob, triggerProspectingRun } from "../scheduler";

export const schedulerRouter = router({
  // List all schedules for current user
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const schedules = await db
      .select()
      .from(prospectingSchedules)
      .where(eq(prospectingSchedules.ownerId, ctx.user.id));

    return schedules;
  }),

  // Get single schedule
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;

      const results = await db
        .select()
        .from(prospectingSchedules)
        .where(eq(prospectingSchedules.id, input.id))
        .limit(1);

      const schedule = results[0];
      if (!schedule || schedule.ownerId !== ctx.user.id) {
        return null;
      }

      return schedule;
    }),

  // Create schedule
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        icpId: z.number(),
        frequency: z.enum(["daily", "weekly", "monthly"]),
        maxResults: z.number().default(10),
        autoCreateCompanies: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Calculate next run time
      const now = new Date();
      const nextRun = new Date(now);
      switch (input.frequency) {
        case "daily":
          nextRun.setDate(nextRun.getDate() + 1);
          nextRun.setHours(9, 0, 0, 0);
          break;
        case "weekly":
          nextRun.setDate(nextRun.getDate() + 7);
          nextRun.setHours(9, 0, 0, 0);
          break;
        case "monthly":
          nextRun.setMonth(nextRun.getMonth() + 1);
          nextRun.setDate(1);
          nextRun.setHours(9, 0, 0, 0);
          break;
      }

      const result = await db.insert(prospectingSchedules).values({
        name: input.name,
        icpId: input.icpId,
        frequency: input.frequency,
        maxResults: input.maxResults,
        autoCreateCompanies: input.autoCreateCompanies ? 1 : 0,
        isActive: 1,
        nextRunAt: nextRun,
        ownerId: ctx.user.id,
      });

      const scheduleId = Number((result as any).insertId);

      // Load the created schedule and start the cron job
      const schedules = await db
        .select()
        .from(prospectingSchedules)
        .where(eq(prospectingSchedules.id, scheduleId))
        .limit(1);

      if (schedules[0]) {
        scheduleProspectingJob(schedules[0]);
      }

      return { id: scheduleId, success: true };
    }),

  // Update schedule
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        frequency: z.enum(["daily", "weekly", "monthly"]).optional(),
        maxResults: z.number().optional(),
        autoCreateCompanies: z.boolean().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify ownership
      const existing = await db
        .select()
        .from(prospectingSchedules)
        .where(eq(prospectingSchedules.id, input.id))
        .limit(1);

      if (!existing[0] || existing[0].ownerId !== ctx.user.id) {
        throw new Error("Schedule not found or unauthorized");
      }

      const updates: any = {};
      if (input.name !== undefined) updates.name = input.name;
      if (input.frequency !== undefined) updates.frequency = input.frequency;
      if (input.maxResults !== undefined) updates.maxResults = input.maxResults;
      if (input.autoCreateCompanies !== undefined)
        updates.autoCreateCompanies = input.autoCreateCompanies ? 1 : 0;
      if (input.isActive !== undefined) updates.isActive = input.isActive ? 1 : 0;

      await db.update(prospectingSchedules).set(updates).where(eq(prospectingSchedules.id, input.id));

      // Reload schedule and reschedule
      const updated = await db
        .select()
        .from(prospectingSchedules)
        .where(eq(prospectingSchedules.id, input.id))
        .limit(1);

      if (updated[0]) {
        if (updated[0].isActive === 1) {
          scheduleProspectingJob(updated[0]);
        } else {
          unscheduleProspectingJob(input.id);
        }
      }

      return { success: true };
    }),

  // Delete schedule
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify ownership
      const existing = await db
        .select()
        .from(prospectingSchedules)
        .where(eq(prospectingSchedules.id, input.id))
        .limit(1);

      if (!existing[0] || existing[0].ownerId !== ctx.user.id) {
        throw new Error("Schedule not found or unauthorized");
      }

      // Unschedule the job
      unscheduleProspectingJob(input.id);

      // Delete from database
      await db.delete(prospectingSchedules).where(eq(prospectingSchedules.id, input.id));

      return { success: true };
    }),

  // Manually trigger a run
  triggerRun: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify ownership
      const existing = await db
        .select()
        .from(prospectingSchedules)
        .where(eq(prospectingSchedules.id, input.id))
        .limit(1);

      if (!existing[0] || existing[0].ownerId !== ctx.user.id) {
        throw new Error("Schedule not found or unauthorized");
      }

      // Trigger the run
      await triggerProspectingRun(input.id);

      return { success: true };
    }),
});
