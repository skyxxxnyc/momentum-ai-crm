import { boolean, index, int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  avatar: text("avatar"),
  title: varchar("title", { length: 255 }),
  department: varchar("department", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Companies table - organizations in the CRM
 */
export const companies = mysqlTable("companies", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  domain: varchar("domain", { length: 255 }),
  website: text("website"),
  industry: varchar("industry", { length: 255 }),
  size: varchar("size", { length: 100 }),
  description: text("description"),
  logo: text("logo"),
  address: text("address"),
  city: varchar("city", { length: 255 }),
  state: varchar("state", { length: 100 }),
  country: varchar("country", { length: 100 }),
  zipCode: varchar("zipCode", { length: 20 }),
  phone: varchar("phone", { length: 50 }),
  linkedinUrl: text("linkedinUrl"),
  twitterUrl: text("twitterUrl"),
  relationshipStrength: int("relationshipStrength").default(0),
  aiSummary: text("aiSummary"),
  ownerId: int("ownerId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  ownerIdx: index("owner_idx").on(table.ownerId),
}));

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

/**
 * Contacts table - people in the CRM
 */
export const contacts = mysqlTable("contacts", {
  id: int("id").autoincrement().primaryKey(),
  firstName: varchar("firstName", { length: 255 }).notNull(),
  lastName: varchar("lastName", { length: 255 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  title: varchar("title", { length: 255 }),
  companyId: int("companyId"),
  linkedinUrl: text("linkedinUrl"),
  twitterUrl: text("twitterUrl"),
  avatar: text("avatar"),
  address: text("address"),
  city: varchar("city", { length: 255 }),
  state: varchar("state", { length: 100 }),
  country: varchar("country", { length: 100 }),
  zipCode: varchar("zipCode", { length: 20 }),
  relationshipStrength: int("relationshipStrength").default(0),
  lastContactedAt: timestamp("lastContactedAt"),
  notes: text("notes"),
  referredBy: int("referredBy"),
  ownerId: int("ownerId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  companyIdx: index("company_idx").on(table.companyId),
  ownerIdx: index("owner_idx").on(table.ownerId),
}));

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;

/**
 * Deals table - sales opportunities
 */
export const deals = mysqlTable("deals", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  value: int("value").default(0),
  stage: mysqlEnum("stage", ["lead", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"]).default("lead").notNull(),
  probability: int("probability").default(0),
  expectedCloseDate: timestamp("expectedCloseDate"),
  actualCloseDate: timestamp("actualCloseDate"),
  companyId: int("companyId"),
  contactId: int("contactId"),
  ownerId: int("ownerId").notNull(),
  momentumScore: int("momentumScore").default(0),
  dealHealth: mysqlEnum("dealHealth", ["healthy", "at_risk", "stale", "critical"]).default("healthy"),
  lastActivityAt: timestamp("lastActivityAt"),
  isHot: boolean("isHot").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  companyIdx: index("company_idx").on(table.companyId),
  contactIdx: index("contact_idx").on(table.contactId),
  ownerIdx: index("owner_idx").on(table.ownerId),
  stageIdx: index("stage_idx").on(table.stage),
}));

export type Deal = typeof deals.$inferSelect;
export type InsertDeal = typeof deals.$inferInsert;

/**
 * ICPs (Ideal Customer Profiles) table
 */
export const icps = mysqlTable("icps", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  industry: varchar("industry", { length: 255 }),
  companySize: varchar("companySize", { length: 100 }),
  revenue: varchar("revenue", { length: 100 }),
  geography: varchar("geography", { length: 255 }),
  techStack: text("techStack"),
  painPoints: text("painPoints"),
  buyingSignals: text("buyingSignals"),
  ownerId: int("ownerId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  ownerIdx: index("owner_idx").on(table.ownerId),
}));

export type ICP = typeof icps.$inferSelect;
export type InsertICP = typeof icps.$inferInsert;

/**
 * Leads table - potential customers
 */
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  firstName: varchar("firstName", { length: 255 }).notNull(),
  lastName: varchar("lastName", { length: 255 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  company: varchar("company", { length: 255 }),
  title: varchar("title", { length: 255 }),
  source: varchar("source", { length: 255 }),
  status: mysqlEnum("status", ["new", "contacted", "qualified", "unqualified", "converted"]).default("new").notNull(),
  score: int("score").default(0),
  icpId: int("icpId"),
  notes: text("notes"),
  ownerId: int("ownerId").notNull(),
  convertedToContactId: int("convertedToContactId"),
  convertedAt: timestamp("convertedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  icpIdx: index("icp_idx").on(table.icpId),
  ownerIdx: index("owner_idx").on(table.ownerId),
  statusIdx: index("status_idx").on(table.status),
}));

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

/**
 * Tasks table
 */
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  dueDate: timestamp("dueDate"),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  status: mysqlEnum("status", ["todo", "in_progress", "completed", "cancelled"]).default("todo").notNull(),
  dealId: int("dealId"),
  contactId: int("contactId"),
  companyId: int("companyId"),
  assignedTo: int("assignedTo").notNull(),
  createdBy: int("createdBy").notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  dealIdx: index("deal_idx").on(table.dealId),
  contactIdx: index("contact_idx").on(table.contactId),
  companyIdx: index("company_idx").on(table.companyId),
  assignedIdx: index("assigned_idx").on(table.assignedTo),
  statusIdx: index("status_idx").on(table.status),
}));

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

