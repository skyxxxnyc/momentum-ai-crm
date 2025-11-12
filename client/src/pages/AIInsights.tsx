import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, AlertTriangle, Zap, DollarSign, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function AIInsights() {
  const { data: forecast, isLoading: forecastLoading } = trpc.ai.generateForecast.useQuery({ months: 6 });
  const { data: staleDeals, isLoading: staleLoading, refetch: refetchStale } = trpc.ai.detectStaleDeals.useQuery();
  const utils = trpc.useUtils();

  const scoreMutation = trpc.ai.calculateMomentumScore.useMutation({
    onSuccess: () => {
      toast.success("Momentum scores updated");
      utils.deals.list.invalidate();
    },
  });

  if (forecastLoading || staleLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  const maxForecast = Math.max(...(forecast?.map(f => f.value) || [0]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <Zap className="h-8 w-8 text-primary" />
            AI Insights
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Predictive intelligence and autonomous recommendations
          </p>
        </div>
        <Button
          onClick={() => refetchStale()}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Revenue Forecast */}
        <Card className="card-brutal">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Revenue Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {forecast && forecast.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {forecast.map((item, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{item.month}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-primary">
                              ${(item.value / 1000).toFixed(1)}K
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                item.confidence === "high"
                                  ? "border-primary text-primary"
                                  : item.confidence === "medium"
                                  ? "border-yellow-500 text-yellow-500"
                                  : "border-muted-foreground text-muted-foreground"
                              }`}
                            >
                              {item.confidence}
                            </Badge>
                          </div>
                        </div>
                        <div className="h-2 bg-muted">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${(item.value / maxForecast) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total 6-Month Forecast</span>
                      <span className="text-xl font-bold text-primary">
                        ${((forecast.reduce((sum, f) => sum + f.value, 0)) / 1000).toFixed(1)}K
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No forecast data available. Add deals to generate predictions.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stale Deals Alert */}
        <Card className="card-brutal">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Stale Deals Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {staleDeals && staleDeals.length > 0 ? (
                <>
                  {staleDeals.map((deal) => (
                    <div
                      key={deal.id}
                      className="p-4 bg-muted/50 border-l-4 border-primary space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{deal.title}</h4>
                          <p className="text-sm text-sm sm:text-base text-muted-foreground mt-1">
                            No activity for {deal.daysSinceUpdate} days
                          </p>
                        </div>
                        <Badge variant="destructive" className="ml-2">
                          Stale
                        </Badge>
                      </div>
                      <p className="text-sm text-primary">
                        💡 {deal.suggestion}
                      </p>
                    </div>
                  ))}
                  <div className="pt-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => toast.info("Notification sent to follow up on stale deals")}
                    >
                      Send Reminders
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="text-muted-foreground">All deals are active!</p>
                  <p className="text-sm text-sm sm:text-base text-muted-foreground mt-1">
                    No deals require immediate attention
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="card-brutal">
        <CardHeader>
          <CardTitle>AI-Powered Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => toast.info("Feature coming soon")}
            >
              <Zap className="h-6 w-6 text-primary" />
              <div className="text-center">
                <div className="font-semibold">Generate Leads</div>
                <div className="text-xs text-muted-foreground">From ICP profiles</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => toast.info("Feature coming soon")}
            >
              <DollarSign className="h-6 w-6 text-primary" />
              <div className="text-center">
                <div className="font-semibold">Score All Leads</div>
                <div className="text-xs text-muted-foreground">AI-powered ranking</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => toast.info("Feature coming soon")}
            >
              <TrendingUp className="h-6 w-6 text-primary" />
              <div className="text-center">
                <div className="font-semibold">Update Momentum</div>
                <div className="text-xs text-muted-foreground">Recalculate all scores</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
