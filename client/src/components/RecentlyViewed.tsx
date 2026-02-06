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
    <div className="swiss-card">
      <div className="flex items-center justify-between mb-6 pb-2 border-b-2 border-foreground">
        <h3 className="text-sm font-black uppercase tracking-widest">History</h3>
        <Clock className="h-4 w-4 text-primary" />
      </div>
      <div className="space-y-1">
        {items.map((item) => (
          <Link key={`${item.type}-${item.id}`} href={item.path}>
            <a className="flex items-center gap-4 p-3 border border-transparent hover:border-border hover:bg-muted transition-all group">
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
                  {getTypeLabel(item.type)}
                </div>
                <div className="font-bold truncate mt-1">{item.name}</div>
              </div>
              <div className="text-muted-foreground opacity-20 group-hover:opacity-100 transition-opacity">
                {getIcon(item.type)}
              </div>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}