/**
 * Goals table - sales quotas and targets
 */
export const goals = mysqlTable("goals", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["revenue", "deals", "activities", "custom"]).default("revenue").notNull(),
  targetValue: int("targetValue").notNull(),
  currentValue: int("currentValue").default(0),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
}));

export type Goal = typeof goals.$inferSelect;
export type InsertGoal = typeof goals.$inferInsert;


/**
 * Activities table - interactions and events
 */
export const activities = mysqlTable("activities", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["call", "email", "meeting", "note", "task", "deal_update"]).notNull(),
  subject: varchar("subject", { length: 255 }),
  description: text("description"),
  dealId: int("dealId"),
  contactId: int("contactId"),
  companyId: int("companyId"),
  userId: int("userId").notNull(),
  activityDate: timestamp("activityDate").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  dealIdx: index("deal_idx").on(table.dealId),
  contactIdx: index("contact_idx").on(table.contactId),
  companyIdx: index("company_idx").on(table.companyId),
  userIdx: index("user_idx").on(table.userId),
}));

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = typeof activities.$inferInsert;

/**
 * Articles table - knowledge base and sales collateral
 */
export const articles = mysqlTable("articles", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content"),
  excerpt: text("excerpt"),
  type: mysqlEnum("type", ["blog", "case_study", "whitepaper", "proposal", "battle_card", "one_pager"]).default("blog").notNull(),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  authorId: int("authorId").notNull(),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  authorIdx: index("author_idx").on(table.authorId),
  typeIdx: index("type_idx").on(table.type),
  statusIdx: index("status_idx").on(table.status),
}));

export type Article = typeof articles.$inferSelect;
export type InsertArticle = typeof articles.$inferInsert;

export const knowledgeArticles = mysqlTable("knowledge_articles", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),
  category: varchar("category", { length: 100 }),
  tags: text("tags"), // JSON array of tags
  filePath: varchar("file_path", { length: 500 }), // Path to markdown file
  author: varchar("author", { length: 255 }),
  isPublic: int("is_public").default(0).notNull(), // 0 = internal only, 1 = public
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type KnowledgeArticle = typeof knowledgeArticles.$inferSelect;
export type InsertKnowledgeArticle = typeof knowledgeArticles.$inferInsert;

/**
 * Deal comments table - collaborative commenting
 */
export const dealComments = mysqlTable("deal_comments", {
  id: int("id").autoincrement().primaryKey(),
  dealId: int("dealId").notNull(),
  userId: int("userId").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  dealIdx: index("deal_idx").on(table.dealId),
  userIdx: index("user_idx").on(table.userId),
}));

