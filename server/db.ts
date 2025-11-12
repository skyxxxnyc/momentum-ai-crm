import { eq, desc, and, or, like, gte, lte, sql, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  companies, InsertCompany,
  contacts, InsertContact,
  deals, InsertDeal,
  icps, InsertICP,
  leads, InsertLead,
  tasks, InsertTask,
  goals, InsertGoal,
  activities, InsertActivity,
  articles, InsertArticle,
  dealComments, InsertDealComment,
  aiChatMessages, InsertAIChatMessage,
  emailSequences, InsertEmailSequence,
  emailSequenceSteps, InsertEmailSequenceStep,
  emailSequenceEnrollments, InsertEmailSequenceEnrollment,
  notifications, InsertNotification
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// User operations
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "avatar", "title", "department"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

// Company operations
export async function createCompany(data: InsertCompany) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(companies).values(data);
  return result;
}

export async function getCompanies(ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(companies).where(eq(companies.ownerId, ownerId)).orderBy(desc(companies.createdAt));
}

export async function getCompanyById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
  return result[0] || null;
}

export async function updateCompany(id: number, data: Partial<InsertCompany>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(companies).set(data).where(eq(companies.id, id));
}

export async function deleteCompany(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(companies).where(eq(companies.id, id));
}

// Contact operations
export async function createContact(data: InsertContact) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(contacts).values(data);
  return result;
}

export async function getContacts(ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contacts).where(eq(contacts.ownerId, ownerId)).orderBy(desc(contacts.createdAt));
}

export async function getContactById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(contacts).where(eq(contacts.id, id)).limit(1);
  return result[0] || null;
}

export async function updateContact(id: number, data: Partial<InsertContact>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(contacts).set(data).where(eq(contacts.id, id));
}

export async function deleteContact(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(contacts).where(eq(contacts.id, id));
}

export async function getContactsByCompany(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contacts).where(eq(contacts.companyId, companyId)).orderBy(desc(contacts.createdAt));
}

// Deal operations
export async function createDeal(data: InsertDeal) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(deals).values(data);
  return result;
}

export async function getDeals(ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(deals).where(eq(deals.ownerId, ownerId)).orderBy(desc(deals.createdAt));
}

export async function getDealById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(deals).where(eq(deals.id, id)).limit(1);
  return result[0] || null;
}

export async function updateDeal(id: number, data: Partial<InsertDeal>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(deals).set(data).where(eq(deals.id, id));
}

export async function deleteDeal(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(deals).where(eq(deals.id, id));
}

export async function getDealsByStage(ownerId: number, stage: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(deals).where(
    and(eq(deals.ownerId, ownerId), eq(deals.stage, stage as any))
  ).orderBy(desc(deals.updatedAt));
}

// ICP operations
export async function createICP(data: InsertICP) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(icps).values(data);
  return result;
}

export async function getICPs(ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(icps).where(eq(icps.ownerId, ownerId)).orderBy(desc(icps.createdAt));
}

export async function getICPById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(icps).where(eq(icps.id, id)).limit(1);
  return result[0] || null;
}

export async function updateICP(id: number, data: Partial<InsertICP>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(icps).set(data).where(eq(icps.id, id));
}

export async function deleteICP(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(icps).where(eq(icps.id, id));
}

// Lead operations
export async function createLead(data: InsertLead) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(leads).values(data);
  return result;
}

export async function getLeads(ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leads).where(eq(leads.ownerId, ownerId)).orderBy(desc(leads.createdAt));
}

export async function getLeadById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  return result[0] || null;
}

export async function updateLead(id: number, data: Partial<InsertLead>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(leads).set(data).where(eq(leads.id, id));
}

export async function deleteLead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(leads).where(eq(leads.id, id));
}

export async function getHotLeads(ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leads).where(
    and(eq(leads.ownerId, ownerId), gte(leads.score, 70))
  ).orderBy(desc(leads.score));
}

// Task operations
export async function createTask(data: InsertTask) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(tasks).values(data);
  return result;
}

export async function getTasks(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tasks).where(eq(tasks.assignedTo, userId)).orderBy(desc(tasks.createdAt));
}

export async function getTaskById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
  return result[0] || null;
}

