import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookTemplate, 
  Eye, 
  Copy, 
  Mail, 
  Clock, 
  TrendingUp, 
  Users,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";

interface TemplateGalleryProps {
  showPublicOnly?: boolean;
}

export function TemplateGallery({ showPublicOnly = false }: TemplateGalleryProps) {
  const [, navigate] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [previewTemplate, setPreviewTemplate] = useState<any | null>(null);
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const [cloneTemplate, setCloneTemplate] = useState<any | null>(null);
  const [cloneName, setCloneName] = useState("");
  const [cloneDescription, setCloneDescription] = useState("");

  const utils = trpc.useUtils();

  const { data: templates, isLoading } = trpc.sequenceTemplates.list.useQuery({
    category: selectedCategory === "all" ? undefined : selectedCategory,
  });

  const cloneToSequence = trpc.sequenceTemplates.cloneToSequence.useMutation({
    onSuccess: (data) => {
      toast.success("Sequence created from template!");
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

  const handleUseTemplate = (template: any) => {
    setCloneTemplate(template);
    setCloneName(template.name);
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

  const filteredTemplates = showPublicOnly 
    ? templates?.filter(t => t.isPublic) 
    : templates;

  const categories = [
    { id: "all", label: "All Templates", icon: BookTemplate },
    { id: "Cold Outreach", label: "Cold Outreach", icon: Mail },
    { id: "Onboarding", label: "Onboarding", icon: Users },
    { id: "Re-engagement", label: "Re-engagement", icon: TrendingUp },
    { id: "Follow-up", label: "Follow-up", icon: ArrowRight },
    { id: "Product Updates", label: "Product Updates", icon: Sparkles },
  ];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Cold Outreach": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      "Onboarding": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      "Re-engagement": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      "Follow-up": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      "Product Updates": "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
    };
    return colors[category] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4 mb-2" />
              <div className="h-4 bg-muted rounded w-full" />
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <TabsTrigger key={cat.id} value={cat.id} className="gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{cat.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        {/* Template Grid */}
        {filteredTemplates && filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-1">{template.name}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {template.description}
                      </CardDescription>
                    </div>
                    {template.category && (
                      <Badge className={getCategoryColor(template.category)} variant="secondary">
                        {template.category}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <span>{template.steps?.length || 0} steps</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        {template.steps?.reduce((sum: number, s: any) => sum + s.delayDays, 0) || 0} days
                      </span>
                    </div>
                    {template.usageCount > 0 && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        <span>{template.usageCount} uses</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setPreviewTemplate(template)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      onClick={() => handleUseTemplate(template)}
                      size="sm"
                      className="flex-1"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookTemplate className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No templates found</h3>
              <p className="text-muted-foreground text-center">
                {selectedCategory === "all" 
                  ? "No templates available yet."
                  : `No templates in the ${selectedCategory} category.`}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name}</DialogTitle>
            <DialogDescription>{previewTemplate?.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {previewTemplate?.steps?.map((step: any, index: number) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      Step {step.stepNumber}: {step.subject}
                    </CardTitle>
                    <Badge variant="outline">
                      {step.delayDays === 0 ? "Immediate" : `+${step.delayDays} days`}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {step.body}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
              Close
            </Button>
            <Button onClick={() => {
              setPreviewTemplate(null);
              handleUseTemplate(previewTemplate);
            }}>
              <Copy className="h-4 w-4 mr-2" />
              Use This Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clone Dialog */}
      <Dialog open={cloneDialogOpen} onOpenChange={setCloneDialogOpen}>
        <DialogContent>
          <form onSubmit={handleCloneSubmit}>
            <DialogHeader>
              <DialogTitle>Create Sequence from Template</DialogTitle>
              <DialogDescription>
                Customize your new sequence based on this template
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Sequence Name</Label>
                <Input
                  id="name"
                  value={cloneName}
                  onChange={(e) => setCloneName(e.target.value)}
                  placeholder="Enter sequence name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={cloneDescription}
                  onChange={(e) => setCloneDescription(e.target.value)}
                  placeholder="Enter sequence description"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCloneDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={cloneToSequence.isPending}>
                {cloneToSequence.isPending ? "Creating..." : "Create Sequence"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
