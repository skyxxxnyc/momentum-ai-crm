import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Edit2, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";

export default function EmailTemplates() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("");

  const utils = trpc.useUtils();

  const { data: templates, isLoading } = trpc.emailTemplates.list.useQuery();

  const createTemplate = trpc.emailTemplates.create.useMutation({
    onSuccess: () => {
      utils.emailTemplates.list.invalidate();
      toast.success("Template created");
      handleClose();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create template");
    },
  });

  const updateTemplate = trpc.emailTemplates.update.useMutation({
    onSuccess: () => {
      utils.emailTemplates.list.invalidate();
      toast.success("Template updated");
      handleClose();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update template");
    },
  });

  const deleteTemplate = trpc.emailTemplates.delete.useMutation({
    onSuccess: () => {
      utils.emailTemplates.list.invalidate();
      toast.success("Template deleted");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete template");
    },
  });

  const handleClose = () => {
    setDialogOpen(false);
    setEditingId(null);
    setName("");
    setSubject("");
    setBody("");
    setCategory("");
  };

  const handleEdit = (template: any) => {
    setEditingId(template.id);
    setName(template.name);
    setSubject(template.subject);
    setBody(template.body);
    setCategory(template.category || "");
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !subject.trim() || !body.trim()) return;

    if (editingId) {
      updateTemplate.mutate({
        id: editingId,
        name,
        subject,
        body,
        category: category || undefined,
      });
    } else {
      createTemplate.mutate({
        name,
        subject,
        body,
        category: category || undefined,
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Email Templates</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage reusable email templates
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading templates...</p>
          </div>
        ) : !templates || templates.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  No email templates yet. Create your first template to get started.
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      {template.category && (
                        <CardDescription className="mt-1">{template.category}</CardDescription>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(template)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm("Delete this template?")) {
                            deleteTemplate.mutate({ id: template.id });
                          }
                        }}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Subject:</p>
                      <p className="text-sm">{template.subject}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Preview:</p>
                      <p className="text-sm line-clamp-3">{template.body}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Template" : "Create Template"}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Update your email template"
                  : "Create a reusable email template"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Follow-up Email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Sales, Support"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject line"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Email Body *</Label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Email content"
                  className="min-h-[200px]"
                  required
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    !name.trim() ||
                    !subject.trim() ||
                    !body.trim() ||
                    createTemplate.isPending ||
                    updateTemplate.isPending
                  }
                >
                  {editingId ? "Update" : "Create"} Template
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
