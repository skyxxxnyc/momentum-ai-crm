import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Mail, Plus, Send, Clock, Users } from "lucide-react";
import { toast } from "sonner";

export default function EmailSequences() {
  const [newSequenceName, setNewSequenceName] = useState("");
  const [newSequenceDesc, setNewSequenceDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const { data: sequences, isLoading, refetch } = trpc.email.listSequences.useQuery();
  const { data: templates } = trpc.email.templates.useQuery();

  const createMutation = trpc.email.createSequence.useMutation({
    onSuccess: () => {
      toast.success("Email sequence created");
      setNewSequenceName("");
      setNewSequenceDesc("");
      setIsCreating(false);
      refetch();
    },
  });

  const sendTestMutation = trpc.email.sendTest.useMutation({
    onSuccess: () => {
      toast.success("Test email sent");
    },
  });

  const handleCreate = () => {
    if (!newSequenceName.trim()) {
      toast.error("Please enter a sequence name");
      return;
    }
    createMutation.mutate({
      name: newSequenceName,
      description: newSequenceDesc,
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            Email Sequences
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Automate your outreach with intelligent email campaigns
          </p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="gap-2 btn-brutal w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              New Sequence
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Email Sequence</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Sequence Name</Label>
                <Input
                  value={newSequenceName}
                  onChange={(e) => setNewSequenceName(e.target.value)}
                  placeholder="e.g., Welcome Series"
                />
              </div>
              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Textarea
                  value={newSequenceDesc}
                  onChange={(e) => setNewSequenceDesc(e.target.value)}
                  placeholder="Describe the purpose..."
                  rows={3}
                />
              </div>
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending}
                className="w-full btn-brutal"
              >
                Create Sequence
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="card-brutal">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Send className="h-5 w-5 text-primary" />
            Email Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {templates?.map((template) => (
              <div
                key={template.id}
                className="p-4 border border-border bg-muted/30 space-y-3"
              >
                <div>
                  <h4 className="font-semibold text-sm sm:text-base">{template.name}</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">{template.subject}</p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full text-xs sm:text-sm">
                      Preview
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{template.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Subject</Label>
                        <div className="mt-1 p-2 bg-muted text-xs sm:text-sm">{template.subject}</div>
                      </div>
                      <div>
                        <Label>Body</Label>
                        <div
                          className="mt-1 p-4 bg-muted text-xs sm:text-sm"
                          dangerouslySetInnerHTML={{ __html: template.body }}
                        />
                      </div>
                      <Button
                        onClick={() => {
                          const email = prompt("Enter test email address:");
                          if (email) {
                            sendTestMutation.mutate({ to: email, templateId: template.id });
                          }
                        }}
                        className="w-full btn-brutal"
                      >
                        Send Test Email
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold">Your Sequences</h2>
        {sequences && sequences.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sequences.map((sequence) => (
              <Card key={sequence.id} className="card-brutal-sm">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg truncate">{sequence.name}</CardTitle>
                      {sequence.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                          {sequence.description}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={sequence.status === "active" ? "default" : "secondary"}
                      className="text-xs shrink-0"
                    >
                      {sequence.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-muted/50">
                      <div className="text-xs text-muted-foreground">Steps</div>
                      <div className="text-base sm:text-lg font-bold text-primary">0</div>
                    </div>
                    <div className="p-2 bg-muted/50">
                      <div className="text-xs text-muted-foreground">Enrolled</div>
                      <div className="text-base sm:text-lg font-bold text-primary">0</div>
                    </div>
                    <div className="p-2 bg-muted/50">
                      <div className="text-xs text-muted-foreground">Sent</div>
                      <div className="text-base sm:text-lg font-bold text-primary">0</div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Edit Steps
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-xs">
                      <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Enroll
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="card-brutal">
            <CardContent className="text-center py-8 sm:py-12">
              <Mail className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">No sequences yet</h3>
              <p className="text-sm text-muted-foreground mb-4 px-4">
                Create your first email sequence to automate your outreach
              </p>
              <Button onClick={() => setIsCreating(true)} className="btn-brutal">
                <Plus className="h-4 w-4 mr-2" />
                Create First Sequence
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="card-brutal bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">⚙️ Email Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs sm:text-sm">
          <p className="text-muted-foreground">
            To enable email sending, add your email provider credentials:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li className="break-words">
              <strong>Resend:</strong> Add <code className="bg-background px-1 text-xs">RESEND_API_KEY</code>
            </li>
            <li className="break-words">
              <strong>Gmail:</strong> Add <code className="bg-background px-1 text-xs">GMAIL_CLIENT_ID</code>
            </li>
          </ul>
          <p className="text-xs text-muted-foreground mt-3">
            Configure in Settings → Secrets panel
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
