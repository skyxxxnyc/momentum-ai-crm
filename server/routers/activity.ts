import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { activity_log, users } from "../../drizzle/schema";

export const activityRouter = router({
  // Get recent activities for the feed
  recent: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const limit = input?.limit || 20;

      const activities = await db
        .select({
          id: activity_log.id,
          userId: activity_log.userId,
          userName: users.name,
          userAvatar: users.avatar,
          action: activity_log.action,
          entityType: activity_log.entityType,
          entityId: activity_log.entityId,
          entityName: activity_log.entityName,
          description: activity_log.description,
          metadata: activity_log.metadata,
          createdAt: activity_log.createdAt,
        })
        .from(activity_log)
        .leftJoin(users, eq(activity_log.userId, users.id))
        .orderBy(desc(activity_log.createdAt))
        .limit(limit);

      return activities;
    }),

  // Get activities for a specific entity
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

      const activities = await db
        .select({
          id: activity_log.id,
          userId: activity_log.userId,
          userName: users.name,
          userAvatar: users.avatar,
          action: activity_log.action,
          entityType: activity_log.entityType,
          entityId: activity_log.entityId,
          entityName: activity_log.entityName,
          description: activity_log.description,
          metadata: activity_log.metadata,
          createdAt: activity_log.createdAt,
        })
        .from(activity_log)
        .leftJoin(users, eq(activity_log.userId, users.id))
        .where(eq(activity_log.entityType, input.entityType))
        .where(eq(activity_log.entityId, input.entityId))
        .orderBy(desc(activity_log.createdAt));

      return activities;
    }),
});
