import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import * as db from "../db";
import { getDb } from "../db";
import { knowledgeArticles } from "../../drizzle/schema";
import { readFileSync } from "fs";
import { join } from "path";

// Helper function to search knowledge base and build context
async function getKnowledgeContext(query: string, limit: number = 3): Promise<string> {
  try {
    const database = await getDb();
    if (!database) return "";

    const searchLower = query.toLowerCase();
    const results = await database.select().from(knowledgeArticles);

    // Score and filter relevant articles
    const scored = results
      .map((article) => {
        let score = 0;
        const titleLower = article.title.toLowerCase();
        const contentLower = article.content.toLowerCase();

        if (titleLower.includes(searchLower)) score += 10;
        const contentMatches = (contentLower.match(new RegExp(searchLower, "g")) || []).length;
        score += contentMatches;
        if (article.tags && article.tags.toLowerCase().includes(searchLower)) score += 5;

        return { ...article, score };
      })
      .filter((a) => a.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    if (scored.length === 0) return "";

    // Build context string with relevant excerpts
    let context = "\n\n=== Relevant Knowledge Base Context ===\n";
    for (const article of scored) {
      // Try to read full content from file if available
      let content = article.content;
      if (article.filePath) {
        try {
          const fullPath = join(process.cwd(), article.filePath);
          content = readFileSync(fullPath, "utf-8");
        } catch (e) {
          // Fall back to stored content
        }
      }

      // Extract relevant excerpt (first 1000 chars)
      const excerpt = content.substring(0, 1000);
      context += `\n[${article.title}]\n${excerpt}...\n`;
    }

    return context;
  } catch (error) {
    console.error("Error fetching knowledge context:", error);
    return "";
  }
}

export const aiRouter = router({
  // Calculate momentum score for a deal
  calculateMomentumScore: protectedProcedure
    .input(z.object({ dealId: z.number() }))
    .mutation(async ({ input }) => {
      const deal = await db.getDealById(input.dealId);
      if (!deal) throw new Error("Deal not found");

      // Calculate momentum based on multiple factors
      let score = 50; // Base score

      // Recent activity increases momentum
      const activities = await db.getActivitiesByDeal(input.dealId);
      const recentActivities = activities.filter(
        (a) => a.createdAt && new Date(a.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
      );
      score += Math.min(recentActivities.length * 5, 25);

      // Stage progression
      const stageScores: Record<string, number> = {
        lead: 10,
        qualified: 30,
        proposal: 50,
        negotiation: 70,
        closed_won: 100,
        closed_lost: 0,
      };
      score = (score + (stageScores[deal.stage] || 50)) / 2;

      // Time since last update affects momentum negatively
      if (deal.updatedAt) {
        const daysSinceUpdate = (Date.now() - new Date(deal.updatedAt).getTime()) / (24 * 60 * 60 * 1000);
        if (daysSinceUpdate > 14) score -= 20;
        else if (daysSinceUpdate > 7) score -= 10;
      }

      score = Math.max(0, Math.min(100, Math.round(score)));

      await db.updateDeal(input.dealId, { momentumScore: score });
      return { score };
    }),

  // Generate revenue forecast
  generateForecast: protectedProcedure
    .input(z.object({ months: z.number().default(6) }))
    .query(async ({ input, ctx }) => {
      const deals = await db.getDeals(ctx.user.id);
      const activeDeals = deals.filter((d) => !["closed_won", "closed_lost"].includes(d.stage));

      // Calculate weighted pipeline value
      const forecast = [];
      for (let i = 0; i < input.months; i++) {
        const monthValue = activeDeals.reduce((sum, deal) => {
          const probability = (deal.probability || 50) / 100;
          const value = deal.value || 0;
          // Deals closer to closing have higher weight in near-term forecast
          const timeWeight = deal.stage === "negotiation" ? 1.2 : deal.stage === "proposal" ? 1.0 : 0.7;
          return sum + value * probability * timeWeight;
        }, 0);

        forecast.push({
          month: new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7),
          value: Math.round(monthValue),
          confidence: activeDeals.length > 5 ? "high" : activeDeals.length > 2 ? "medium" : "low",
        });
      }

      return forecast;
    }),

  // Detect stale deals and generate notifications
  detectStaleDeals: protectedProcedure.query(async ({ ctx }) => {
    const deals = await db.getDeals(ctx.user.id);
    const staleDeals = deals.filter((deal) => {
      if (["closed_won", "closed_lost"].includes(deal.stage)) return false;
      if (!deal.updatedAt) return true;
      const daysSinceUpdate = (Date.now() - new Date(deal.updatedAt).getTime()) / (24 * 60 * 60 * 1000);
      return daysSinceUpdate > 14;
    });

    return staleDeals.map((deal) => ({
      id: deal.id,
      title: deal.title,
      daysSinceUpdate: deal.updatedAt
        ? Math.floor((Date.now() - new Date(deal.updatedAt).getTime()) / (24 * 60 * 60 * 1000))
        : 999,
      suggestion: "Reach out to the prospect to maintain momentum",
    }));
  }),

  // Generate sales collateral using AI
  generateCollateral: protectedProcedure
    .input(
      z.object({
        type: z.enum(["proposal", "battle_card", "one_pager"]),
        dealId: z.number().optional(),
        companyId: z.number().optional(),
        customPrompt: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      let context = "";

      if (input.dealId) {
        const deal = await db.getDealById(input.dealId);
        if (deal) {
          context += `Deal: ${deal.title}, Value: $${deal.value}, Stage: ${deal.stage}\n`;
        }
      }

      if (input.companyId) {
        const company = await db.getCompanyById(input.companyId);
        if (company) {
          context += `Company: ${company.name}, Industry: ${company.industry}\n`;
          if (company.description) context += `Description: ${company.description}\n`;
        }
      }

      const prompts: Record<string, string> = {
        proposal: `Generate a professional sales proposal for the following opportunity:\n\n${context}\n\nInclude: Executive Summary, Solution Overview, Pricing, Timeline, and Next Steps.`,
        battle_card: `Create a competitive battle card for:\n\n${context}\n\nInclude: Key Differentiators, Competitive Advantages, Common Objections & Responses, and Talking Points.`,
        one_pager: `Create a concise one-page sales overview for:\n\n${context}\n\nInclude: Value Proposition, Key Benefits, Social Proof, and Clear CTA.`,
      };

      const prompt = input.customPrompt || prompts[input.type];

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are an expert sales enablement specialist. Generate professional, persuasive sales collateral in markdown format.",
          },
          { role: "user", content: prompt },
        ],
      });

      const content = (typeof response.choices[0]?.message?.content === 'string' ? response.choices[0]?.message?.content : null) || "Failed to generate content";

      return { content, type: input.type };
    }),

  // Scrape and summarize company website
  scrapeCompanyWebsite: protectedProcedure
    .input(z.object({ companyId: z.number() }))
    .mutation(async ({ input }) => {
      const company = await db.getCompanyById(input.companyId);
      if (!company || !company.website) {
        throw new Error("Company website not found");
      }

      // In a real implementation, you would scrape the website
      // For now, we'll use AI to generate a summary based on the company info
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are a business intelligence analyst. Generate a concise company summary based on available information.",
          },
          {
            role: "user",
            content: `Generate a business summary for ${company.name} (${company.website}). Industry: ${company.industry || "Unknown"}. ${company.description || ""}`,
          },
        ],
      });

      const summary = (typeof response.choices[0]?.message?.content === 'string' ? response.choices[0]?.message?.content : null) || "Unable to generate summary";

      // Update company with AI-generated summary
      await db.updateCompany(input.companyId, {
        aiSummary: summary,
      });

      return { summary };
    }),

  // AI-powered lead scoring
  scoreLeads: protectedProcedure.query(async ({ ctx }) => {
    const leads = await db.getLeads(ctx.user.id);

    const scoredLeads = leads.map((lead) => {
      let score = 50; // Base score

      // Email presence
      if (lead.email) score += 15;

      // Company info
      if (lead.company) score += 10;

      // Status
      if (lead.status === "contacted") score += 10;
      if (lead.status === "qualified") score += 20;

      // Recent activity
      if (lead.createdAt) {
        const daysOld = (Date.now() - new Date(lead.createdAt).getTime()) / (24 * 60 * 60 * 1000);
        if (daysOld < 7) score += 15;
      }

      return {
        ...lead,
        score: Math.min(100, score),
      };
    });

    // Update scores in database
    for (const lead of scoredLeads) {
      await db.updateLead(lead.id, { score: lead.score });
    }

    return scoredLeads.sort((a: any, b: any) => b.score - a.score);
  }),

  // Find warm introduction paths
  findWarmIntros: protectedProcedure
    .input(z.object({ contactId: z.number() }))
    .query(async ({ input, ctx }) => {
      const contact = await db.getContactById(input.contactId);
      if (!contact) throw new Error("Contact not found");

      // Find contacts who referred this contact or share connections
      const allContacts = await db.getContacts(ctx.user.id);
      const paths = allContacts
        .filter((c: any) => c.referredBy === input.contactId || contact.referredBy === c.id)
        .map((c: any) => ({
          contact: c,
          relationship: c.referredBy === input.contactId ? "referred_by_target" : "shares_referrer",
          strength: c.relationshipStrength || 50,
        }));

      return paths;
    }),
});