export type DealComment = typeof dealComments.$inferSelect;
export type InsertDealComment = typeof dealComments.$inferInsert;

/**
 * AI chat messages table
 */
export const aiChatMessages = mysqlTable("ai_chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  sessionId: varchar("sessionId", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  sessionIdx: index("session_idx").on(table.sessionId),
}));

export type AIChatMessage = typeof aiChatMessages.$inferSelect;
export type InsertAIChatMessage = typeof aiChatMessages.$inferInsert;

/**
 * Email sequences table
 */
export const emailSequences = mysqlTable("email_sequences", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["active", "paused", "archived"]).default("active").notNull(),
  ownerId: int("ownerId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  ownerIdx: index("owner_idx").on(table.ownerId),
}));

export type EmailSequence = typeof emailSequences.$inferSelect;
export type InsertEmailSequence = typeof emailSequences.$inferInsert;

/**
 * Email sequence steps table
 */
export const emailSequenceSteps = mysqlTable("email_sequence_steps", {
  id: int("id").autoincrement().primaryKey(),
  sequenceId: int("sequenceId").notNull(),
  stepNumber: int("stepNumber").notNull(),
  subject: varchar("subject", { length: 500 }),
  body: text("body"),
  delayDays: int("delayDays").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  sequenceIdx: index("sequence_idx").on(table.sequenceId),
}));

export type EmailSequenceStep = typeof emailSequenceSteps.$inferSelect;
export type InsertEmailSequenceStep = typeof emailSequenceSteps.$inferInsert;

/**
 * Email sequence enrollments table
 */
export const emailSequenceEnrollments = mysqlTable("email_sequence_enrollments", {
  id: int("id").autoincrement().primaryKey(),
  sequenceId: int("sequenceId").notNull(),
  contactId: int("contactId").notNull(),
  currentStep: int("currentStep").default(0),
  status: mysqlEnum("status", ["active", "completed", "unsubscribed"]).default("active").notNull(),
  enrolledAt: timestamp("enrolledAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  sequenceIdx: index("sequence_idx").on(table.sequenceId),
  contactIdx: index("contact_idx").on(table.contactId),
}));

export type EmailSequenceEnrollment = typeof emailSequenceEnrollments.$inferSelect;
export type InsertEmailSequenceEnrollment = typeof emailSequenceEnrollments.$inferInsert;

/**
 * Notifications table
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["stale_deal", "hot_lead", "task_due", "ai_suggestion", "system"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  isRead: boolean("isRead").default(false),
  actionUrl: text("actionUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  readIdx: index("read_idx").on(table.isRead),
}));

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Prospecting schedules table - automated prospecting runs
 */
export const prospectingSchedules = mysqlTable("prospectingSchedules", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  icpId: int("icpId").notNull(),
  frequency: mysqlEnum("frequency", ["daily", "weekly", "monthly"]).notNull(),
  maxResults: int("maxResults").default(10).notNull(),
  autoCreateCompanies: int("autoCreateCompanies").default(1).notNull(), // 1 = true, 0 = false
  isActive: int("isActive").default(1).notNull(), // 1 = true, 0 = false
  lastRunAt: timestamp("lastRunAt"),
  nextRunAt: timestamp("nextRunAt"),
  ownerId: int("ownerId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  icpIdx: index("icp_idx").on(table.icpId),
  ownerIdx: index("owner_idx").on(table.ownerId),
}));

export type ProspectingSchedule = typeof prospectingSchedules.$inferSelect;
export type InsertProspectingSchedule = typeof prospectingSchedules.$inferInsert;

/**
 * Blog posts table - admin blog content
 */
export const blogPosts = mysqlTable("blogPosts", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 500 }).notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  featuredImage: varchar("featuredImage", { length: 500 }),
  status: mysqlEnum("status", ["draft", "published"]).default("draft").notNull(),
  category: varchar("category", { length: 255 }),
  tags: text("tags"), // JSON array of tags
  seoTitle: varchar("seoTitle", { length: 500 }),
  seoDescription: text("seoDescription"),
  authorId: int("authorId").notNull(),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  slugIdx: index("slug_idx").on(table.slug),
  authorIdx: index("author_idx").on(table.authorId),
  statusIdx: index("status_idx").on(table.status),
}));

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

