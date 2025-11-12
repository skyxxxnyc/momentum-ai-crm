import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as notionIntegration from "../notion-integration";
import * as db from "../db";

export const notionRouter = router({
  // List available Notion tools
  listTools: protectedProcedure.query(async () => {
    try {
      return await notionIntegration.listNotionTools();
    } catch (error: any) {
      throw new Error(`Failed to list Notion tools: ${error.message}`);
    }
  }),

  // Search Notion
  search: protectedProcedure
    .input(z.object({ query: z.string() }))
    .mutation(async ({ input }) => {
      try {
        return await notionIntegration.searchNotion({ query: input.query });
      } catch (error: any) {
        throw new Error(`Failed to search Notion: ${error.message}`);
      }
    }),

  // Sync a single contact to Notion
  syncContact: protectedProcedure
    .input(
      z.object({
        contactId: z.number(),
        databaseId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const contact = await db.getContact(input.contactId);
      if (!contact || contact.ownerId !== ctx.user.id) {
        throw new Error("Contact not found or unauthorized");
      }

      return await notionIntegration.syncContactToNotion(contact, input.databaseId);
    }),

  // Sync a single company to Notion
  syncCompany: protectedProcedure
    .input(
      z.object({
        companyId: z.number(),
        databaseId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const company = await db.getCompany(input.companyId);
      if (!company || company.ownerId !== ctx.user.id) {
        throw new Error("Company not found or unauthorized");
      }

      return await notionIntegration.syncCompanyToNotion(company, input.databaseId);
    }),

  // Sync a single deal to Notion
  syncDeal: protectedProcedure
    .input(
      z.object({
        dealId: z.number(),
        databaseId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const deal = await db.getDeal(input.dealId);
      if (!deal || deal.ownerId !== ctx.user.id) {
        throw new Error("Deal not found or unauthorized");
      }

      return await notionIntegration.syncDealToNotion(deal, input.databaseId);
    }),

  // Batch sync contacts
  batchSyncContacts: protectedProcedure
    .input(
      z.object({
        contactIds: z.array(z.number()),
        databaseId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const contacts = await db.getContacts(ctx.user.id);
      const selectedContacts = contacts.filter((c: any) => input.contactIds.includes(c.id));

      return await notionIntegration.batchSyncToNotion(
        selectedContacts,
        "contact",
        input.databaseId
      );
    }),

  // Batch sync companies
  batchSyncCompanies: protectedProcedure
    .input(
      z.object({
        companyIds: z.array(z.number()),
        databaseId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const companies = await db.getCompanies(ctx.user.id);
      const selectedCompanies = companies.filter((c: any) => input.companyIds.includes(c.id));

      return await notionIntegration.batchSyncToNotion(
        selectedCompanies,
        "company",
        input.databaseId
      );
    }),

  // Batch sync deals
  batchSyncDeals: protectedProcedure
    .input(
      z.object({
        dealIds: z.array(z.number()),
        databaseId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const deals = await db.getDeals(ctx.user.id);
      const selectedDeals = deals.filter((d: any) => input.dealIds.includes(d.id));

      return await notionIntegration.batchSyncToNotion(selectedDeals, "deal", input.databaseId);
    }),

  // Sync all contacts
  syncAllContacts: protectedProcedure
    .input(z.object({ databaseId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const contacts = await db.getContacts(ctx.user.id);
      return await notionIntegration.batchSyncToNotion(contacts, "contact", input.databaseId);
    }),

  // Sync all companies
  syncAllCompanies: protectedProcedure
    .input(z.object({ databaseId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const companies = await db.getCompanies(ctx.user.id);
      return await notionIntegration.batchSyncToNotion(companies, "company", input.databaseId);
    }),

  // Sync all deals
  syncAllDeals: protectedProcedure
    .input(z.object({ databaseId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const deals = await db.getDeals(ctx.user.id);
      return await notionIntegration.batchSyncToNotion(deals, "deal", input.databaseId);
    }),
});
