import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as dbNotifications from "../db-notifications";
import { sendNotificationToUser } from "../websocket";

export const notificationsRouter = router({
  // Get all notifications for current user
  list: protectedProcedure.query(async ({ ctx }) => {
    return dbNotifications.getUserNotifications(ctx.user.id);
  }),

  // Get unread notifications
  unread: protectedProcedure.query(async ({ ctx }) => {
    return dbNotifications.getUnreadNotifications(ctx.user.id);
  }),

  // Get unread count
  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    return dbNotifications.getUnreadCount(ctx.user.id);
  }),

  // Mark notification as read
  markAsRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await dbNotifications.markNotificationAsRead(input.id, ctx.user.id);
      return { success: true };
    }),

  // Mark all as read
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    await dbNotifications.markAllNotificationsAsRead(ctx.user.id);
    return { success: true };
  }),

  // Delete notification
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await dbNotifications.deleteNotification(input.id, ctx.user.id);
      return { success: true };
    }),

  // Create test notification (for development)
  createTest: protectedProcedure
    .input(
      z.object({
        type: z.enum(["stale_deal", "hot_lead", "task_due", "ai_suggestion", "system"]),
        title: z.string(),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const notification = await dbNotifications.createNotification({
        userId: ctx.user.id,
        type: input.type,
        title: input.title,
        message: input.message || null,
        isRead: false,
        createdAt: new Date(),
      });

      // Send real-time notification
      sendNotificationToUser(ctx.user.id, {
        id: String(notification.insertId),
        type: input.type as any,
        title: input.title,
        message: input.message || "",
        userId: ctx.user.id,
        createdAt: new Date(),
        read: false,
      });

      return { success: true, notification };
    }),
});
