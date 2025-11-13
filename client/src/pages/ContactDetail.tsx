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
  Mail,
  Phone,
  MapPin,
  Users,
  Target,
  Activity,
  Clock,
  Linkedin,
  Twitter,
  Briefcase,
} from "lucide-react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { formatDistanceToNow } from "date-fns";
import { EditableField } from "@/components/EditableField";
import { NotesList } from "@/components/NotesList";

export default function ContactDetail() {
  const params = useParams();
  const contactId = parseInt(params.id as string);

  const { data: contact, isLoading } = trpc.contacts.list.useQuery(undefined, {
    select: (contacts) => contacts.find((c: any) => c.id === contactId),
  });

  const { data: allCompanies } = trpc.companies.list.useQuery();
  const { data: allDeals } = trpc.deals.list.useQuery();
  const { data: activities } = trpc.activity.byEntity.useQuery(
    { entityType: "contact", entityId: contactId },
    { enabled: !!contactId }
  );

  const { addItem } = useRecentlyViewed();
  const utils = trpc.useUtils();

  const updateContact = trpc.contacts.update.useMutation({
    onSuccess: () => {
      utils.contacts.list.invalidate();
      toast.success("Contact updated");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update contact");
    },
  });

  // Track recently viewed
  if (contact) {
    addItem({
      id: contact.id,
      type: "contact",
      name: `${contact.firstName} ${contact.lastName || ""}`.trim(),
      path: `/contacts/${contact.id}`,
    });
  }

  // Find linked company and deals
  const company = allCompanies?.find((c: any) => c.id === contact?.companyId);
  const contactDeals = allDeals?.filter((d: any) => d.contactId === contactId) || [];

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

  if (!contact) {
    return (
      <div className="container py-8">
        <div className="text-center">Contact not found</div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/contacts">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-2xl">
                {contact.firstName?.charAt(0)}{contact.lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">
                {contact.firstName} {contact.lastName}
              </h1>
              {contact.title && (
                <p className="text-muted-foreground">{contact.title}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Company</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {company ? (
              <Link href={`/companies/${company.id}`}>
                <div className="text-lg font-bold hover:text-primary cursor-pointer">
                  {company.name}
                </div>
              </Link>
            ) : (
              <div className="text-sm text-muted-foreground">No company linked</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contactDeals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Relationship</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contact.relationshipStrength || 0}/100</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deals">Deals ({contactDeals.length})</TabsTrigger>
          <TabsTrigger value="activity">Activity ({activities?.length || 0})</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <EditableField
                    value={contact.email}
                    type="email"
                    onSave={async (value) => {
                      await updateContact.mutateAsync({ id: contactId, email: value });
                    }}
                    placeholder="email@example.com"
                    emptyText="Add email..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <EditableField
                    value={contact.phone}
                    type="tel"
                    onSave={async (value) => {
                      await updateContact.mutateAsync({ id: contactId, phone: value });
                    }}
                    placeholder="+1 (555) 123-4567"
                    emptyText="Add phone..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <EditableField
                    value={contact.title}
                    onSave={async (value) => {
                      await updateContact.mutateAsync({ id: contactId, title: value });
                    }}
                    placeholder="e.g., VP of Sales"
                    emptyText="Add title..."
                  />
                </div>
                {(contact.address || contact.city || contact.state) && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="text-sm">
                      {contact.address && <div>{contact.address}</div>}
                      {(contact.city || contact.state) && (
                        <div>
                          {contact.city}
                          {contact.city && contact.state && ", "}
                          {contact.state} {contact.zipCode}
                        </div>
                      )}
                      {contact.country && <div>{contact.country}</div>}
                    </div>
                  </div>
                )}
                {contact.title && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{contact.title}</span>
                  </div>
                )}
                {contact.linkedinUrl && (
                  <div className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={contact.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      LinkedIn Profile
                    </a>
                  </div>
                )}
                {contact.twitterUrl && (
                  <div className="flex items-center gap-2">
                    <Twitter className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={contact.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Twitter Profile
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Company Context */}
            {company && (
              <Card>
                <CardHeader>
                  <CardTitle>Company Context</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link href={`/companies/${company.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{company.name}</div>
                        {company.industry && (
                          <div className="text-sm text-muted-foreground">{company.industry}</div>
                        )}
                      </div>
                    </div>
                  </Link>
                  {company.description && (
                    <p className="text-sm text-muted-foreground">{company.description}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {contact.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {contact.notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="deals" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Deals</CardTitle>
                <Link href={`/deals/new?contactId=${contactId}&companyId=${contact.companyId || ""}`}>
                  <Button size="sm">Create Deal</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {contactDeals.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No deals yet. Create a deal to get started.
                </p>
              ) : (
                <div className="space-y-4">
                  {contactDeals.map((deal: any) => (
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
                All activity related to this contact
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
                Add notes and comments about this contact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotesList entityType="contact" entityId={contactId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
