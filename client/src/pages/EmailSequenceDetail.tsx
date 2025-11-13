import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BarChart3, Users, Mail, TrendingUp } from "lucide-react";
import { SequenceBuilder } from "@/components/SequenceBuilder";

export default function EmailSequenceDetail() {
  const params = useParams();
  const [, navigate] = useLocation();
  const sequenceId = parseInt(params.id as string);

  const { data: sequence, isLoading } = trpc.emailSequences.get.useQuery(
    { id: sequenceId },
    { enabled: !!sequenceId }
  );

  const { data: analytics } = trpc.emailSequences.analytics.useQuery(
    { id: sequenceId },
    { enabled: !!sequenceId }
  );

  const { data: enrollments } = trpc.emailSequences.enrollments.useQuery(
    { sequenceId },
    { enabled: !!sequenceId }
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading sequence...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!sequence) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Sequence not found</p>
          <Button onClick={() => navigate("/email-sequences")} className="mt-4">
            Back to Sequences
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-500";
      case "paused":
        return "bg-yellow-500/10 text-yellow-500";
      case "archived":
        return "bg-gray-500/10 text-gray-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/email-sequences")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{sequence.name}</h1>
            {sequence.description && (
              <p className="text-muted-foreground mt-1">{sequence.description}</p>
            )}
          </div>
          <Badge variant="secondary" className={getStatusColor(sequence.status)}>
            {sequence.status}
          </Badge>
        </div>

        {/* Analytics Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Enrolled
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.values(analytics?.enrollments || {}).reduce((a, b) => a + b, 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <Users className="inline h-3 w-3 mr-1" />
                Contacts in sequence
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Emails Sent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.emailsSent || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <Mail className="inline h-3 w-3 mr-1" />
                Total emails delivered
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Open Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.openRate || 0}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                Emails opened
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Click Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.clickRate || 0}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                <BarChart3 className="inline h-3 w-3 mr-1" />
                Links clicked
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="builder" className="space-y-4">
          <TabsList>
            <TabsTrigger value="builder">Sequence Builder</TabsTrigger>
            <TabsTrigger value="enrollments">
              Enrollments ({enrollments?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="builder">
            <Card>
              <CardHeader>
                <CardTitle>Build Your Sequence</CardTitle>
                <CardDescription>
                  Add and configure email steps for this automated sequence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SequenceBuilder sequenceId={sequenceId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="enrollments">
            <Card>
              <CardHeader>
                <CardTitle>Enrolled Contacts</CardTitle>
                <CardDescription>
                  Contacts currently enrolled in this sequence
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!enrollments || enrollments.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No contacts enrolled yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {enrollments.map((enrollment) => (
                      <div
                        key={enrollment.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{enrollment.contactName}</p>
                          <p className="text-sm text-muted-foreground">{enrollment.contactEmail}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">
                            Step {enrollment.currentStep}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {enrollment.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>
                  Detailed metrics for this email sequence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-3">Enrollment Status</h4>
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {analytics?.enrollments?.active || 0}
                        </div>
                        <p className="text-sm text-muted-foreground">Active</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {analytics?.enrollments?.completed || 0}
                        </div>
                        <p className="text-sm text-muted-foreground">Completed</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-gray-600">
                          {analytics?.enrollments?.unsubscribed || 0}
                        </div>
                        <p className="text-sm text-muted-foreground">Unsubscribed</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-3">Email Performance</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-muted rounded">
                        <span className="text-sm">Total Sent</span>
                        <span className="font-bold">{analytics?.emailsSent || 0}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted rounded">
                        <span className="text-sm">Open Rate</span>
                        <span className="font-bold">{analytics?.openRate || 0}%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted rounded">
                        <span className="text-sm">Click Rate</span>
                        <span className="font-bold">{analytics?.clickRate || 0}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
