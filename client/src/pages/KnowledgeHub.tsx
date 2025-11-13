import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, FileText, Tag } from "lucide-react";
import { Streamdown } from "streamdown";

export default function KnowledgeHub() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);

  const { data: articles, isLoading } = trpc.knowledge.list.useQuery({
    category: selectedCategory,
    search: searchQuery,
  });

  const { data: categories } = trpc.knowledge.getCategories.useQuery();

  const { data: articleContent } = trpc.knowledge.getContent.useQuery(
    { filePath: selectedArticle?.filePath || "" },
    { enabled: !!selectedArticle?.filePath }
  );

  const handleArticleClick = (article: any) => {
    setSelectedArticle(article);
  };

  const handleBack = () => {
    setSelectedArticle(null);
  };

  if (selectedArticle) {
    return (
      <div className="space-y-6">
        <div>
          <Button variant="ghost" onClick={handleBack} className="mb-4">
            ← Back to Knowledge Hub
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{selectedArticle.title}</h1>
              <p className="text-muted-foreground mt-1">
                {selectedArticle.category && <Badge variant="outline">{selectedArticle.category}</Badge>}
                {selectedArticle.author && <span className="ml-2 text-sm">by {selectedArticle.author}</span>}
              </p>
            </div>
          </div>
        </div>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="prose prose-invert max-w-none">
              {articleContent?.content ? (
                <Streamdown>{articleContent.content}</Streamdown>
              ) : (
                <Streamdown>{selectedArticle.content}</Streamdown>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Knowledge Hub</h1>
        <p className="text-muted-foreground mt-1">Playbooks, guides, and reference materials</p>
      </div>

      {/* Search and Filters */}
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search knowledge base..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
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
                    onClick={() => setSelectedCategory(category as string)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Articles Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading knowledge base...</div>
      ) : articles && articles.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article: any) => (
            <Card
              key={article.id}
              className="border-2 cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleArticleClick(article)}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  {article.category && <Badge variant="outline">{article.category}</Badge>}
                </div>
                <CardTitle className="text-lg">{article.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {article.content.substring(0, 150)}...
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  {article.author && <span>by {article.author}</span>}
                  {article.tags && (
                    <div className="flex gap-1">
                      <Tag className="h-3 w-3" />
                      <span className="text-xs">{JSON.parse(article.tags).length} tags</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-2">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Articles Found</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery || selectedCategory
                ? "Try adjusting your search or filters"
                : "Knowledge base is empty"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
