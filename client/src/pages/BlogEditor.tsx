import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye, FileText } from "lucide-react";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/RichTextEditor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function BlogEditor() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "",
    tags: "",
    seoTitle: "",
    seoDescription: "",
    status: "draft" as "draft" | "published",
  });

  const utils = trpc.useUtils();
  const { data: posts, isLoading } = trpc.blog.listAll.useQuery();

  const createPost = trpc.blog.create.useMutation({
    onSuccess: () => {
      toast.success("Post created successfully");
      utils.blog.listAll.invalidate();
      closeEditor();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create post");
    },
  });

  const updatePost = trpc.blog.update.useMutation({
    onSuccess: () => {
      toast.success("Post updated successfully");
      utils.blog.listAll.invalidate();
      closeEditor();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update post");
    },
  });

  const deletePost = trpc.blog.delete.useMutation({
    onSuccess: () => {
      toast.success("Post deleted");
      utils.blog.listAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete post");
    },
  });

  const openEditor = (post?: any) => {
    if (post) {
      setEditingPost(post);
      setFormData({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || "",
        category: post.category || "",
        tags: post.tags ? JSON.parse(post.tags).join(", ") : "",
        seoTitle: post.seoTitle || "",
        seoDescription: post.seoDescription || "",
        status: post.status,
      });
    } else {
      setEditingPost(null);
      setFormData({
        title: "",
        content: "",
        excerpt: "",
        category: "",
        tags: "",
        seoTitle: "",
        seoDescription: "",
        status: "draft",
      });
    }
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setEditingPost(null);
  };

  const handleSave = () => {
    if (!formData.title || !formData.content) {
      toast.error("Title and content are required");
      return;
    }

    const tags = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingPost) {
      updatePost.mutate({
        id: editingPost.id,
        ...formData,
        tags,
      });
    } else {
      createPost.mutate({
        ...formData,
        tags,
      });
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Editor</h1>
          <p className="text-muted-foreground mt-1">Manage your blog posts and content</p>
        </div>

        <Button onClick={() => openEditor()} className="gap-2">
          <Plus className="h-4 w-4" />
          New Post
        </Button>
      </div>

      {/* Posts List */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading posts...</div>
      ) : posts && posts.length > 0 ? (
        <div className="grid gap-4">
          {posts.map((post: any) => (
            <Card key={post.id} className="border-2">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{post.title}</CardTitle>
                      <Badge
                        variant="outline"
                        className={
                          post.status === "published"
                            ? "bg-lime-500/20 text-lime-500 border-lime-500/50"
                            : "bg-gray-500/20 text-gray-500 border-gray-500/50"
                        }
                      >
                        {post.status.toUpperCase()}
                      </Badge>
                    </div>
                    <CardDescription>
                      {post.category && `${post.category} • `}
                      Updated {formatDate(post.updatedAt)}
                      {post.publishedAt && ` • Published ${formatDate(post.publishedAt)}`}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {post.excerpt && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{post.excerpt}</p>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditor(post)}
                    className="gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>

                  {post.status === "published" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/blog/${post.slug}`, "_blank")}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this post?")) {
                        deletePost.mutate({ id: post.id });
                      }
                    }}
                    disabled={deletePost.isPending}
                    className="gap-2 ml-auto text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create your first blog post</p>
            <Button onClick={() => openEditor()} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Post
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? "Edit Post" : "Create New Post"}</DialogTitle>
            <DialogDescription>
              Write and publish your blog content
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Post title..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Content *</Label>
              <RichTextEditor
                content={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                placeholder="Write your post content..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                placeholder="Brief summary..."
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g., News, Tutorial"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  placeholder="e.g., AI, CRM, Sales"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seoTitle">SEO Title</Label>
              <Input
                id="seoTitle"
                placeholder="SEO-optimized title..."
                value={formData.seoTitle}
                onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seoDescription">SEO Description</Label>
              <Textarea
                id="seoDescription"
                placeholder="SEO meta description..."
                value={formData.seoDescription}
                onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={closeEditor} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={createPost.isPending || updatePost.isPending}
              className="flex-1"
            >
              {createPost.isPending || updatePost.isPending
                ? "Saving..."
                : editingPost
                ? "Update Post"
                : "Create Post"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
