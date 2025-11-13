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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {activity.userName?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{activity.userName || "User"}</span>
                  <span className={`text-sm ${getActionColor(activity.action)}`}>
                    {activity.action}
                  </span>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    {getIcon(activity.entityType)}
                    <span className="text-sm">{activity.entityType}</span>
                  </div>
                </div>
                {activity.entityName && (
                  <div className="text-sm font-medium mt-1">{activity.entityName}</div>
                )}
                {activity.description && (
                  <div className="text-xs text-muted-foreground mt-1">{activity.description}</div>
                )}
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
