import { desc, eq, and } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { emailThreads, emailMessages, contacts, users } from "../../drizzle/schema";

export const emailTrackingRouter = router({
  // Get email threads for a contact
  byContact: protectedProcedure
    .input(z.object({ contactId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const threads = await db
        .select({
          id: emailThreads.id,
          contactId: emailThreads.contactId,
          subject: emailThreads.subject,
          lastMessageAt: emailThreads.lastMessageAt,
          createdAt: emailThreads.createdAt,
        })
        .from(emailThreads)
        .where(eq(emailThreads.contactId, input.contactId))
        .orderBy(desc(emailThreads.lastMessageAt));

      return threads;
    }),

  // Get messages in a thread
  threadMessages: protectedProcedure
    .input(z.object({ threadId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const messages = await db
        .select({
          id: emailMessages.id,
          threadId: emailMessages.threadId,
          fromEmail: emailMessages.fromEmail,
          toEmail: emailMessages.toEmail,
          subject: emailMessages.subject,
          body: emailMessages.body,
          direction: emailMessages.direction,
          status: emailMessages.status,
          openedAt: emailMessages.openedAt,
          clickedAt: emailMessages.clickedAt,
          sentBy: emailMessages.sentBy,
          senderName: users.name,
          createdAt: emailMessages.createdAt,
        })
        .from(emailMessages)
        .leftJoin(users, eq(emailMessages.sentBy, users.id))
        .where(eq(emailMessages.threadId, input.threadId))
        .orderBy(emailMessages.createdAt);

      return messages;
    }),

  // Send an email (creates thread and message)
  send: protectedProcedure
    .input(
      z.object({
        contactId: z.number(),
        toEmail: z.string().email(),
        subject: z.string().min(1),
        body: z.string().min(1),
        threadId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let threadId = input.threadId;

      // Create new thread if not provided
      if (!threadId) {
        const threadResult = await db.insert(emailThreads).values({
          contactId: input.contactId,
          subject: input.subject,
          lastMessageAt: new Date(),
        });
        threadId = threadResult.insertId;
      } else {
        // Update last message time
        await db
          .update(emailThreads)
          .set({ lastMessageAt: new Date() })
          .where(eq(emailThreads.id, threadId));
      }

      // Create message
      const messageResult = await db.insert(emailMessages).values({
        threadId,
        fromEmail: ctx.user.email || "noreply@siacrm.com",
        toEmail: input.toEmail,
        subject: input.subject,
        body: input.body,
        direction: "outbound",
        status: "sent",
        sentBy: ctx.user.id,
      });

      return { threadId, messageId: messageResult.insertId };
    }),

  // Track email open
  trackOpen: protectedProcedure
    .input(z.object({ messageId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(emailMessages)
        .set({ 
          status: "opened",
          openedAt: new Date() 
        })
        .where(eq(emailMessages.id, input.messageId));

      return { success: true };
    }),

  // Track email click
  trackClick: protectedProcedure
    .input(z.object({ messageId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(emailMessages)
        .set({ 
          status: "clicked",
          clickedAt: new Date() 
        })
        .where(eq(emailMessages.id, input.messageId));

      return { success: true };
    }),
});