export async function updateTask(id: number, data: Partial<InsertTask>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(tasks).set(data).where(eq(tasks.id, id));
}

export async function deleteTask(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(tasks).where(eq(tasks.id, id));
}

export async function getTasksByDeal(dealId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tasks).where(eq(tasks.dealId, dealId)).orderBy(desc(tasks.createdAt));
}

// Goal operations
export async function createGoal(data: InsertGoal) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(goals).values(data);
  return result;
}

export async function getGoals(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(goals).where(eq(goals.userId, userId)).orderBy(desc(goals.createdAt));
}

export async function getGoalById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(goals).where(eq(goals.id, id)).limit(1);
  return result[0] || null;
}

export async function updateGoal(id: number, data: Partial<InsertGoal>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(goals).set(data).where(eq(goals.id, id));
}

export async function deleteGoal(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(goals).where(eq(goals.id, id));
}

// Activity operations
export async function createActivity(data: InsertActivity) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(activities).values(data);
  return result;
}

export async function getActivities(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(activities).where(eq(activities.userId, userId)).orderBy(desc(activities.activityDate));
}

export async function getActivitiesByDeal(dealId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(activities).where(eq(activities.dealId, dealId)).orderBy(desc(activities.activityDate));
}

// Article operations
export async function createArticle(data: InsertArticle) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(articles).values(data);
  return result;
}

export async function getArticles(authorId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (authorId) {
    return db.select().from(articles).where(eq(articles.authorId, authorId)).orderBy(desc(articles.createdAt));
  }
  return db.select().from(articles).orderBy(desc(articles.createdAt));
}

export async function getArticleById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  return result[0] || null;
}

export async function getArticleBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
  return result[0] || null;
}

export async function updateArticle(id: number, data: Partial<InsertArticle>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(articles).set(data).where(eq(articles.id, id));
}

export async function deleteArticle(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(articles).where(eq(articles.id, id));
}

// Deal comment operations
export async function createDealComment(data: InsertDealComment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(dealComments).values(data);
  return result;
}

export async function getDealComments(dealId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(dealComments).where(eq(dealComments.dealId, dealId)).orderBy(desc(dealComments.createdAt));
}

// AI Chat operations
export async function createAIChatMessage(data: InsertAIChatMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(aiChatMessages).values(data);
  return result;
}

export async function getAIChatMessages(userId: number, sessionId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(aiChatMessages).where(
    and(eq(aiChatMessages.userId, userId), eq(aiChatMessages.sessionId, sessionId))
  ).orderBy(aiChatMessages.createdAt);
}

// Email sequence operations
export async function createEmailSequence(data: InsertEmailSequence) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(emailSequences).values(data);
  return result;
}

export async function getEmailSequences(ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(emailSequences).where(eq(emailSequences.ownerId, ownerId)).orderBy(desc(emailSequences.createdAt));
}

export async function createEmailSequenceStep(data: InsertEmailSequenceStep) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(emailSequenceSteps).values(data);
  return result;
}

export async function getEmailSequenceSteps(sequenceId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(emailSequenceSteps).where(eq(emailSequenceSteps.sequenceId, sequenceId)).orderBy(emailSequenceSteps.stepNumber);
}

// Notification operations
export async function createNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(notifications).values(data);
  return result;
}

export async function getNotifications(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
}

export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
}

// Dashboard analytics
export async function getDashboardStats(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const [totalDeals] = await db.select({ count: sql<number>`count(*)` }).from(deals).where(eq(deals.ownerId, userId));
  const [totalContacts] = await db.select({ count: sql<number>`count(*)` }).from(contacts).where(eq(contacts.ownerId, userId));
  const [totalCompanies] = await db.select({ count: sql<number>`count(*)` }).from(companies).where(eq(companies.ownerId, userId));
  const [totalRevenue] = await db.select({ sum: sql<number>`COALESCE(sum(value), 0)` }).from(deals).where(
    and(eq(deals.ownerId, userId), eq(deals.stage, 'closed_won'))
  );

  return {
    totalDeals: totalDeals.count,
    totalContacts: totalContacts.count,
    totalCompanies: totalCompanies.count,
    totalRevenue: totalRevenue.sum,
  };
}
