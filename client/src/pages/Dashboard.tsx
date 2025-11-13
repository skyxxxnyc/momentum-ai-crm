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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Welcome to Momentum AI</p>
        </div>
        <Link href="/ai-chat"><Button className="gap-2 w-full sm:w-auto btn-brutal"><Zap className="h-4 w-4" />AI Assistant</Button></Link>
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{kpi.value}</div></CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>
        <div className="space-y-6">
          <RecentlyViewed />
        </div>
      </div>
    </div>
  );
}
