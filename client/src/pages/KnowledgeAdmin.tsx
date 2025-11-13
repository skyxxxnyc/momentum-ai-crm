import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, FileText, Trash2, Edit, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function KnowledgeAdmin() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Playbooks");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: articles, refetch } = trpc.knowledge.list.useQuery();
  const createMutation = trpc.knowledge.create.useMutation({
    onSuccess: () => {
      toast.success("Knowledge article created!");
      resetForm();
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = trpc.knowledge.update.useMutation({
    onSuccess: () => {
      toast.success("Knowledge article updated!");
      resetForm();
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = trpc.knowledge.delete.useMutation({
    onSuccess: () => {
      toast.success("Knowledge article deleted!");
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const resetForm = () => {
    setTitle("");
    setSlug("");
    setContent("");
    setCategory("Playbooks");
    setTags("");
    setFile(null);
    setEditingId(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Auto-generate slug from filename
      if (!slug) {
        const fileName = selectedFile.name.replace(/\.[^/.]+$/, "");
        setSlug(fileName.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
      }

      // Read file content
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setContent(text);
        
        // Try to extract title from markdown
        if (!title && selectedFile.name.endsWith(".md")) {
          const titleMatch = text.match(/^#\s+(.+)$/m);
          if (titleMatch) {
            setTitle(titleMatch[1]);
          }
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleSubmit = () => {
    if (!title || !slug || !content) {
      toast.error("Please fill in all required fields");
      return;
    }

    const data = {
      title,
      slug,
      content,
      category,
      tags,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (article: any) => {
    setEditingId(article.id);
    setTitle(article.title);
    setSlug(article.slug);
    setContent(article.content);
    setCategory(article.category || "Playbooks");
    setTags(article.tags || "");
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Knowledge Base Admin</h1>
        <p className="text-muted-foreground mt-2">
          Upload and manage knowledge articles, playbooks, and guidelines for AI agents
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit" : "Upload"} Knowledge Article</CardTitle>
          <CardDescription>
            Add playbooks, brand guidelines, or training materials for AI reference
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="AI Automation Playbook"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="ai-automation-playbook"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Playbooks">Playbooks</SelectItem>
                  <SelectItem value="Brand Guidelines">Brand Guidelines</SelectItem>
                  <SelectItem value="Sales Strategies">Sales Strategies</SelectItem>
                  <SelectItem value="Training">Training</SelectItem>
                  <SelectItem value="Templates">Templates</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="AI, Automation, Sales"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Upload File (Markdown, TXT, PDF)</Label>
            <div className="flex gap-2">
              <Input
                id="file"
                type="file"
                accept=".md,.txt,.pdf"
                onChange={handleFileUpload}
                className="flex-1"
              />
              {file && (
                <Button variant="outline" size="icon" onClick={() => setFile(null)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste or type article content..."
              className="min-h-[200px] font-mono text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              <Upload className="mr-2 h-4 w-4" />
              {editingId ? "Update" : "Upload"} Article
            </Button>
            {editingId && (
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Articles</CardTitle>
          <CardDescription>Manage your knowledge base content</CardDescription>
        </CardHeader>
        <CardContent>
          {!articles || articles.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No articles yet. Upload your first knowledge article above.
            </p>
          ) : (
            <div className="space-y-2">
              {articles.map((article) => (
                <div
                  key={article.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium truncate">{article.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {article.category} • {article.tags}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{article.title}</DialogTitle>
                        </DialogHeader>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <pre className="whitespace-pre-wrap text-sm">{article.content}</pre>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(article)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm("Delete this article?")) {
                          deleteMutation.mutate({ id: article.id });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
