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
    <div className="space-y-12">
      <div className="flex items-center justify-between border-b-4 border-foreground pb-8">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">
            CRM / PIPELINE / v1.0
          </span>
          <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">
            Deals Pipeline
          </h1>
        </div>
        <Link href="/deals">
          <Button variant="outline" size="sm" className="swiss-button">
            <ArrowLeft className="h-4 w-4 mr-2" />
            LIST VIEW
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-0 bg-border border border-border">
        {STAGES.map((stage) => {
          const stageDeals = getDealsByStage(stage.id);
          const totalValue = getTotalValue(stage.id);

          return (
            <div
              key={stage.id}
              className="flex flex-col bg-background border-r border-border last:border-r-0"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(stage.id)}
            >
              <div className="p-4 border-b-4 border-foreground bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-foreground">
                    {stage.label}
                  </span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 border border-foreground bg-foreground text-background">
                    {stageDeals.length}
                  </span>
                </div>
                <div className="text-sm font-black uppercase tracking-tighter">
                  ${(totalValue / 1000).toFixed(1)}K
                </div>
              </div>
              
              <div className="flex-1 p-3 space-y-3 min-h-[600px] bg-muted/5">
                {stageDeals.length === 0 ? (
                  <div className="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                    EMPTY
                  </div>
                ) : (
                  stageDeals.map((deal) => (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={() => handleDragStart(deal)}
                      className="bg-background border border-border p-4 hover:border-primary transition-all cursor-move group"
                    >
                      <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-tight group-hover:text-primary transition-colors">
                          {deal.title}
                        </h3>
                        <div className="flex items-end justify-between">
                          <div className="flex flex-col">
                            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-1">VALUE</span>
                            <span className="text-sm font-bold tracking-tighter">${(deal.value || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-1">PROB</span>
                            <span className="text-sm font-black tracking-tighter text-primary">{deal.probability}%</span>
                          </div>
                        </div>
                        {(deal.momentumScore || 0) > 0 && (
                          <div className="pt-2 border-t border-border/50">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">MOMENTUM</span>
                              <span className="text-[10px] font-black">{deal.momentumScore}</span>
                            </div>
                            <div className="h-1 bg-muted">
                              <div
                                className="h-full bg-foreground"
                                style={{ width: `${deal.momentumScore}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
