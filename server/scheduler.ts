import { exec } from "child_process";
import { promisify } from "util";
import cron from "node-cron";
import { getDb } from "./db";
import { prospectingSchedules } from "../drizzle/schema";
import { eq, and, lte } from "drizzle-orm";
import * as prospecting from "./prospecting";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load client one-pager content
let CLIENT_ONE_PAGER = "";
try {
  CLIENT_ONE_PAGER = readFileSync(
    join(__dirname, "lead-gen-knowledge.md"),
    "utf-8"
  );
} catch (error) {
  console.warn("[Scheduler] Could not load lead-gen-knowledge.md, using empty string");
}

interface ScheduledJob {
  scheduleId: number;
  task: any; // cron.ScheduledTask
}

const activeJobs = new Map<number, ScheduledJob>();

/**
 * Calculate next run time based on frequency
 */
function calculateNextRun(frequency: "daily" | "weekly" | "monthly"): Date {
  const now = new Date();
  const next = new Date(now);

  switch (frequency) {
    case "daily":
      next.setDate(next.getDate() + 1);
      next.setHours(9, 0, 0, 0); // 9 AM next day
      break;
    case "weekly":
      next.setDate(next.getDate() + 7);
      next.setHours(9, 0, 0, 0); // 9 AM next week
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      next.setDate(1); // First day of next month
      next.setHours(9, 0, 0, 0); // 9 AM
      break;
  }

  return next;
}

/**
 * Convert frequency to cron expression
 */
function frequencyToCron(frequency: "daily" | "weekly" | "monthly"): string {
  switch (frequency) {
    case "daily":
      return "0 9 * * *"; // Every day at 9 AM
    case "weekly":
      return "0 9 * * 1"; // Every Monday at 9 AM
    case "monthly":
      return "0 9 1 * *"; // First day of every month at 9 AM
    default:
      return "0 9 * * *";
  }
}

/**
 * Execute a prospecting run for a schedule
 */
async function executeProspectingRun(schedule: any) {
  console.log(`[Scheduler] Executing prospecting run for schedule ${schedule.id}: ${schedule.name}`);

  try {
    const db = await getDb();
    if (!db) {
      console.error("[Scheduler] Database not available");
      return;
    }

    // Get ICP details
    const { icps } = await import("../drizzle/schema");
    const icpResults = await db.select().from(icps).where(eq(icps.id, schedule.icpId)).limit(1);
    const icpResult = icpResults[0];

    if (!icpResult) {
      console.error(`[Scheduler] ICP ${schedule.icpId} not found`);
      return;
    }

    // Run prospecting
    const prospects = await prospecting.runProspectingAgent(
      {
        id: icpResult.id,
        name: icpResult.name,
        industry: icpResult.industry || "General",
        businessType: icpResult.industry || "Business",
        location: icpResult.geography || "United States",
        employeeRange: icpResult.companySize || undefined,
        revenueRange: icpResult.revenue || undefined,
        painPoints: icpResult.painPoints || undefined,
        targetKeywords: icpResult.buyingSignals || undefined,
      },
      CLIENT_ONE_PAGER,
      schedule.maxResults
    );

    console.log(`[Scheduler] Found ${prospects.length} prospects`);

    // Auto-create companies if enabled
    if (schedule.autoCreateCompanies === 1) {
      const { createCompany, getCompanies } = await import("./db");
      const allCompanies = await getCompanies(schedule.ownerId);

      for (const prospect of prospects) {
        try {
          const existing = allCompanies.find(
            (c: any) => c.name.toLowerCase() === prospect.businessName.toLowerCase()
          );

          if (!existing) {
            await createCompany({
              name: prospect.businessName,
              industry: prospect.industry,
              website: prospect.website || null,
              phone: prospect.phone || null,
              address: prospect.address || null,
              city: prospect.location,
              state: null,
              country: null,
              size: null,
              description: `Prospected from ICP: ${icpResult.name} (Scheduled Run)

${prospect.whyGoodFit?.join(" ") || ""}

Pain Points:
${prospect.painPoints?.join("\n") || ""}

Sales Opportunities:
${prospect.salesOpportunities?.join("\n") || ""}

Talking Points:
${prospect.talkingPoints?.join("\n") || ""}

Automation Opportunities:
${prospect.automationOpportunities?.join("\n") || ""}`,
              ownerId: schedule.ownerId,
            });
            console.log(`[Scheduler] Created company: ${prospect.businessName}`);
          }
        } catch (error) {
          console.error(`[Scheduler] Failed to create company ${prospect.businessName}:`, error);
        }
      }
    }

    // Update schedule with last run time and next run time
    const nextRun = calculateNextRun(schedule.frequency);
    await db
      .update(prospectingSchedules)
      .set({
        lastRunAt: new Date(),
        nextRunAt: nextRun,
      })
      .where(eq(prospectingSchedules.id, schedule.id));

    console.log(`[Scheduler] Completed prospecting run for schedule ${schedule.id}. Next run: ${nextRun}`);
  } catch (error) {
    console.error(`[Scheduler] Error executing prospecting run:`, error);
  }
}

/**
 * Schedule a prospecting job
 */
export function scheduleProspectingJob(schedule: any) {
  // Remove existing job if any
  if (activeJobs.has(schedule.id)) {
    const existing = activeJobs.get(schedule.id);
    existing?.task.stop();
    activeJobs.delete(schedule.id);
  }

  // Create new cron job
  const cronExpression = frequencyToCron(schedule.frequency);
  const task = cron.schedule(
    cronExpression,
    () => {
      executeProspectingRun(schedule);
    }
  );

  activeJobs.set(schedule.id, { scheduleId: schedule.id, task });
  console.log(`[Scheduler] Scheduled job ${schedule.id} (${schedule.name}) with cron: ${cronExpression}`);
}

/**
 * Unschedule a prospecting job
 */
export function unscheduleProspectingJob(scheduleId: number) {
  const job = activeJobs.get(scheduleId);
  if (job) {
    job.task.stop();
    activeJobs.delete(scheduleId);
    console.log(`[Scheduler] Unscheduled job ${scheduleId}`);
  }
}

/**
 * Initialize scheduler - load all active schedules from database
 */
export async function initializeScheduler() {
  console.log("[Scheduler] Initializing prospecting scheduler...");

  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Scheduler] Database not available, skipping scheduler initialization");
      return;
    }

    // Load all active schedules
    const activeSchedules = await db
      .select()
      .from(prospectingSchedules)
      .where(eq(prospectingSchedules.isActive, 1));

    console.log(`[Scheduler] Found ${activeSchedules.length} active schedules`);

    // Schedule each one
    for (const schedule of activeSchedules) {
      scheduleProspectingJob(schedule);

      // If nextRunAt is in the past or not set, update it
      if (!schedule.nextRunAt || schedule.nextRunAt < new Date()) {
        const nextRun = calculateNextRun(schedule.frequency);
        await db
          .update(prospectingSchedules)
          .set({ nextRunAt: nextRun })
          .where(eq(prospectingSchedules.id, schedule.id));
      }
    }

    console.log("[Scheduler] Scheduler initialized successfully");
  } catch (error) {
    console.error("[Scheduler] Failed to initialize scheduler:", error);
  }
}

/**
 * Manually trigger a prospecting run (for testing or immediate execution)
 */
export async function triggerProspectingRun(scheduleId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const schedules = await db.select().from(prospectingSchedules).where(eq(prospectingSchedules.id, scheduleId)).limit(1);
  const schedule = schedules[0];

  if (!schedule) {
    throw new Error(`Schedule ${scheduleId} not found`);
  }

  await executeProspectingRun(schedule);
}
