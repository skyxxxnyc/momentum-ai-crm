import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Users, Building2, DollarSign, Target, Activity, Zap, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { ActivityFeed } from "@/components/ActivityFeed";

export default function Dashboard() {
  const { data: stats, isLoading } = trpc.dashboard.stats.useQuery();
  const { data: deals } = trpc.deals.list.useQuery();
  const { data: leads } = trpc.leads.hot.useQuery();

  if (isLoading) {
    return <div className="space-y-6"><Skeleton className="h-32 w-full" /></div>;
  }

  const kpiCards = [
    { title: "Total Revenue", value: `$${((stats?.totalRevenue || 0) / 1000).toFixed(1)}K`, icon: DollarSign, color: "text-green-500" },
    { title: "Active Deals", value: stats?.totalDeals || 0, icon: Target, color: "text-primary" },
    { title: "Contacts", value: stats?.totalContacts || 0, icon: Users, color: "text-accent" },
    { title: "Companies", value: stats?.totalCompanies || 0, icon: Building2, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 border-b-8 border-foreground pb-8">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">
            SYSTEM / OVERVIEW
          </span>
          <h1 className="text-6xl font-black uppercase tracking-tighter leading-none mt-2">
            Dashboard
          </h1>
          <p className="text-sm font-bold uppercase tracking-widest text-primary mt-2">
            Momentum AI Intelligence Unit
          </p>
        </div>
        <Link href="/ai-chat">
          <Button className="gap-2 w-full md:w-auto swiss-button">
            <Zap className="h-4 w-4" />
            AI ASSISTANT
          </Button>
        </Link>
      </div>

      <div className="grid gap-px bg-border grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-border">
        {kpiCards.map((kpi) => (
          <div key={kpi.title} className="bg-background p-8 flex flex-col gap-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              {kpi.title}
            </span>
            <div className="text-5xl font-black tracking-tighter">{kpi.value}</div>
            <div className="h-1 w-12 bg-primary" />
          </div>
        ))}
      </div>
      
      <div className="grid gap-12 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>
        <div className="space-y-12">
          <RecentlyViewed />
          <Card className="rounded-none border-2 border-primary bg-primary/5">
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-widest">System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider">All Systems Operational</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
