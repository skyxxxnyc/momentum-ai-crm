import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Building2,
  Users,
  Target,
  Activity,
  Clock,
  DollarSign,
  Calendar,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { formatDistanceToNow } from "date-fns";
import { EditableField } from "@/components/EditableField";
import { NotesList } from "@/components/NotesList";

export default function DealDetail() {
  const params = useParams();
  const dealId = parseInt(params.id as string);

  const { data: deal, isLoading } = trpc.deals.list.useQuery(undefined, {
    select: (deals) => deals.find((d: any) => d.id === dealId),
  });

  const { data: allCompanies } = trpc.companies.list.useQuery();
  const { data: allContacts } = trpc.contacts.list.useQuery();
  const { data: activities } = trpc.activity.byEntity.useQuery(
    { entityType: "deal", entityId: dealId },
    { enabled: !!dealId }
  );

  const { addItem } = useRecentlyViewed();
  const utils = trpc.useUtils();

  const updateDeal = trpc.deals.update.useMutation({
    onSuccess: () => {
      utils.deals.list.invalidate();
      toast.success("Deal updated");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update deal");
    },
  });

  // Track recently viewed
  if (deal) {
    addItem({
      id: deal.id,
      type: "deal",
      name: deal.title || "Unnamed Deal",
      path: `/deals/${deal.id}`,
    });
  }

  // Find linked company and contact
  const company = allCompanies?.find((c: any) => c.id === deal?.companyId);
  const contact = allContacts?.find((c: any) => c.id === deal?.contactId);

  const getIcon = (entityType: string) => {
    switch (entityType) {
      case "contact":
        return <Users className="h-4 w-4" />;
      case "company":
        return <Building2 className="h-4 w-4" />;
      case "deal":
        return <Target className="h-4 w-4" />;
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

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "closed_won":
        return "bg-green-500";
      case "closed_lost":
        return "bg-red-500";
      case "negotiation":
        return "bg-yellow-500";
      case "proposal":
        return "bg-blue-500";
      case "qualified":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case "healthy":
        return "text-green-500";
      case "at_risk":
        return "text-yellow-500";
      case "stale":
        return "text-orange-500";
      case "critical":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="container py-8">
        <div className="text-center">Deal not found</div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/deals">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{deal.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={getStageColor(deal.stage)}>
                {deal.stage?.replace("_", " ").toUpperCase()}
              </Badge>
              {deal.isHot && (
                <Badge variant="destructive">🔥 Hot Deal</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deal Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(deal.value || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Probability</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deal.probability || 0}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Momentum Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deal.momentumScore || 0}/100</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deal Health</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-lg font-bold ${getHealthColor(deal.dealHealth)}`}>
              {deal.dealHealth?.replace("_", " ").toUpperCase() || "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity ({activities?.length || 0})</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Deal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Deal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <EditableField
                    value={deal.description}
                    type="textarea"
                    onSave={async (value) => {
                      await updateDeal.mutateAsync({ id: dealId, description: value });
                    }}
                    placeholder="Enter deal description"
                    emptyText="Add description..."
                    displayClassName="text-sm text-muted-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Deal Value</label>
                  <EditableField
                    value={deal.value}
                    type="number"
                    onSave={async (value) => {
                      await updateDeal.mutateAsync({ id: dealId, value: parseInt(value) || 0 });
                    }}
                    placeholder="0"
                    emptyText="Add value..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Probability (%)</label>
                  <EditableField
                    value={deal.probability}
                    type="number"
                    onSave={async (value) => {
                      await updateDeal.mutateAsync({ id: dealId, probability: parseInt(value) || 0 });
                    }}
                    placeholder="0"
                    emptyText="Add probability..."
                  />
                </div>
                {deal.expectedCloseDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Expected Close Date</p>
                      <p className="text-sm font-medium">
                        {new Date(deal.expectedCloseDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
                {deal.actualCloseDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Actual Close Date</p>
                      <p className="text-sm font-medium">
                        {new Date(deal.actualCloseDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
                {deal.lastActivityAt && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Last Activity</p>
                      <p className="text-sm font-medium">
                        {formatDistanceToNow(new Date(deal.lastActivityAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Related Entities */}
            <Card>
              <CardHeader>
                <CardTitle>Related Entities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {company ? (
                  <Link href={`/companies/${company.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Company</p>
                        <div className="font-medium">{company.name}</div>
                        {company.industry && (
                          <div className="text-sm text-muted-foreground">{company.industry}</div>
                        )}
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="text-sm text-muted-foreground">No company linked</div>
                )}

                {contact ? (
                  <Link href={`/contacts/${contact.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
                      <Avatar>
                        <AvatarFallback>
                          {contact.firstName?.charAt(0)}{contact.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm text-muted-foreground">Contact</p>
                        <div className="font-medium">
                          {contact.firstName} {contact.lastName}
                        </div>
                        {contact.title && (
                          <div className="text-sm text-muted-foreground">{contact.title}</div>
                        )}
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="text-sm text-muted-foreground">No contact linked</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity History</CardTitle>
              <CardDescription>
                All activity related to this deal
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!activities || activities.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No activity yet
                </p>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity: any) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0"
                    >
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
                          <div className="text-xs text-muted-foreground mt-1">
                            {activity.description}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>
                Add notes and comments about this deal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotesList entityType="deal" entityId={dealId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
