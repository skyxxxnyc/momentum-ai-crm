import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { knowledgeArticles } from "../../drizzle/schema";
import { eq, like, or } from "drizzle-orm";
import { readFileSync } from "fs";
import { join } from "path";

export const knowledgeRouter = router({
  // List all knowledge articles
  list: protectedProcedure
    .input(
      z
        .object({
          category: z.string().optional(),
          search: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      let query = db.select().from(knowledgeArticles);

      const results = await query;

      // Filter by category if provided
      let filtered = results;
      if (input?.category) {
        filtered = filtered.filter((a) => a.category === input.category);
      }

      // Search if provided
      if (input?.search) {
        const searchLower = input.search.toLowerCase();
        filtered = filtered.filter(
          (a) =>
            a.title.toLowerCase().includes(searchLower) ||
            a.content.toLowerCase().includes(searchLower) ||
            (a.tags && a.tags.toLowerCase().includes(searchLower))
        );
      }

      return filtered;
    }),

  // Get single article by ID
  getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;

    const results = await db.select().from(knowledgeArticles).where(eq(knowledgeArticles.id, input.id)).limit(1);

    return results[0] || null;
  }),

  // Get article by slug
  getBySlug: protectedProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;

    const results = await db.select().from(knowledgeArticles).where(eq(knowledgeArticles.slug, input.slug)).limit(1);

    return results[0] || null;
  }),

  // Get article content from file
  getContent: protectedProcedure.input(z.object({ filePath: z.string() })).query(async ({ input }) => {
    try {
      const fullPath = join(process.cwd(), input.filePath);
      const content = readFileSync(fullPath, "utf-8");
      return { content };
    } catch (error) {
      console.error("Error reading knowledge file:", error);
      return { content: "" };
    }
  }),

  // Create knowledge article
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        slug: z.string(),
        content: z.string(),
        category: z.string().optional(),
        tags: z.string().optional(),
        filePath: z.string().optional(),
        author: z.string().optional(),
        isPublic: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.insert(knowledgeArticles).values(input);
      return { id: Number(result.insertId) };
    }),

  // Update knowledge article
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        content: z.string().optional(),
        category: z.string().optional(),
        tags: z.string().optional(),
        filePath: z.string().optional(),
        author: z.string().optional(),
        isPublic: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, ...data } = input;
      await db.update(knowledgeArticles).set(data).where(eq(knowledgeArticles.id, id));
      return { success: true };
    }),

  // Delete knowledge article
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db.delete(knowledgeArticles).where(eq(knowledgeArticles.id, input.id));
    return { success: true };
  }),

  // Search knowledge base (for AI agents)
  search: protectedProcedure
    .input(
      z.object({
        query: z.string(),
        limit: z.number().default(5),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const searchLower = input.query.toLowerCase();
      const results = await db.select().from(knowledgeArticles);

      // Simple relevance scoring
      const scored = results
        .map((article) => {
          let score = 0;
          const titleLower = article.title.toLowerCase();
          const contentLower = article.content.toLowerCase();

          // Title matches are worth more
          if (titleLower.includes(searchLower)) score += 10;

          // Count occurrences in content
          const contentMatches = (contentLower.match(new RegExp(searchLower, "g")) || []).length;
          score += contentMatches;

          // Tag matches
          if (article.tags && article.tags.toLowerCase().includes(searchLower)) score += 5;

          return { ...article, score };
        })
        .filter((a) => a.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, input.limit);

      return scored;
    }),

  // Get all categories
  getCategories: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const results = await db.select().from(knowledgeArticles);
    const categories = [...new Set(results.map((a) => a.category).filter(Boolean))];
    return categories;
  }),
});
