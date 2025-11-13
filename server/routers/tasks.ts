import { desc, eq, and, or, lte, isNull } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { tasks, users, companies, contacts, deals } from "../../drizzle/schema";

export const tasksRouter = router({
  // Get all tasks (with optional filtering)
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(["todo", "in_progress", "completed", "cancelled"]).optional(),
        assignedToMe: z.boolean().optional(),
        entityType: z.enum(["company", "contact", "deal"]).optional(),
        entityId: z.number().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      let query = db
        .select({
          id: tasks.id,
          title: tasks.title,
          description: tasks.description,
          dueDate: tasks.dueDate,
          priority: tasks.priority,
          status: tasks.status,
          dealId: tasks.dealId,
          contactId: tasks.contactId,
          companyId: tasks.companyId,
          assignedTo: tasks.assignedTo,
          assignedToName: users.name,
          createdBy: tasks.createdBy,
          completedAt: tasks.completedAt,
          createdAt: tasks.createdAt,
          updatedAt: tasks.updatedAt,
          companyName: companies.name,
          contactName: contacts.firstName,
          dealTitle: deals.title,
        })
        .from(tasks)
        .leftJoin(users, eq(tasks.assignedTo, users.id))
        .leftJoin(companies, eq(tasks.companyId, companies.id))
        .leftJoin(contacts, eq(tasks.contactId, contacts.id))
        .leftJoin(deals, eq(tasks.dealId, deals.id))
        .$dynamic();

      // Apply filters
      const conditions = [];
      
      if (input?.status) {
        conditions.push(eq(tasks.status, input.status));
      }
      
      if (input?.assignedToMe) {
        conditions.push(eq(tasks.assignedTo, ctx.user.id));
      }

      if (input?.entityType && input?.entityId) {
        if (input.entityType === "company") {
          conditions.push(eq(tasks.companyId, input.entityId));
        } else if (input.entityType === "contact") {
          conditions.push(eq(tasks.contactId, input.entityId));
        } else if (input.entityType === "deal") {
          conditions.push(eq(tasks.dealId, input.entityId));
        }
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const result = await query.orderBy(desc(tasks.createdAt));
      return result;
    }),

  // Get overdue tasks
  overdue: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const now = new Date();
    const result = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        dueDate: tasks.dueDate,
        priority: tasks.priority,
        assignedToName: users.name,
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.assignedTo, users.id))
      .where(
        and(
          eq(tasks.assignedTo, ctx.user.id),
          lte(tasks.dueDate, now),
          or(
            eq(tasks.status, "todo"),
            eq(tasks.status, "in_progress")
          )
        )
      )
      .orderBy(tasks.dueDate);

    return result;
  }),

  // Create a task
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        dueDate: z.date().optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
        dealId: z.number().optional(),
        contactId: z.number().optional(),
        companyId: z.number().optional(),
        assignedTo: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.insert(tasks).values({
        ...input,
        createdBy: ctx.user.id,
      });

      return { id: result.insertId };
    }),

  // Update a task
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        dueDate: z.date().optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        status: z.enum(["todo", "in_progress", "completed", "cancelled"]).optional(),
        assignedTo: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const updateData: any = { ...input };
      delete updateData.id;

      // If marking as completed, set completedAt
      if (input.status === "completed") {
        updateData.completedAt = new Date();
      }

      await db
        .update(tasks)
        .set(updateData)
        .where(eq(tasks.id, input.id));

      return { success: true };
    }),

  // Delete a task
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(tasks).where(eq(tasks.id, input.id));

      return { success: true };
    }),
});
