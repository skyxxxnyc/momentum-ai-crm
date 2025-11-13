import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { contacts, companies, deals, leads } from "../../drizzle/schema";
import { eq, inArray, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { sendEmail } from "../email";

export const bulkRouter = router({
  // Bulk email to contacts
  bulkEmailContacts: protectedProcedure
    .input(
      z.object({
        contactIds: z.array(z.number()),
        subject: z.string(),
        body: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Get contacts
      const contactList = await db
        .select()
        .from(contacts)
        .where(and(inArray(contacts.id, input.contactIds), eq(contacts.ownerId, ctx.user.id)));

      if (contactList.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No contacts found" });
      }

      // Send emails
      const results = await Promise.allSettled(
        contactList.map(async (contact) => {
          if (!contact.email) return { success: false, contact: contact.id };

          try {
            await sendEmail({
              to: contact.email,
              subject: input.subject,
              body: input.body,
            });
            return { success: true, contact: contact.id };
          } catch (error) {
            return { success: false, contact: contact.id };
          }
        })
      );

      const successful = results.filter((r) => r.status === "fulfilled" && r.value.success).length;

      return {
        total: contactList.length,
        successful,
        failed: contactList.length - successful,
      };
    }),

  // Bulk update deal status
  bulkUpdateDeals: protectedProcedure
    .input(
      z.object({
        dealIds: z.array(z.number()),
        updates: z.object({
          stage: z.string().optional(),
          probability: z.number().optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Update deals
      await db
        .update(deals)
        .set(input.updates)
        .where(and(inArray(deals.id, input.dealIds), eq(deals.ownerId, ctx.user.id)));

      return { success: true, updated: input.dealIds.length };
    }),

  // Bulk update lead status
  bulkUpdateLeads: protectedProcedure
    .input(
      z.object({
        leadIds: z.array(z.number()),
        updates: z.object({
          status: z.string().optional(),
          score: z.number().optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Update leads
      await db
        .update(leads)
        .set(input.updates)
        .where(and(inArray(leads.id, input.leadIds), eq(leads.ownerId, ctx.user.id)));

      return { success: true, updated: input.leadIds.length };
    }),

  // Bulk delete contacts
  bulkDeleteContacts: protectedProcedure
    .input(z.object({ contactIds: z.array(z.number()) }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db
        .delete(contacts)
        .where(and(inArray(contacts.id, input.contactIds), eq(contacts.ownerId, ctx.user.id)));

      return { success: true, deleted: input.contactIds.length };
    }),

  // Bulk delete deals
  bulkDeleteDeals: protectedProcedure
    .input(z.object({ dealIds: z.array(z.number()) }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db
        .delete(deals)
        .where(and(inArray(deals.id, input.dealIds), eq(deals.ownerId, ctx.user.id)));

      return { success: true, deleted: input.dealIds.length };
    }),

  // Bulk delete leads
  bulkDeleteLeads: protectedProcedure
    .input(z.object({ leadIds: z.array(z.number()) }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db
        .delete(leads)
        .where(and(inArray(leads.id, input.leadIds), eq(leads.ownerId, ctx.user.id)));

      return { success: true, deleted: input.leadIds.length };
    }),

  // Bulk tag assignment for contacts
  bulkTagContacts: protectedProcedure
    .input(
      z.object({
        contactIds: z.array(z.number()),
        tags: z.string(), // JSON string of tags array
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db
        .update(contacts)
        .set({ tags: input.tags })
        .where(and(inArray(contacts.id, input.contactIds), eq(contacts.ownerId, ctx.user.id)));

      return { success: true, updated: input.contactIds.length };
    }),
});
