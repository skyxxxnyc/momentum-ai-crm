import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import type { User } from "../drizzle/schema";

export interface NotificationPayload {
  id: string;
  type: "deal_update" | "task_assigned" | "ai_insight" | "stale_deal" | "hot_lead" | "team_activity";
  title: string;
  message: string;
  data?: any;
  userId: number;
  createdAt: Date;
  read: boolean;
}

let io: SocketIOServer | null = null;

export function initializeWebSocket(httpServer: HTTPServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    path: "/api/socket.io",
  });

  io.on("connection", (socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`);

    // Join user-specific room
    socket.on("join", (userId: number) => {
      socket.join(`user:${userId}`);
      console.log(`[WebSocket] User ${userId} joined their room`);
    });

    // Leave user room
    socket.on("leave", (userId: number) => {
      socket.leave(`user:${userId}`);
      console.log(`[WebSocket] User ${userId} left their room`);
    });

    socket.on("disconnect", () => {
      console.log(`[WebSocket] Client disconnected: ${socket.id}`);
    });
  });

  console.log("[WebSocket] Socket.IO server initialized");
  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

/**
 * Send notification to specific user
 */
export function sendNotificationToUser(userId: number, notification: NotificationPayload) {
  const socketIO = getIO();
  if (!socketIO) {
    console.warn("[WebSocket] Socket.IO not initialized");
    return false;
  }

  socketIO.to(`user:${userId}`).emit("notification", notification);
  console.log(`[WebSocket] Notification sent to user ${userId}:`, notification.type);
  return true;
}

/**
 * Broadcast notification to all connected users
 */
export function broadcastNotification(notification: Omit<NotificationPayload, "userId">) {
  const socketIO = getIO();
  if (!socketIO) {
    console.warn("[WebSocket] Socket.IO not initialized");
    return false;
  }

  socketIO.emit("notification", notification);
  console.log(`[WebSocket] Broadcast notification:`, notification.type);
  return true;
}

/**
 * Send deal update notification
 */
export function notifyDealUpdate(params: {
  userId: number;
  dealId: number;
  dealTitle: string;
  action: "created" | "updated" | "status_changed" | "assigned";
  updatedBy?: string;
}) {
  const notification: NotificationPayload = {
    id: `deal-${params.dealId}-${Date.now()}`,
    type: "deal_update",
    title: "Deal Updated",
    message: `${params.dealTitle} was ${params.action}${params.updatedBy ? ` by ${params.updatedBy}` : ""}`,
    data: { dealId: params.dealId, action: params.action },
    userId: params.userId,
    createdAt: new Date(),
    read: false,
  };

  return sendNotificationToUser(params.userId, notification);
}

/**
 * Send task assignment notification
 */
export function notifyTaskAssigned(params: {
  userId: number;
  taskId: number;
  taskTitle: string;
  assignedBy?: string;
  dueDate?: Date;
}) {
  const notification: NotificationPayload = {
    id: `task-${params.taskId}-${Date.now()}`,
    type: "task_assigned",
    title: "New Task Assigned",
    message: `You've been assigned: ${params.taskTitle}${params.assignedBy ? ` by ${params.assignedBy}` : ""}`,
    data: { taskId: params.taskId, dueDate: params.dueDate },
    userId: params.userId,
    createdAt: new Date(),
    read: false,
  };

  return sendNotificationToUser(params.userId, notification);
}

/**
 * Send AI insight notification
 */
export function notifyAIInsight(params: {
  userId: number;
  insightType: "stale_deal" | "hot_lead" | "momentum_score" | "forecast";
  title: string;
  message: string;
  data?: any;
}) {
  const notification: NotificationPayload = {
    id: `ai-${params.insightType}-${Date.now()}`,
    type: "ai_insight",
    title: params.title,
    message: params.message,
    data: params.data,
    userId: params.userId,
    createdAt: new Date(),
    read: false,
  };

  return sendNotificationToUser(params.userId, notification);
}

/**
 * Send stale deal alert
 */
export function notifyStaleDeal(params: {
  userId: number;
  dealId: number;
  dealTitle: string;
  daysSinceUpdate: number;
}) {
  const notification: NotificationPayload = {
    id: `stale-${params.dealId}-${Date.now()}`,
    type: "stale_deal",
    title: "Stale Deal Alert",
    message: `${params.dealTitle} hasn't been updated in ${params.daysSinceUpdate} days`,
    data: { dealId: params.dealId, daysSinceUpdate: params.daysSinceUpdate },
    userId: params.userId,
    createdAt: new Date(),
    read: false,
  };

  return sendNotificationToUser(params.userId, notification);
}

/**
 * Send hot lead notification
 */
export function notifyHotLead(params: {
  userId: number;
  leadId: number;
  leadName: string;
  score: number;
}) {
  const notification: NotificationPayload = {
    id: `hotlead-${params.leadId}-${Date.now()}`,
    type: "hot_lead",
    title: "Hot Lead Detected",
    message: `${params.leadName} is a hot lead with score ${params.score}`,
    data: { leadId: params.leadId, score: params.score },
    userId: params.userId,
    createdAt: new Date(),
    read: false,
  };

  return sendNotificationToUser(params.userId, notification);
}
