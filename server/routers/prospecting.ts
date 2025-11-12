import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as prospecting from "../prospecting";
import * as db from "../db";
import { readFileSync } from "fs";
import { join } from "path";

// Load client one-pager content
const CLIENT_ONE_PAGER = readFileSync(
  join(__dirname, "../lead-gen-knowledge.md"),
  "utf-8"
);

export const prospectingRouter = router({
  // Run prospecting agent for an ICP
  runProspecting: protectedProcedure
    .input(
      z.object({
        icpId: z.number(),
        maxResults: z.number().optional().default(10),
        autoCreateCompanies: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Get ICP details
        const icp = await db.getICPById(input.icpId);
        if (!icp) {
          throw new Error("ICP not found");
        }

        // Run prospecting agent
        const prospects = await prospecting.runProspectingAgent(
          {
            id: icp.id,
            name: icp.name,
            industry: icp.industry || "General",
            businessType: icp.industry || "Business",
            location: icp.geography || "United States",
            employeeRange: icp.companySize || undefined,
            revenueRange: icp.revenue || undefined,
            painPoints: icp.painPoints || undefined,
            targetKeywords: icp.buyingSignals || undefined,
          },
          CLIENT_ONE_PAGER,
          input.maxResults
        );

        // Optionally auto-create companies in CRM
        if (input.autoCreateCompanies) {
          for (const prospect of prospects) {
            try {
                // Check if company already exists by searching
                const allCompanies = await db.getCompanies(ctx.user.id);
                const existing = allCompanies.find((c: any) => c.name.toLowerCase() === prospect.businessName.toLowerCase());
              if (!existing) {
                // Create new company
                await db.createCompany({
                  name: prospect.businessName,
                  industry: prospect.industry,
                  website: prospect.website || null,
                  phone: prospect.phone || null,
                  address: prospect.address || null,
                  city: prospect.location,
                  state: null,
                  country: null,
                  size: null,
                         description: `Prospected from ICP: ${icp.name}

${prospect.whyGoodFit?.join(" ") || ""}

Pain Points:
${prospect.painPoints?.join("\n") || ""}

Sales Opportunities:
${prospect.salesOpportunities?.join("\n") || ""}

Talking Points:
${prospect.talkingPoints?.join("\n") || ""}

Automation Opportunities:
${prospect.automationOpportunities?.join("\n") || ""}`,
                  ownerId: ctx.user.id,
                });
              }
            } catch (error) {
              console.error(`Failed to create company ${prospect.businessName}:`, error);
            }
          }
        }

        return {
          success: true,
          prospects,
          count: prospects.length,
        };
      } catch (error: any) {
        console.error("Prospecting failed:", error);
        return {
          success: false,
          error: error.message,
          prospects: [],
          count: 0,
        };
      }
    }),

  // Analyze a single business by URL or name
  analyzeBusiness: protectedProcedure
    .input(
      z.object({
        businessName: z.string(),
        website: z.string().optional(),
        industry: z.string().optional(),
        location: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const prospect: prospecting.ProspectingResult = {
          businessName: input.businessName,
          businessType: "Business",
          industry: input.industry || "General",
          location: input.location || "Unknown",
          website: input.website,
        };

        // Scrape website if provided
        let websiteData = {
          content: "",
          title: "",
          description: "",
          hasModernDesign: false,
          isMobileResponsive: false,
          loadTime: "N/A",
          hasSEO: false,
          socialLinks: [] as string[],
        };

        if (input.website) {
          websiteData = await prospecting.scrapeAndAnalyzeWebsite(input.website);
        }

        // AI analysis
        const analysis = await prospecting.analyzeBusinessWithAI(
          prospect,
          websiteData,
          {
            id: 0,
            name: "Manual Analysis",
            industry: input.industry || "General",
            businessType: "Business",
            location: input.location || "Unknown",
          },
          CLIENT_ONE_PAGER
        );

        return {
          success: true,
          analysis: { ...prospect, ...analysis },
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
        };
      }
    }),
});
