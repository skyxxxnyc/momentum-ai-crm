import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft, Share2, Tag } from "lucide-react";
import { Link, useParams } from "wouter";
import { APP_TITLE } from "@/const";
import { toast } from "sonner";

export default function BlogPost() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: post, isLoading } = trpc.blog.getBySlug.useQuery({ slug });

  // Set SEO meta tags
  useEffect(() => {
    if (post) {
      document.title = post.seoTitle || post.title || APP_TITLE;

      // Meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute("content", post.seoDescription || post.excerpt || "");
      } else {
        const meta = document.createElement("meta");
        meta.name = "description";
        meta.content = post.seoDescription || post.excerpt || "";
        document.head.appendChild(meta);
      }

      // Open Graph tags
      const ogTags = [
        { property: "og:title", content: post.seoTitle || post.title },
        { property: "og:description", content: post.seoDescription || post.excerpt || "" },
        { property: "og:type", content: "article" },
        { property: "og:url", content: window.location.href },
      ];

      ogTags.forEach(({ property, content }) => {
        let tag = document.querySelector(`meta[property="${property}"]`);
        if (tag) {
          tag.setAttribute("content", content);
        } else {
          tag = document.createElement("meta");
          tag.setAttribute("property", property);
          tag.setAttribute("content", content);
          document.head.appendChild(tag);
        }
      });

      // Twitter Card tags
      const twitterTags = [
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: post.seoTitle || post.title },
        { name: "twitter:description", content: post.seoDescription || post.excerpt || "" },
      ];

      twitterTags.forEach(({ name, content }) => {
        let tag = document.querySelector(`meta[name="${name}"]`);
        if (tag) {
          tag.setAttribute("content", content);
        } else {
          tag = document.createElement("meta");
          tag.setAttribute("name", name);
          tag.setAttribute("content", content);
          document.head.appendChild(tag);
        }
      });
    }

    return () => {
      document.title = APP_TITLE;
    };
  }, [post]);

  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(post?.title || "");

    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], "_blank", "width=600,height=400");
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading article...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="border-2 max-w-md">
          <CardContent className="py-12 text-center">
            <h2 className="text-2xl font-bold mb-2">Article Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The article you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/blog">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b-2 border-border bg-card">
        <div className="container py-6">
          <Link href="/blog">
            <Button variant="ghost" size="sm" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
          <Link href="/">
            <h1 className="text-2xl font-bold tracking-tight hover:text-primary transition-colors cursor-pointer">
              {APP_TITLE}
            </h1>
          </Link>
        </div>
      </header>

      <article className="container py-12 max-w-4xl">
        {/* Article Header */}
        <div className="mb-8">
          {post.category && (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/50 mb-4">
              {post.category}
            </Badge>
          )}

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{post.title}</h1>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {formatDate(post.publishedAt)}
            </div>
          </div>

          {post.excerpt && (
            <p className="text-lg text-muted-foreground leading-relaxed">{post.excerpt}</p>
          )}
        </div>

        {/* Social Sharing */}
        <div className="flex gap-2 mb-8 pb-8 border-b-2 border-border">
          <Button variant="outline" size="sm" onClick={() => handleShare("twitter")} className="gap-2">
            <Share2 className="h-4 w-4" />
            Twitter
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleShare("linkedin")} className="gap-2">
            <Share2 className="h-4 w-4" />
            LinkedIn
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleShare("facebook")} className="gap-2">
            <Share2 className="h-4 w-4" />
            Facebook
          </Button>
          <Button variant="outline" size="sm" onClick={copyLink} className="gap-2">
            <Share2 className="h-4 w-4" />
            Copy Link
          </Button>
        </div>

        {/* Article Content */}
        <div
          className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-pre:bg-muted prose-pre:border-2 prose-pre:border-border"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags && JSON.parse(post.tags).length > 0 && (
          <div className="mt-12 pt-8 border-t-2 border-border">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tags
            </h3>
            <div className="flex gap-2 flex-wrap">
              {JSON.parse(post.tags).map((tag: string) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Back to Blog CTA */}
        <div className="mt-12 pt-8 border-t-2 border-border text-center">
          <Link href="/blog">
            <Button size="lg" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              View All Articles
            </Button>
          </Link>
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t-2 border-border mt-16">
        <div className="container py-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {APP_TITLE}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
