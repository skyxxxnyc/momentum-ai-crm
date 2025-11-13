import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, DollarSign, TrendingUp, Calendar, User, Building2 } from "lucide-react";
import { Link, useParams } from "wouter";
import { FileAttachments } from "@/components/FileAttachments";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";

export default function DealDetail() {
  const params = useParams();
  const dealId = parseInt(params.id as string);

  const { data: deal, isLoading } = trpc.deals.list.useQuery(undefined, {
    select: (deals) => deals.find((d: any) => d.id === dealId),
  });

  const { addItem } = useRecentlyViewed();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12 text-muted-foreground">Loading deal...</div>
      </div>
    );
  }

  // Track recently viewed
  if (deal) {
    addItem({
      id: deal.id,
      type: "deal",
      name: deal.title || "Unnamed Deal",
      path: `/deals/${deal.id}`,
    });
  }

  if (!deal) {
    return (
      <div className="space-y-6">
        <Card className="border-2">
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">Deal Not Found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              The deal you're looking for doesn't exist.
            </p>
            <Link href="/deals">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Deals
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      lead: "bg-gray-500",
      qualified: "bg-blue-500",
      proposal: "bg-yellow-500",
      negotiation: "bg-orange-500",
      closed_won: "bg-primary",
      closed_lost: "bg-red-500",
    };
    return colors[stage] || "bg-gray-500";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/deals">
          <Button variant="ghost" size="sm" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Deals
          </Button>
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{deal.title}</h1>
            <p className="text-muted-foreground mt-1">Deal Details</p>
          </div>
          <Badge className={`${getStageColor(deal.stage)} text-white border-0`}>
            {deal.stage.replace("_", " ").toUpperCase()}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Deal Information */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Deal Information</CardTitle>
            <CardDescription>Key details about this opportunity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Value</p>
                <p className="text-lg font-semibold">
                  ${deal.value?.toLocaleString() || 0}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Probability</p>
                <p className="text-lg font-semibold">{deal.probability || 0}%</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-lg font-semibold">
                  {new Date(deal.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {deal.expectedCloseDate && (
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Expected Close</p>
                  <p className="text-lg font-semibold">
                    {new Date(deal.expectedCloseDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Additional Details</CardTitle>
            <CardDescription>More information about this deal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {deal.description && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="text-sm">{deal.description}</p>
              </div>
            )}

            {deal.source && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Source</p>
                <Badge variant="outline">{deal.source}</Badge>
              </div>
            )}

            {deal.lostReason && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Lost Reason</p>
                <p className="text-sm text-destructive">{deal.lostReason}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* File Attachments */}
      <FileAttachments entityType="deal" entityId={dealId} />
    </div>
  );
}
