import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { aiRouter } from "./routers/ai";
import { emailRouter } from "./routers/email";
import { notificationsRouter } from "./routers/notifications";
import { calendarRouter } from "./routers/calendar";
import { prospectingRouter } from "./routers/prospecting";
import { schedulerRouter } from "./routers/scheduler";
import { blogRouter } from "./routers/blog";
import { notionRouter } from "./routers/notion";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  ai: aiRouter,
  email: emailRouter,
  notifications: notificationsRouter,
  calendar: calendarRouter,
  prospecting: prospectingRouter,
  scheduler: schedulerRouter,
  blog: blogRouter,
  notion: notionRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  users: router({
    list: protectedProcedure.query(async () => {
      return db.getAllUsers();
    }),
  }),

  companies: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getCompanies(ctx.user.id);
    }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getCompanyById(input.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        domain: z.string().optional(),
        website: z.string().optional(),
        industry: z.string().optional(),
        size: z.string().optional(),
        description: z.string().optional(),
        logo: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        zipCode: z.string().optional(),
        phone: z.string().optional(),
        linkedinUrl: z.string().optional(),
        twitterUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createCompany({ ...input, ownerId: ctx.user.id });
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        domain: z.string().optional(),
        website: z.string().optional(),
        industry: z.string().optional(),
        size: z.string().optional(),
        description: z.string().optional(),
        logo: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        zipCode: z.string().optional(),
        phone: z.string().optional(),
        linkedinUrl: z.string().optional(),
        twitterUrl: z.string().optional(),
        relationshipStrength: z.number().optional(),
        aiSummary: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateCompany(id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteCompany(input.id);
      }),
  }),

  contacts: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getContacts(ctx.user.id);
    }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getContactById(input.id);
      }),
    
    byCompany: protectedProcedure
      .input(z.object({ companyId: z.number() }))
      .query(async ({ input }) => {
        return db.getContactsByCompany(input.companyId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        firstName: z.string(),
        lastName: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        title: z.string().optional(),
        companyId: z.number().optional(),
        linkedinUrl: z.string().optional(),
        twitterUrl: z.string().optional(),
        avatar: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        zipCode: z.string().optional(),
        notes: z.string().optional(),
        referredBy: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createContact({ ...input, ownerId: ctx.user.id });
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        title: z.string().optional(),
        companyId: z.number().optional(),
        linkedinUrl: z.string().optional(),
        twitterUrl: z.string().optional(),
        avatar: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        zipCode: z.string().optional(),
        relationshipStrength: z.number().optional(),
        lastContactedAt: z.date().optional(),
        notes: z.string().optional(),
        referredBy: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateContact(id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteContact(input.id);
      }),
  }),

  deals: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getDeals(ctx.user.id);
    }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getDealById(input.id);
      }),
    
    byStage: protectedProcedure
      .input(z.object({ stage: z.string() }))
      .query(async ({ ctx, input }) => {
        return db.getDealsByStage(ctx.user.id, input.stage);
      }),
    
    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        value: z.number().optional(),
        stage: z.enum(["lead", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"]).optional(),
        probability: z.number().optional(),
        expectedCloseDate: z.date().optional(),
        companyId: z.number().optional(),
        contactId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createDeal({ ...input, ownerId: ctx.user.id });
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        value: z.number().optional(),
        stage: z.enum(["lead", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"]).optional(),
        probability: z.number().optional(),
        expectedCloseDate: z.date().optional(),
        actualCloseDate: z.date().optional(),
        companyId: z.number().optional(),
        contactId: z.number().optional(),
        momentumScore: z.number().optional(),
        dealHealth: z.enum(["healthy", "at_risk", "stale", "critical"]).optional(),
        lastActivityAt: z.date().optional(),
        isHot: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateDeal(id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteDeal(input.id);
      }),
  }),

  icps: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getICPs(ctx.user.id);
    }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getICPById(input.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        industry: z.string().optional(),
        companySize: z.string().optional(),
        revenue: z.string().optional(),
        geography: z.string().optional(),
        techStack: z.string().optional(),
        painPoints: z.string().optional(),
        buyingSignals: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createICP({ ...input, ownerId: ctx.user.id });
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        industry: z.string().optional(),
        companySize: z.string().optional(),
        revenue: z.string().optional(),
        geography: z.string().optional(),
        techStack: z.string().optional(),
        painPoints: z.string().optional(),
        buyingSignals: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateICP(id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteICP(input.id);
      }),
  }),

  leads: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getLeads(ctx.user.id);
    }),
    
    hot: protectedProcedure.query(async ({ ctx }) => {
      return db.getHotLeads(ctx.user.id);
    }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getLeadById(input.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        firstName: z.string(),
        lastName: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        company: z.string().optional(),
        title: z.string().optional(),
        source: z.string().optional(),
        status: z.enum(["new", "contacted", "qualified", "unqualified", "converted"]).optional(),
        score: z.number().optional(),
        icpId: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createLead({ ...input, ownerId: ctx.user.id });
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        company: z.string().optional(),
        title: z.string().optional(),
        source: z.string().optional(),
        status: z.enum(["new", "contacted", "qualified", "unqualified", "converted"]).optional(),
        score: z.number().optional(),
        icpId: z.number().optional(),
        notes: z.string().optional(),
        convertedToContactId: z.number().optional(),
        convertedAt: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateLead(id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteLead(input.id);
      }),
  }),

  tasks: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getTasks(ctx.user.id);
    }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getTaskById(input.id);
      }),
    
    byDeal: protectedProcedure
      .input(z.object({ dealId: z.number() }))
      .query(async ({ input }) => {
        return db.getTasksByDeal(input.dealId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        dueDate: z.date().optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        status: z.enum(["todo", "in_progress", "completed", "cancelled"]).optional(),
        dealId: z.number().optional(),
        contactId: z.number().optional(),
        companyId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createTask({ ...input, assignedTo: ctx.user.id, createdBy: ctx.user.id });
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        dueDate: z.date().optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        status: z.enum(["todo", "in_progress", "completed", "cancelled"]).optional(),
        dealId: z.number().optional(),
        contactId: z.number().optional(),
        companyId: z.number().optional(),
        completedAt: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateTask(id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteTask(input.id);
      }),
  }),

  goals: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getGoals(ctx.user.id);
    }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getGoalById(input.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        type: z.enum(["revenue", "deals", "activities", "custom"]).optional(),
        targetValue: z.number(),
        currentValue: z.number().optional(),
        startDate: z.date(),
        endDate: z.date(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createGoal({ ...input, userId: ctx.user.id });
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        type: z.enum(["revenue", "deals", "activities", "custom"]).optional(),
        targetValue: z.number().optional(),
        currentValue: z.number().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateGoal(id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteGoal(input.id);
      }),
  }),

  activities: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getActivities(ctx.user.id);
    }),
    
    byDeal: protectedProcedure
      .input(z.object({ dealId: z.number() }))
      .query(async ({ input }) => {
        return db.getActivitiesByDeal(input.dealId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        type: z.enum(["call", "email", "meeting", "note", "task", "deal_update"]),
        subject: z.string().optional(),
        description: z.string().optional(),
        dealId: z.number().optional(),
        contactId: z.number().optional(),
        companyId: z.number().optional(),
        activityDate: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createActivity({ ...input, userId: ctx.user.id });
      }),
  }),

  articles: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getArticles(ctx.user.id);
    }),
    
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getArticleById(input.id);
      }),
    
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return db.getArticleBySlug(input.slug);
      }),
    
    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        slug: z.string(),
        content: z.string().optional(),
        excerpt: z.string().optional(),
        type: z.enum(["blog", "case_study", "whitepaper", "proposal", "battle_card", "one_pager"]).optional(),
        status: z.enum(["draft", "published", "archived"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createArticle({ ...input, authorId: ctx.user.id });
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        slug: z.string().optional(),
        content: z.string().optional(),
        excerpt: z.string().optional(),
        type: z.enum(["blog", "case_study", "whitepaper", "proposal", "battle_card", "one_pager"]).optional(),
        status: z.enum(["draft", "published", "archived"]).optional(),
        publishedAt: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateArticle(id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteArticle(input.id);
      }),
  }),

  dealComments: router({
    list: protectedProcedure
      .input(z.object({ dealId: z.number() }))
      .query(async ({ input }) => {
        return db.getDealComments(input.dealId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        dealId: z.number(),
        content: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createDealComment({ ...input, userId: ctx.user.id });
      }),
  }),

  aiChat: router({
    getMessages: protectedProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ ctx, input }) => {
        return db.getAIChatMessages(ctx.user.id, input.sessionId);
      }),
    
    sendMessage: protectedProcedure
      .input(z.object({
        sessionId: z.string(),
        content: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createAIChatMessage({
          userId: ctx.user.id,
          role: "user",
          content: input.content,
          sessionId: input.sessionId,
        });

        const history = await db.getAIChatMessages(ctx.user.id, input.sessionId);
        
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are an AI assistant for Momentum AI CRM. Help users with sales, prospecting, deal management, and CRM tasks. Be concise and actionable.",
            },
            ...history.slice(-10).map(msg => ({
              role: msg.role as "user" | "assistant",
              content: msg.content,
            })),
          ],
        });

        const rawContent = response.choices[0].message.content;
        const assistantMessage = typeof rawContent === 'string' ? rawContent : "I'm sorry, I couldn't process that.";

        await db.createAIChatMessage({
          userId: ctx.user.id,
          role: "assistant",
          content: assistantMessage,
          sessionId: input.sessionId,
        });

        return { content: assistantMessage };
      }),
  }),

  emailSequences: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getEmailSequences(ctx.user.id);
    }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createEmailSequence({ ...input, ownerId: ctx.user.id });
      }),
    
    getSteps: protectedProcedure
      .input(z.object({ sequenceId: z.number() }))
      .query(async ({ input }) => {
        return db.getEmailSequenceSteps(input.sequenceId);
      }),
    
    createStep: protectedProcedure
      .input(z.object({
        sequenceId: z.number(),
        stepNumber: z.number(),
        subject: z.string().optional(),
        body: z.string().optional(),
        delayDays: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createEmailSequenceStep(input);
      }),
  }),


  dashboard: router({
    stats: protectedProcedure.query(async ({ ctx }) => {
      return db.getDashboardStats(ctx.user.id);
    }),
  }),

});

export type AppRouter = typeof appRouter;
