import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Mail, Phone, Building2, Briefcase, Calendar } from "lucide-react";
import { Link, useParams } from "wouter";
import { FileAttachments } from "@/components/FileAttachments";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";

export default function ContactDetail() {
  const params = useParams();
  const contactId = parseInt(params.id as string);

  const { data: contact, isLoading } = trpc.contacts.list.useQuery(undefined, {
    select: (contacts) => contacts.find((c: any) => c.id === contactId),
  });

  const { data: companies } = trpc.companies.list.useQuery();
  const { data: deals } = trpc.deals.list.useQuery();
  const { data: activities } = trpc.activities.list.useQuery();
  const { addItem } = useRecentlyViewed();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12 text-muted-foreground">Loading contact...</div>
      </div>
    );
  }

  // Track recently viewed
  if (contact) {
    addItem({
      id: contact.id,
      type: "contact",
      name: contact.name || "Unnamed Contact",
      path: `/contacts/${contact.id}`,
    });
  }

  if (!contact) {
    return (
      <div className="space-y-6">
        <Card className="border-2">
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">Contact Not Found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              The contact you're looking for doesn't exist.
            </p>
            <Link href="/contacts">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Contacts
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Find related company
  const relatedCompany = companies?.find((c: any) => c.id === contact.companyId);

  // Find related deals
  const relatedDeals = deals?.filter((d: any) => d.contactId === contactId) || [];

  // Find related activities
  const relatedActivities = activities?.filter((a: any) => a.contactId === contactId) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/contacts">
          <Button variant="ghost" size="sm" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Contacts
          </Button>
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {contact.firstName} {contact.lastName}
            </h1>
            <p className="text-muted-foreground mt-1">Contact Profile</p>
          </div>
          {contact.relationshipStrength && (
            <Badge
              variant={
                contact.relationshipStrength === "strong"
                  ? "default"
                  : contact.relationshipStrength === "medium"
                  ? "secondary"
                  : "outline"
              }
            >
              {contact.relationshipStrength} relationship
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Information */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Basic details and contact info</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {contact.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {contact.email}
                  </a>
                </div>
              </div>
            )}

            {contact.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <a
                    href={`tel:${contact.phone}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {contact.phone}
                  </a>
                </div>
              </div>
            )}

            {contact.title && (
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Title</p>
                  <p className="text-sm font-medium">{contact.title}</p>
                </div>
              </div>
            )}

            {relatedCompany && (
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Company</p>
                  <Link href={`/companies/${relatedCompany.id}`}>
                    <p className="text-sm font-medium text-primary hover:underline">
                      {relatedCompany.name}
                    </p>
                  </Link>
                </div>
              </div>
            )}

            {contact.createdAt && (
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Added</p>
                  <p className="text-sm font-medium">
                    {new Date(contact.createdAt).toLocaleDateString()}
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
            <CardDescription>More information about this contact</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {contact.notes && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Notes</p>
                <p className="text-sm">{contact.notes}</p>
              </div>
            )}

            {contact.source && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Source</p>
                <Badge variant="outline">{contact.source}</Badge>
              </div>
            )}

            {contact.tags && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {JSON.parse(contact.tags || "[]").map((tag: string, idx: number) => (
                    <Badge key={idx} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Related Deals */}
      {relatedDeals.length > 0 && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Related Deals</CardTitle>
            <CardDescription>{relatedDeals.length} active deals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {relatedDeals.map((deal: any) => (
                <Link key={deal.id} href={`/deals/${deal.id}`}>
                  <div className="flex items-center justify-between p-3 border rounded hover:bg-accent cursor-pointer">
                    <div>
                      <p className="font-medium">{deal.title}</p>
                      <p className="text-sm text-muted-foreground">
                        ${deal.value?.toLocaleString() || 0} • {deal.stage}
                      </p>
                    </div>
                    <Badge variant="outline">{deal.probability}%</Badge>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Timeline */}
      {relatedActivities.length > 0 && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
            <CardDescription>{relatedActivities.length} activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {relatedActivities.slice(0, 5).map((activity: any) => (
                <div key={activity.id} className="flex gap-3 pb-3 border-b last:border-0">
                  <div className="flex-1">
                    <p className="font-medium">{activity.type}</p>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Attachments */}
      <FileAttachments entityType="contact" entityId={contactId} />
    </div>
  );
}
