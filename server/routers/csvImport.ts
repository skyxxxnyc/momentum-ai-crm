import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { parse } from "csv-parse/sync";
import { getDb } from "../db";
import { contacts, companies } from "../../drizzle/schema";
import { eq, or } from "drizzle-orm";

// CSV field mapping schemas
const contactFieldMapping = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  title: z.string().optional(),
  company: z.string().optional(),
  status: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
});

const companyFieldMapping = z.object({
  name: z.string().optional(),
  website: z.string().optional(),
  industry: z.string().optional(),
  size: z.string().optional(),
  location: z.string().optional(),
  revenue: z.string().optional(),
  description: z.string().optional(),
});

export const csvImportRouter = router({
  // Parse CSV and return preview
  parseCSV: protectedProcedure
    .input(
      z.object({
        csvContent: z.string(),
        entityType: z.enum(["contacts", "companies"]),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const records = parse(input.csvContent, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
        });

        if (!records || records.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "CSV file is empty or invalid",
          });
        }

        // Get available columns from first row
        const columns = Object.keys(records[0]);

        return {
          success: true,
          columns,
          rowCount: records.length,
          preview: records.slice(0, 5), // First 5 rows for preview
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Failed to parse CSV: ${error.message}`,
        });
      }
    }),

  // Import contacts from CSV
  importContacts: protectedProcedure
    .input(
      z.object({
        csvContent: z.string(),
        fieldMapping: contactFieldMapping,
        skipDuplicates: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      try {
        const records = parse(input.csvContent, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
        });

        let imported = 0;
        let skipped = 0;
        let errors: string[] = [];

        for (const record of records) {
          try {
            // Map CSV columns to contact fields
            const contactData: any = {
              userId: ctx.user.id,
            };

            if (input.fieldMapping.name && record[input.fieldMapping.name]) {
              contactData.name = record[input.fieldMapping.name];
            }
            if (input.fieldMapping.email && record[input.fieldMapping.email]) {
              contactData.email = record[input.fieldMapping.email];
            }
            if (input.fieldMapping.phone && record[input.fieldMapping.phone]) {
              contactData.phone = record[input.fieldMapping.phone];
            }
            if (input.fieldMapping.title && record[input.fieldMapping.title]) {
              contactData.title = record[input.fieldMapping.title];
            }
            if (input.fieldMapping.company && record[input.fieldMapping.company]) {
              contactData.company = record[input.fieldMapping.company];
            }
            if (input.fieldMapping.status && record[input.fieldMapping.status]) {
              contactData.status = record[input.fieldMapping.status];
            }
            if (input.fieldMapping.source && record[input.fieldMapping.source]) {
              contactData.source = record[input.fieldMapping.source];
            }
            if (input.fieldMapping.notes && record[input.fieldMapping.notes]) {
              contactData.notes = record[input.fieldMapping.notes];
            }

            // Validate required fields
            if (!contactData.name) {
              errors.push(`Skipped row: Missing name`);
              skipped++;
              continue;
            }

            // Check for duplicates
            if (input.skipDuplicates && contactData.email) {
              const existing = await db
                .select()
                .from(contacts)
                .where(eq(contacts.email, contactData.email))
                .limit(1);

              if (existing.length > 0) {
                skipped++;
                continue;
              }
            }

            // Insert contact
            await db.insert(contacts).values(contactData);
            imported++;
          } catch (error: any) {
            errors.push(`Error importing row: ${error.message}`);
            skipped++;
          }
        }

        return {
          success: true,
          imported,
          skipped,
          total: records.length,
          errors: errors.slice(0, 10), // Return first 10 errors
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Import failed: ${error.message}`,
        });
      }
    }),

  // Import companies from CSV
  importCompanies: protectedProcedure
    .input(
      z.object({
        csvContent: z.string(),
        fieldMapping: companyFieldMapping,
        skipDuplicates: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      try {
        const records = parse(input.csvContent, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
        });

        let imported = 0;
        let skipped = 0;
        let errors: string[] = [];

        for (const record of records) {
          try {
            // Map CSV columns to company fields
            const companyData: any = {
              userId: ctx.user.id,
            };

            if (input.fieldMapping.name && record[input.fieldMapping.name]) {
              companyData.name = record[input.fieldMapping.name];
            }
            if (input.fieldMapping.website && record[input.fieldMapping.website]) {
              companyData.website = record[input.fieldMapping.website];
            }
            if (input.fieldMapping.industry && record[input.fieldMapping.industry]) {
              companyData.industry = record[input.fieldMapping.industry];
            }
            if (input.fieldMapping.size && record[input.fieldMapping.size]) {
              companyData.size = record[input.fieldMapping.size];
            }
            if (input.fieldMapping.location && record[input.fieldMapping.location]) {
              companyData.location = record[input.fieldMapping.location];
            }
            if (input.fieldMapping.revenue && record[input.fieldMapping.revenue]) {
              companyData.revenue = record[input.fieldMapping.revenue];
            }
            if (input.fieldMapping.description && record[input.fieldMapping.description]) {
              companyData.description = record[input.fieldMapping.description];
            }

            // Validate required fields
            if (!companyData.name) {
              errors.push(`Skipped row: Missing company name`);
              skipped++;
              continue;
            }

            // Check for duplicates
            if (input.skipDuplicates) {
              const whereConditions = [];
              if (companyData.name) {
                whereConditions.push(eq(companies.name, companyData.name));
              }
              if (companyData.website) {
                whereConditions.push(eq(companies.website, companyData.website));
              }

              if (whereConditions.length > 0) {
                const existing = await db
                  .select()
                  .from(companies)
                  .where(or(...whereConditions))
                  .limit(1);

                if (existing.length > 0) {
                  skipped++;
                  continue;
                }
              }
            }

            // Insert company
            await db.insert(companies).values(companyData);
            imported++;
          } catch (error: any) {
            errors.push(`Error importing row: ${error.message}`);
            skipped++;
          }
        }

        return {
          success: true,
          imported,
          skipped,
          total: records.length,
          errors: errors.slice(0, 10), // Return first 10 errors
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Import failed: ${error.message}`,
        });
      }
    }),
});
