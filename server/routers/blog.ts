import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { blogPosts } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

// Helper to generate URL-friendly slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const blogRouter = router({
  // Public: List published posts
  listPublished: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const posts = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.status, "published"))
      .orderBy(desc(blogPosts.publishedAt));

    return posts;
  }),

  // Public: Get single published post by slug
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const results = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.slug, input.slug))
        .limit(1);

      const post = results[0];
      if (!post || post.status !== "published") {
        return null;
      }

      return post;
    }),

  // Admin: List all posts (including drafts)
  listAll: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const posts = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.authorId, ctx.user.id))
      .orderBy(desc(blogPosts.updatedAt));

    return posts;
  }),

  // Admin: Get single post by ID
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;

      const results = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.id, input.id))
        .limit(1);

      const post = results[0];
      if (!post || post.authorId !== ctx.user.id) {
        return null;
      }

      return post;
    }),

  // Admin: Create post
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        content: z.string(),
        excerpt: z.string().optional(),
        featuredImage: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        seoTitle: z.string().optional(),
        seoDescription: z.string().optional(),
        status: z.enum(["draft", "published"]).default("draft"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Generate slug from title
      let slug = generateSlug(input.title);
      
      // Ensure slug is unique
      let counter = 1;
      let uniqueSlug = slug;
      while (true) {
        const existing = await db
          .select()
          .from(blogPosts)
          .where(eq(blogPosts.slug, uniqueSlug))
          .limit(1);
        
        if (existing.length === 0) break;
        uniqueSlug = `${slug}-${counter}`;
        counter++;
      }

      const result = await db.insert(blogPosts).values({
        title: input.title,
        slug: uniqueSlug,
        content: input.content,
        excerpt: input.excerpt || null,
        featuredImage: input.featuredImage || null,
        category: input.category || null,
        tags: input.tags ? JSON.stringify(input.tags) : null,
        seoTitle: input.seoTitle || null,
        seoDescription: input.seoDescription || null,
        status: input.status,
        authorId: ctx.user.id,
        publishedAt: input.status === "published" ? new Date() : null,
      });

      return { id: Number((result as any).insertId), slug: uniqueSlug, success: true };
    }),

  // Admin: Update post
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        content: z.string().optional(),
        excerpt: z.string().optional(),
        featuredImage: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        seoTitle: z.string().optional(),
        seoDescription: z.string().optional(),
        status: z.enum(["draft", "published"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify ownership
      const existing = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.id, input.id))
        .limit(1);

      if (!existing[0] || existing[0].authorId !== ctx.user.id) {
        throw new Error("Post not found or unauthorized");
      }

      const updates: any = {};
      if (input.title !== undefined) {
        updates.title = input.title;
        // Regenerate slug if title changes
        updates.slug = generateSlug(input.title);
      }
      if (input.content !== undefined) updates.content = input.content;
      if (input.excerpt !== undefined) updates.excerpt = input.excerpt || null;
      if (input.featuredImage !== undefined) updates.featuredImage = input.featuredImage || null;
      if (input.category !== undefined) updates.category = input.category || null;
      if (input.tags !== undefined) updates.tags = JSON.stringify(input.tags);
      if (input.seoTitle !== undefined) updates.seoTitle = input.seoTitle || null;
      if (input.seoDescription !== undefined) updates.seoDescription = input.seoDescription || null;
      if (input.status !== undefined) {
        updates.status = input.status;
        // Set publishedAt when publishing for the first time
        if (input.status === "published" && !existing[0].publishedAt) {
          updates.publishedAt = new Date();
        }
      }

      await db.update(blogPosts).set(updates).where(eq(blogPosts.id, input.id));

      return { success: true };
    }),

  // Admin: Delete post
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify ownership
      const existing = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.id, input.id))
        .limit(1);

      if (!existing[0] || existing[0].authorId !== ctx.user.id) {
        throw new Error("Post not found or unauthorized");
      }

      await db.delete(blogPosts).where(eq(blogPosts.id, input.id));

      return { success: true };
    }),
});
