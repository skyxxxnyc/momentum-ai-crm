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
  Globe,
  MapPin,
  Phone,
  Users,
  Target,
  Activity,
  Clock,
  DollarSign,
  Briefcase,
  Mail,
} from "lucide-react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { formatDistanceToNow } from "date-fns";

export default function CompanyDetail() {
  const params = useParams();
  const companyId = parseInt(params.id as string);

  const { data: company, isLoading } = trpc.companies.list.useQuery(undefined, {
    select: (companies) => companies.find((c: any) => c.id === companyId),
  });

  const { data: allContacts } = trpc.contacts.list.useQuery();
  const { data: allDeals } = trpc.deals.list.useQuery();
  const { data: activities } = trpc.activity.byEntity.useQuery(
    { entityType: "company", entityId: companyId },
    { enabled: !!companyId }
  );

  const { addItem } = useRecentlyViewed();

  // Track recently viewed
  if (company) {
    addItem({
      id: company.id,
      type: "company",
      name: company.name || "Unnamed Company",
      path: `/companies/${company.id}`,
    });
  }

  // Filter contacts and deals for this company
  const companyContacts = allContacts?.filter((c: any) => c.companyId === companyId) || [];
  const companyDeals = allDeals?.filter((d: any) => d.companyId === companyId) || [];

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

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container py-8">
        <div className="text-center">Company not found</div>
      </div>
    );
  }

  const totalDealValue = companyDeals.reduce((sum: number, deal: any) => sum + (deal.value || 0), 0);

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/companies">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{company.name}</h1>
            {company.industry && (
              <p className="text-muted-foreground">{company.industry}</p>
            )}
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companyContacts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companyDeals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalDealValue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Relationship</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{company.relationshipStrength || 0}/100</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contacts">Contacts ({companyContacts.length})</TabsTrigger>
          <TabsTrigger value="deals">Deals ({companyDeals.length})</TabsTrigger>
          <TabsTrigger value="activity">Activity ({activities?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {company.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      {company.website}
                    </a>
                  </div>
                )}
                {company.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{company.phone}</span>
                  </div>
                )}
                {(company.address || company.city || company.state) && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="text-sm">
                      {company.address && <div>{company.address}</div>}
                      {(company.city || company.state) && (
                        <div>
                          {company.city}
                          {company.city && company.state && ", "}
                          {company.state} {company.zipCode}
                        </div>
                      )}
                      {company.country && <div>{company.country}</div>}
                    </div>
                  </div>
                )}
                {company.size && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{company.size}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            {company.description && (
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{company.description}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Contacts</CardTitle>
                <Link href={`/contacts/new?companyId=${companyId}`}>
                  <Button size="sm">Add Contact</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {companyContacts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No contacts yet. Add a contact to get started.
                </p>
              ) : (
                <div className="space-y-4">
                  {companyContacts.map((contact: any) => (
                    <Link key={contact.id} href={`/contacts/${contact.id}`}>
                      <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
                        <Avatar>
                          <AvatarFallback>
                            {contact.firstName?.charAt(0)}{contact.lastName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium">
                            {contact.firstName} {contact.lastName}
                          </div>
                          {contact.title && (
                            <div className="text-sm text-muted-foreground">{contact.title}</div>
                          )}
                          {contact.email && (
                            <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <Mail className="h-3 w-3" />
                              {contact.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deals" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Deals</CardTitle>
                <Link href={`/deals/new?companyId=${companyId}`}>
                  <Button size="sm">Create Deal</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {companyDeals.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No deals yet. Create a deal to get started.
                </p>
              ) : (
                <div className="space-y-4">
                  {companyDeals.map((deal: any) => (
                    <Link key={deal.id} href={`/deals/${deal.id}`}>
                      <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
                        <div className="flex-1">
                          <div className="font-medium">{deal.title}</div>
                          {deal.description && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {deal.description}
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{deal.stage}</Badge>
                            {deal.value && (
                              <span className="text-sm font-medium">
                                ${deal.value.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity History</CardTitle>
              <CardDescription>
                All activity related to this company and its contacts
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
      </Tabs>
    </div>
  );
}
