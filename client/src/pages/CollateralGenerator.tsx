import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Sparkles, Download, Copy } from "lucide-react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

export default function CollateralGenerator() {
  const [type, setType] = useState<"proposal" | "battle_card" | "one_pager">("proposal");
  const [customPrompt, setCustomPrompt] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");

  const { data: deals } = trpc.deals.list.useQuery();
  const { data: companies } = trpc.companies.list.useQuery();

  const generateMutation = trpc.ai.generateCollateral.useMutation({
    onSuccess: (data) => {
      setGeneratedContent(data.content);
      toast.success("Collateral generated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleGenerate = () => {
    if (!customPrompt.trim()) {
      toast.error("Please provide context or select a deal/company");
      return;
    }
    generateMutation.mutate({ type, customPrompt });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    toast.success("Copied to clipboard");
  };

  const handleDownload = () => {
    const blob = new Blob([generatedContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            AI Collateral Generator
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Generate professional sales materials instantly
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <Card className="card-brutal">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Collateral Type</Label>
              <Select value={type} onValueChange={(v: any) => setType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="proposal">Sales Proposal</SelectItem>
                  <SelectItem value="battle_card">Competitive Battle Card</SelectItem>
                  <SelectItem value="one_pager">One-Page Overview</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {type === "proposal" && "Comprehensive sales proposal with pricing and timeline"}
                {type === "battle_card" && "Competitive analysis with objection handling"}
                {type === "one_pager" && "Concise overview with key value propositions"}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Context & Details</Label>
              <Textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Describe the opportunity, company, solution, or paste relevant details..."
                rows={8}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label>Quick Templates</Label>
              <div className="grid gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCustomPrompt(
                      "Enterprise SaaS deal, $250K ARR, 500 employees, looking for CRM automation solution. Key pain points: manual data entry, lack of pipeline visibility, poor forecasting."
                    )
                  }
                >
                  Enterprise SaaS Example
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCustomPrompt(
                      "SMB consulting engagement, $50K project, digital transformation initiative. Client needs process automation and staff training."
                    )
                  }
                >
                  Consulting Project Example
                </Button>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
              className="w-full gap-2 btn-brutal"
            >
              <Sparkles className="h-4 w-4" />
              {generateMutation.isPending ? "Generating..." : "Generate Collateral"}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="card-brutal">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Generated Content
              </CardTitle>
              {generatedContent && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDownload}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {generatedContent ? (
              <div className="prose prose-invert max-w-none">
                <div className="p-4 bg-muted/30 border border-border max-h-[600px] overflow-y-auto">
                  <Streamdown>{generatedContent}</Streamdown>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Generated content will appear here</p>
                <p className="text-sm mt-2">Configure and click generate to start</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