/**
 * File attachments for deals and companies
 */
export const attachments = mysqlTable("attachments", {
  id: int("id").autoincrement().primaryKey(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(), // S3 key
  fileUrl: text("fileUrl").notNull(), // S3 URL
  fileSize: int("fileSize").notNull(), // bytes
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  entityType: mysqlEnum("entityType", ["deal", "company"]).notNull(),
  entityId: int("entityId").notNull(),
  ownerId: int("ownerId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Attachment = typeof attachments.$inferSelect;
export type InsertAttachment = typeof attachments.$inferInsert;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  companies: many(companies),
  contacts: many(contacts),
  deals: many(deals),
  tasks: many(tasks),
  goals: many(goals),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  owner: one(users, {
    fields: [companies.ownerId],
    references: [users.id],
  }),
  contacts: many(contacts),
  deals: many(deals),
}));

export const contactsRelations = relations(contacts, ({ one, many }) => ({
  company: one(companies, {
    fields: [contacts.companyId],
    references: [companies.id],
  }),
  owner: one(users, {
    fields: [contacts.ownerId],
    references: [users.id],
  }),
  referrer: one(contacts, {
    fields: [contacts.referredBy],
    references: [contacts.id],
  }),
  deals: many(deals),
}));

export const dealsRelations = relations(deals, ({ one, many }) => ({
  company: one(companies, {
    fields: [deals.companyId],
    references: [companies.id],
  }),
  contact: one(contacts, {
    fields: [deals.contactId],
    references: [contacts.id],
  }),
  owner: one(users, {
    fields: [deals.ownerId],
    references: [users.id],
  }),
  comments: many(dealComments),
  tasks: many(tasks),
}));

export const leadsRelations = relations(leads, ({ one }) => ({
  icp: one(icps, {
    fields: [leads.icpId],
    references: [icps.id],
  }),
  owner: one(users, {
    fields: [leads.ownerId],
    references: [users.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  deal: one(deals, {
    fields: [tasks.dealId],
    references: [deals.id],
  }),
  contact: one(contacts, {
    fields: [tasks.contactId],
    references: [contacts.id],
  }),
  company: one(companies, {
    fields: [tasks.companyId],
    references: [companies.id],
  }),
  assignee: one(users, {
    fields: [tasks.assignedTo],
    references: [users.id],
  }),
}));

/**
 * Activity Log table - tracks all CRM actions for activity feed
 */
export const activity_log = mysqlTable("activity_log", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  action: varchar("action", { length: 100 }).notNull(), // e.g., "created", "updated", "deleted"
  entityType: varchar("entityType", { length: 50 }).notNull(), // e.g., "contact", "company", "deal"
  entityId: int("entityId"),
  entityName: varchar("entityName", { length: 255 }), // Display name of the entity
  description: text("description"), // Human-readable description
  metadata: json("metadata"), // Additional context as JSON
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityLog = typeof activity_log.$inferSelect;
export type InsertActivityLog = typeof activity_log.$inferInsert;

export const activityLogRelations = relations(activity_log, ({ one }) => ({
  user: one(users, {
    fields: [activity_log.userId],
    references: [users.id],
  }),
}));

/**
 * Notes table - comments and notes on companies, contacts, and deals
 */
export const notes = mysqlTable("notes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  entityType: varchar("entityType", { length: 50 }).notNull(), // "contact", "company", "deal"
  entityId: int("entityId").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  entityIdx: index("entity_idx").on(table.entityType, table.entityId),
  userIdx: index("user_idx").on(table.userId),
}));

export type Note = typeof notes.$inferSelect;
export type InsertNote = typeof notes.$inferInsert;

export const notesRelations = relations(notes, ({ one }) => ({
  user: one(users, {
    fields: [notes.userId],
    references: [users.id],
  }),
}));
