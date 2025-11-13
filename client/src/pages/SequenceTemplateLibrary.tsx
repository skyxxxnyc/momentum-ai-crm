import { useState } from "react";
import { useLocation } from "wouter";
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
import { Badge } from "@/components/ui/badge";
import { BookTemplate, Eye, Copy, Trash2, Search, Filter, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function SequenceTemplateLibrary() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [previewTemplate, setPreviewTemplate] = useState<any | null>(null);
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const [cloneTemplate, setCloneTemplate] = useState<any | null>(null);
  const [cloneName, setCloneName] = useState("");
  const [cloneDescription, setCloneDescription] = useState("");

  const utils = trpc.useUtils();

  const { data: templates, isLoading } = trpc.sequenceTemplates.list.useQuery({
    search: searchTerm || undefined,
    category: selectedCategory,
  });

  const { data: categories } = trpc.sequenceTemplates.categories.useQuery();

  const deleteTemplate = trpc.sequenceTemplates.delete.useMutation({
    onSuccess: () => {
      utils.sequenceTemplates.list.invalidate();
      toast.success("Template deleted");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete template");
    },
  });

  const cloneToSequence = trpc.sequenceTemplates.cloneToSequence.useMutation({
    onSuccess: (data) => {
      toast.success("Sequence created from template");
      setCloneDialogOpen(false);
      setCloneTemplate(null);
      setCloneName("");
      setCloneDescription("");
      navigate(`/email-sequences/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to clone template");
    },
  });

  const handleClone = (template: any) => {
    setCloneTemplate(template);
    setCloneName(template.name + " (Copy)");
    setCloneDescription(template.description || "");
    setCloneDialogOpen(true);
  };

  const handleCloneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cloneTemplate || !cloneName.trim()) return;

    cloneToSequence.mutate({
      templateId: cloneTemplate.id,
      name: cloneName,
      description: cloneDescription || undefined,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Sequence Template Library</h1>
            <p className="text-muted-foreground mt-1">
              Save and reuse your most effective email sequences
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          {categories && categories.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={!selectedCategory ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(undefined)}
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading templates...</p>
          </div>
        ) : !templates || templates.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <BookTemplate className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  {searchTerm || selectedCategory
                    ? "No templates found matching your criteria"
                    : "No templates yet. Save a sequence as a template to get started."}
                </p>
                {!searchTerm && !selectedCategory && (
                  <Button onClick={() => navigate("/email-sequences")}>
                    Go to Email Sequences
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      {template.description && (
                        <CardDescription className="mt-1 line-clamp-2">
                          {template.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {template.category && (
                      <Badge variant="secondary">{template.category}</Badge>
                    )}
                    {template.tags && template.tags.length > 0 && (
                      template.tags.slice(0, 2).map((tag: string) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 bg-muted rounded">
                      <div className="text-xs text-muted-foreground">Steps</div>
                      <div className="text-lg font-bold">
                        {Array.isArray(template.steps) ? template.steps.length : 0}
                      </div>
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <div className="text-xs text-muted-foreground">Used</div>
                      <div className="text-lg font-bold flex items-center justify-center gap-1">
                        {template.usageCount || 0}
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewTemplate(template)}
                      className="flex-1"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleClone(template)}
                      className="flex-1"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Use
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm("Delete this template?")) {
                        deleteTemplate.mutate({ id: template.id });
                      }
                    }}
                    className="w-full text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Preview Dialog */}
        <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{previewTemplate?.name}</DialogTitle>
              <DialogDescription>{previewTemplate?.description}</DialogDescription>
            </DialogHeader>
            {previewTemplate && (
              <div className="space-y-4">
                {Array.isArray(previewTemplate.steps) && previewTemplate.steps.map((step: any, index: number) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                          {step.stepNumber}
                        </span>
                        <CardTitle className="text-base">
                          {step.delayDays > 0 && `Wait ${step.delayDays} day${step.delayDays !== 1 ? "s" : ""}, then `}
                          Email
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">Subject</Label>
                        <p className="text-sm font-medium">{step.subject}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Body</Label>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {step.body}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                Close
              </Button>
              <Button onClick={() => {
                setPreviewTemplate(null);
                handleClone(previewTemplate);
              }}>
                <Copy className="h-4 w-4 mr-2" />
                Use This Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Clone Dialog */}
        <Dialog open={cloneDialogOpen} onOpenChange={setCloneDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Sequence from Template</DialogTitle>
              <DialogDescription>
                Create a new email sequence based on this template
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCloneSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Sequence Name *</Label>
                <Input
                  id="name"
                  value={cloneName}
                  onChange={(e) => setCloneName(e.target.value)}
                  placeholder="e.g., Q1 Outreach Campaign"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={cloneDescription}
                  onChange={(e) => setCloneDescription(e.target.value)}
                  placeholder="Describe this sequence"
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCloneDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={!cloneName.trim() || cloneToSequence.isPending}>
                  Create Sequence
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
