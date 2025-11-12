import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building2, Globe, MapPin, Phone, Mail, Users } from "lucide-react";
import { Link, useParams } from "wouter";
import { FileAttachments } from "@/components/FileAttachments";

export default function CompanyDetail() {
  const params = useParams();
  const companyId = parseInt(params.id as string);

  const { data: company, isLoading } = trpc.companies.list.useQuery(undefined, {
    select: (companies) => companies.find((c: any) => c.id === companyId),
  });

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
          {company.industry && (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/50">
              {company.industry}
            </Badge>
          )}
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
                  <p className="text-sm font-medium">{company.email}</p>
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
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
            <CardDescription>Intelligence and analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {company.aiSummary && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Summary</p>
                <p className="text-sm">{company.aiSummary}</p>
              </div>
            )}

            {company.painPoints && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Pain Points</p>
                <p className="text-sm">{company.painPoints}</p>
              </div>
            )}

            {company.salesOpportunities && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Sales Opportunities</p>
                <p className="text-sm">{company.salesOpportunities}</p>
              </div>
            )}

            {company.priorityLevel && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Priority Level</p>
                <Badge
                  variant={
                    company.priorityLevel === "high"
                      ? "default"
                      : company.priorityLevel === "medium"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {company.priorityLevel}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {company.description && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{company.description}</p>
          </CardContent>
        </Card>
      )}

      {/* File Attachments */}
      <FileAttachments entityType="company" entityId={companyId} />
    </div>
  );
}
