import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: "deal_update" | "task_assigned" | "ai_insight" | "stale_deal" | "hot_lead" | "team_activity";
  title: string;
  message: string;
  data?: any;
  userId: number;
  createdAt: Date;
  read: boolean;
}

interface WebSocketContextType {
  socket: Socket | null;
  connected: boolean;
  notifications: Notification[];
  unreadCount: number;
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  connected: false,
  notifications: [],
  unreadCount: 0,
});

export function useWebSocket() {
  return useContext(WebSocketContext);
}

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Connect to WebSocket server
    const socketInstance = io({
      path: "/api/socket.io",
      transports: ["websocket", "polling"],
    });

    socketInstance.on("connect", () => {
      console.log("[WebSocket] Connected");
      setConnected(true);
      // Join user-specific room
      socketInstance.emit("join", user.id);
    });

    socketInstance.on("disconnect", () => {
      console.log("[WebSocket] Disconnected");
      setConnected(false);
    });

    // Listen for notifications
    socketInstance.on("notification", (notification: Notification) => {
      console.log("[WebSocket] Received notification:", notification);
      
      // Add to notifications list
      setNotifications((prev) => [notification, ...prev]);

      // Show toast notification
      toast(notification.title, {
        description: notification.message,
        action: notification.data?.dealId
          ? {
              label: "View",
              onClick: () => {
                window.location.href = `/deals`;
              },
            }
          : undefined,
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.emit("leave", user.id);
      socketInstance.disconnect();
    };
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <WebSocketContext.Provider value={{ socket, connected, notifications, unreadCount }}>
      {children}
    </WebSocketContext.Provider>
  );
}
