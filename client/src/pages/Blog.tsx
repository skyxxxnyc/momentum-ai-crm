import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar, Search, Tag } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { APP_TITLE } from "@/const";

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: posts, isLoading } = trpc.blog.listPublished.useQuery();

  const filteredPosts = posts?.filter((post: any) => {
    const matchesSearch =
      !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = !selectedCategory || post.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(posts?.map((p: any) => p.category).filter(Boolean)));

  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b-2 border-border bg-card">
        <div className="container py-8">
          <Link href="/">
            <h1 className="text-3xl font-bold tracking-tight hover:text-primary transition-colors cursor-pointer">
              {APP_TITLE}
            </h1>
          </Link>
          <p className="text-muted-foreground mt-2">Insights on AI, CRM, and Revenue Growth</p>
        </div>
      </header>

      <div className="container py-8 space-y-8">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {categories.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Button>
              {categories.map((category: any) => (
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

        {/* Posts Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading articles...</div>
        ) : filteredPosts && filteredPosts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post: any) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card className="border-2 hover:border-primary transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      {post.category && (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/50">
                          {post.category}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl line-clamp-2 hover:text-primary transition-colors">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 text-xs">
                      <Calendar className="h-3 w-3" />
                      {formatDate(post.publishedAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
                    )}

                    {post.tags && JSON.parse(post.tags).length > 0 && (
                      <div className="flex gap-2 mt-4 flex-wrap">
                        {JSON.parse(post.tags)
                          .slice(0, 3)
                          .map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="border-2 border-dashed">
            <CardContent className="py-12 text-center">
              <h3 className="text-lg font-semibold mb-2">No articles found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery || selectedCategory
                  ? "Try adjusting your search or filters"
                  : "Check back soon for new content"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t-2 border-border mt-16">
        <div className="container py-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {APP_TITLE}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
