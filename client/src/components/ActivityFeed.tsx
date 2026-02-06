import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Activity, Users, Building2, Target, FileText, Zap, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function ActivityFeed() {
  const { data: activities, isLoading } = trpc.activity.recent.useQuery({ limit: 10 });

  const getIcon = (entityType: string) => {
    switch (entityType) {
      case "contact":
        return <Users className="h-4 w-4" />;
      case "company":
        return <Building2 className="h-4 w-4" />;
      case "deal":
        return <Target className="h-4 w-4" />;
      case "lead":
        return <Zap className="h-4 w-4" />;
      case "article":
        return <FileText className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "created":
        return "text-green-500";
      case "updated":
        return "text-blue-500";
      case "deleted":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">No recent activity</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="swiss-card">
      <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-foreground">
        <h3 className="text-xl font-black uppercase tracking-tight">Recent Activity</h3>
        <Activity className="h-5 w-5 text-primary" />
      </div>
      <div className="space-y-0">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-6 py-6 border-b border-border last:border-0 group">
            <div className="flex-none">
              <Avatar className="h-12 w-12 rounded-none border border-border">
                <AvatarFallback className="bg-background text-foreground font-black">
                  {activity.userName?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-black uppercase tracking-widest">{activity.userName || "User"}</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 border ${getActionColor(activity.action).replace('text-', 'border-').replace('text-', 'text-')}`}>
                  {activity.action}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {activity.entityType}
                </span>
              </div>
              {activity.entityName && (
                <div className="text-lg font-black uppercase tracking-tighter mt-2 group-hover:text-primary transition-colors line-clamp-1">
                  {activity.entityName}
                </div>
              )}
              {activity.description && (
                <div className="text-xs text-muted-foreground mt-1 font-medium leading-relaxed">
                  {activity.description}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8">
        <button className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors flex items-center gap-2">
          View All Activity <TrendingUp className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
