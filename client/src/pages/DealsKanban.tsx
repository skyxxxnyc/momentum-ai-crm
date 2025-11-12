import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowLeft, TrendingUp, DollarSign } from "lucide-react";
import { toast } from "sonner";

const STAGES = [
  { id: "lead", label: "Lead", color: "bg-gray-500" },
  { id: "qualified", label: "Qualified", color: "bg-blue-500" },
  { id: "proposal", label: "Proposal", color: "bg-purple-500" },
  { id: "negotiation", label: "Negotiation", color: "bg-yellow-500" },
  { id: "closed_won", label: "Closed Won", color: "bg-green-500" },
  { id: "closed_lost", label: "Closed Lost", color: "bg-red-500" },
];

export default function DealsKanban() {
  const [draggedDeal, setDraggedDeal] = useState<any>(null);
  const utils = trpc.useUtils();
  const { data: deals } = trpc.deals.list.useQuery();
  
  const updateMutation = trpc.deals.update.useMutation({
    onSuccess: () => {
      utils.deals.list.invalidate();
      toast.success("Deal stage updated");
    },
  });

  const handleDragStart = (deal: any) => {
    setDraggedDeal(deal);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (stage: string) => {
    if (draggedDeal && draggedDeal.stage !== stage) {
      updateMutation.mutate({
        id: draggedDeal.id,
        stage: stage as any,
      });
    }
    setDraggedDeal(null);
  };

  const getDealsByStage = (stage: string) => {
    return deals?.filter(d => d.stage === stage) || [];
  };

  const getTotalValue = (stage: string) => {
    return getDealsByStage(stage).reduce((sum, deal) => sum + (deal.value || 0), 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/deals">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to List
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Deals Pipeline</h1>
            <p className="text-muted-foreground">Drag and drop to update deal stages</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {STAGES.map((stage) => {
          const stageDeals = getDealsByStage(stage.id);
          const totalValue = getTotalValue(stage.id);

          return (
            <div
              key={stage.id}
              className="flex flex-col"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(stage.id)}
            >
              <Card className="flex-1">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                      {stage.label}
                    </CardTitle>
                    <Badge variant="secondary">{stageDeals.length}</Badge>
                  </div>
                  <CardDescription className="text-xs">
                    ${(totalValue / 1000).toFixed(1)}K total
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {stageDeals.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No deals
                    </div>
                  ) : (
                    stageDeals.map((deal) => (
                      <Card
                        key={deal.id}
                        draggable
                        onDragStart={() => handleDragStart(deal)}
                        className="cursor-move hover:shadow-lg transition-shadow border-border"
                      >
                        <CardContent className="p-3">
                          <div className="space-y-2">
                            <h3 className="font-semibold text-sm line-clamp-2">
                              {deal.title}
                            </h3>
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <DollarSign className="h-3 w-3" />
                                <span>${(deal.value || 0).toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-1 text-primary">
                                <TrendingUp className="h-3 w-3" />
                                <span>{deal.probability}%</span>
                              </div>
                            </div>
                            {(deal.momentumScore || 0) > 0 && (
                              <div className="flex items-center gap-2">
                                <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary"
                                    style={{ width: `${deal.momentumScore}%` }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {deal.momentumScore}
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
