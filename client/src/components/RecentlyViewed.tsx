import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, Target, Clock } from "lucide-react";
import { Link } from "wouter";

export function RecentlyViewed() {
  const { items } = useRecentlyViewed();

  if (items.length === 0) {
    return null;
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "contact":
        return <Users className="h-4 w-4" />;
      case "company":
        return <Building2 className="h-4 w-4" />;
      case "deal":
        return <Target className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5" />
          Recently Viewed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.map((item) => (
            <Link key={`${item.type}-${item.id}`} href={item.path}>
              <a className="flex items-center gap-3 p-2 rounded hover:bg-accent transition-colors">
                <div className="text-muted-foreground">{getIcon(item.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{item.name}</div>
                  <div className="text-xs text-muted-foreground">{getTypeLabel(item.type)}</div>
                </div>
              </a>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
