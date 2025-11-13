import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Building2,
  Globe,
  MapPin,
  Phone,
  Mail,
  Users,
  Edit,
  Save,
  X,
  TrendingUp,
  Target,
  Lightbulb,
  Briefcase,
} from "lucide-react";
import { Link, useParams } from "wouter";
import { FileAttachments } from "@/components/FileAttachments";
import { toast } from "sonner";

export default function CompanyDetail() {
  const params = useParams();
  const companyId = parseInt(params.id as string);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});

  const utils = trpc.useUtils();

  const { data: company, isLoading } = trpc.companies.list.useQuery(undefined, {
    select: (companies) => companies.find((c: any) => c.id === companyId),
  });

  const { data: contacts } = trpc.contacts.list.useQuery();
  const { data: deals } = trpc.deals.list.useQuery();
  const { data: activities } = trpc.activities.list.useQuery();

  const updateMutation = trpc.companies.update.useMutation({
    onSuccess: () => {
      utils.companies.list.invalidate();
      toast.success("Company updated successfully");
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleEdit = () => {
    setEditData({
      name: company.name,
      website: company.website || "",
      phone: company.phone || "",
      email: company.email || "",
      address: company.address || "",
      industry: company.industry || "",
      employeeCount: company.employeeCount || "",
      revenue: company.revenue || "",
      description: company.description || "",
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateMutation.mutate({ id: companyId, ...editData });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12 text-muted-foreground">Loading company...</div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="space-y-6">
        <Card className="border-2">
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">Company Not Found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              The company you're looking for doesn't exist.
            </p>
            <Link href="/companies">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Companies
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Find related contacts
  const relatedContacts = contacts?.filter((c: any) => c.companyId === companyId) || [];

  // Find related deals
  const relatedDeals = deals?.filter((d: any) => d.companyId === companyId) || [];

  // Find related activities
  const relatedActivities = activities?.filter((a: any) => a.companyId === companyId) || [];

  // Parse AI insights if available
  const painPoints = company.painPoints ? JSON.parse(company.painPoints) : [];
  const salesOpportunities = company.salesOpportunities ? JSON.parse(company.salesOpportunities) : [];
  const techStack = company.techStack ? JSON.parse(company.techStack) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/companies">
          <Button variant="ghost" size="sm" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Companies
          </Button>
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{company.name}</h1>
            <p className="text-muted-foreground mt-1">Company Profile</p>
          </div>
          <div className="flex gap-2 items-start">
            {!isEditing ? (
              <Button onClick={handleEdit} className="gap-2">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            ) : (
              <>
                <Button onClick={handleSave} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save
                </Button>
                <Button onClick={handleCancel} variant="outline" className="gap-2">
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </>
            )}
            {company.industry && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/50">
                {company.industry}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Company Information */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>Basic details and contact info</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input
                    value={editData.website}
                    onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input
                    value={editData.address}
                    onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Input
                    value={editData.industry}
                    onChange={(e) => setEditData({ ...editData, industry: e.target.value })}
                  />
                </div>
              </>
            ) : (
              <>
                {company.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Website</p>
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {company.website}
                      </a>
                    </div>
                  </div>
                )}

                {company.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="text-sm font-medium">{company.phone}</p>
                    </div>
                  </div>
                )}

                {company.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <a
                        href={`mailto:${company.email}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {company.email}
                      </a>
                    </div>
                  </div>
                )}

                {company.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="text-sm font-medium">{company.address}</p>
                    </div>
                  </div>
                )}

                {company.employeeCount && (
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Employees</p>
                      <p className="text-sm font-medium">{company.employeeCount}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Business Metrics */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Business Metrics</CardTitle>
            <CardDescription>Company size and performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {company.revenue && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Annual Revenue</p>
                <p className="text-2xl font-bold text-primary">{company.revenue}</p>
              </div>
            )}

            {company.relationshipStrength && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Relationship Strength</p>
                <Badge
                  variant={
                    company.relationshipStrength === "strong"
                      ? "default"
                      : company.relationshipStrength === "medium"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {company.relationshipStrength}
                </Badge>
              </div>
            )}

            {company.priorityLevel && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Priority Level</p>
                <Badge variant="outline">{company.priorityLevel}</Badge>
              </div>
            )}

            {company.description && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="text-sm">{company.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      {(painPoints.length > 0 || salesOpportunities.length > 0) && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Pain Points */}
          {painPoints.length > 0 && (
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  AI-Identified Pain Points
                </CardTitle>
                <CardDescription>Potential challenges and needs</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {painPoints.map((point: string, idx: number) => (
                    <li key={idx} className="flex gap-2 text-sm">
                      <span className="text-primary mt-1">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Sales Opportunities */}
          {salesOpportunities.length > 0 && (
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Sales Opportunities
                </CardTitle>
                <CardDescription>Recommended talking points and solutions</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {salesOpportunities.map((opp: string, idx: number) => (
                    <li key={idx} className="flex gap-2 text-sm">
                      <span className="text-primary mt-1">•</span>
                      <span>{opp}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Tech Stack */}
      {techStack.length > 0 && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Technology Stack</CardTitle>
            <CardDescription>Detected technologies and tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech: string, idx: number) => (
                <Badge key={idx} variant="secondary">
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Related Contacts */}
      {relatedContacts.length > 0 && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Related Contacts</CardTitle>
            <CardDescription>{relatedContacts.length} contacts at this company</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {relatedContacts.map((contact: any) => (
                <Link key={contact.id} href={`/contacts/${contact.id}`}>
                  <div className="flex items-center justify-between p-3 border rounded hover:bg-accent cursor-pointer">
                    <div>
                      <p className="font-medium">
                        {contact.firstName} {contact.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{contact.title || "No title"}</p>
                    </div>
                    {contact.email && (
                      <p className="text-sm text-muted-foreground">{contact.email}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
      <FileAttachments entityType="company" entityId={companyId} />
    </div>
  );
}
