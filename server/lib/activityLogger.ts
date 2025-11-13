import { getDb } from "../db";
import { activity_log } from "../../drizzle/schema";

export interface LogActivityParams {
  userId: number;
  action: string;
  entityType: string;
  entityId?: number;
  entityName?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export async function logActivity(params: LogActivityParams) {
  const db = await getDb();
  if (!db) {
    console.warn("[ActivityLogger] Database not available");
    return;
  }

  try {
    await db.insert(activity_log).values({
      userId: params.userId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      entityName: params.entityName,
      description: params.description,
      metadata: params.metadata,
    });
  } catch (error) {
    console.error("[ActivityLogger] Failed to log activity:", error);
  }
}
