import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Building2, MapPin, Phone, Globe, TrendingUp, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ProspectingAgent() {
  const [selectedIcpId, setSelectedIcpId] = useState<number | null>(null);
  const [maxResults, setMaxResults] = useState(10);
  const [autoCreate, setAutoCreate] = useState(false);
  const [prospects, setProspects] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const { data: icpsData } = trpc.icps.list.useQuery();
  const icps = icpsData || [];

  const runProspecting = trpc.prospecting.runProspecting.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setProspects(data.prospects);
        toast.success(`Found ${data.count} prospects!`);
        if (autoCreate) {
          toast.success(`${data.count} companies auto-created in CRM`);
        }
      } else {
        toast.error(data.error || "Prospecting failed");
      }
      setIsRunning(false);
    },
    onError: () => {
      toast.error("Failed to run prospecting agent");
      setIsRunning(false);
    },
  });

  const handleRunProspecting = () => {
    if (!selectedIcpId) {
      toast.error("Please select an ICP");
      return;
    }

    setIsRunning(true);
    setProspects([]);
    runProspecting.mutate({
      icpId: selectedIcpId,
      maxResults,
      autoCreateCompanies: autoCreate,
    });
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "bg-lime-500/20 text-lime-500 border-lime-500/50";
      case "medium":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50";
      case "low":
        return "bg-gray-500/20 text-gray-500 border-gray-500/50";
      default:
        return "bg-gray-500/20 text-gray-500 border-gray-500/50";
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Prospecting Agent</h1>
        <p className="text-muted-foreground mt-1">
          Find and qualify businesses using Google Maps and AI analysis
        </p>
      </div>

      {/* Configuration Card */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Configure Prospecting</CardTitle>
          <CardDescription>
            Select an ICP to find matching businesses automatically
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="icp">Target ICP *</Label>
              <Select
                value={selectedIcpId?.toString()}
                onValueChange={(value) => setSelectedIcpId(parseInt(value))}
              >
                <SelectTrigger id="icp">
                  <SelectValue placeholder="Select ICP..." />
                </SelectTrigger>
                <SelectContent>
                  {icps.map((icp: any) => (
                    <SelectItem key={icp.id} value={icp.id.toString()}>
                      {icp.name} ({icp.industry})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxResults">Max Results</Label>
              <Input
                id="maxResults"
                type="number"
                min="1"
                max="50"
                value={maxResults}
                onChange={(e) => setMaxResults(parseInt(e.target.value) || 10)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="autoCreate">Auto-Create Companies</Label>
              <div className="flex items-center gap-2 h-10">
                <input
                  id="autoCreate"
                  type="checkbox"
                  checked={autoCreate}
                  onChange={(e) => setAutoCreate(e.target.checked)}
                  className="h-4 w-4"
                />
                <span className="text-sm text-muted-foreground">
                  Automatically add to CRM
                </span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleRunProspecting}
            disabled={isRunning || !selectedIcpId}
            className="w-full md:w-auto gap-2"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Prospecting... This may take a few minutes
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Run Prospecting Agent
              </>
            )}
          </Button>

          {isRunning && (
            <div className="bg-muted/50 p-4 space-y-2">
              <p className="text-sm font-medium">Processing Steps:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Searching Google Maps for businesses...
                </li>
                <li className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Scraping and analyzing websites...
                </li>
                <li className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  AI analysis of pain points and opportunities...
                </li>
                <li className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Generating personalized sales intelligence...
                </li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {prospects.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              Found {prospects.length} Prospects
            </h2>
            <div className="flex gap-2">
              <Badge variant="outline" className={getPriorityColor("high")}>
                {prospects.filter((p) => p.priority === "high").length} High Priority
              </Badge>
              <Badge variant="outline" className={getPriorityColor("medium")}>
                {prospects.filter((p) => p.priority === "medium").length} Medium
              </Badge>
              <Badge variant="outline" className={getPriorityColor("low")}>
                {prospects.filter((p) => p.priority === "low").length} Low
              </Badge>
            </div>
          </div>

          <div className="grid gap-4">
            {prospects.map((prospect, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl">{prospect.businessName}</CardTitle>
                        <Badge variant="outline" className={getPriorityColor(prospect.priority)}>
                          {prospect.priority?.toUpperCase() || "UNKNOWN"} PRIORITY
                        </Badge>
                        <Badge variant="outline">
                          Score: {prospect.digitalPresenceScore || 0}/100
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {prospect.industry}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {prospect.location}
                        </span>
                        {prospect.rating && (
                          <span>⭐ {prospect.rating} ({prospect.reviewCount} reviews)</span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Contact Info */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    {prospect.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        {prospect.phone}
                      </div>
                    )}
                    {prospect.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <a
                          href={prospect.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {prospect.website}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Digital Presence Assessment */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-muted/50 p-3 space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Website Quality</p>
                      <p className="text-sm font-semibold">{prospect.websiteQuality || "N/A"}</p>
                    </div>
                    <div className="bg-muted/50 p-3 space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">SEO Score</p>
                      <p className="text-sm font-semibold">{prospect.seoScore || "N/A"}</p>
                    </div>
                    <div className="bg-muted/50 p-3 space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Recommended Package</p>
                      <p className="text-sm font-semibold">{prospect.recommendedPackage || "N/A"}</p>
                    </div>
                  </div>

                  {/* Why Good Fit */}
                  {prospect.whyGoodFit && prospect.whyGoodFit.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-lime-500" />
                        Why They're a Good Fit:
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                        {prospect.whyGoodFit.map((reason: string, i: number) => (
                          <li key={i}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Pain Points */}
                  {prospect.painPoints && prospect.painPoints.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                        Pain Points:
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                        {prospect.painPoints.map((pain: string, i: number) => (
                          <li key={i}>{pain}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Sales Opportunities */}
                  {prospect.salesOpportunities && prospect.salesOpportunities.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-lime-500" />
                        Sales Opportunities:
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                        {prospect.salesOpportunities.map((opp: string, i: number) => (
                          <li key={i}>{opp}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Talking Points */}
                  {prospect.talkingPoints && prospect.talkingPoints.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold">Talking Points for Outreach:</p>
                      <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                        {prospect.talkingPoints.map((point: string, i: number) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Estimated Value */}
                  {prospect.estimatedValue && (
                    <div className="bg-lime-500/10 border border-lime-500/30 p-3">
                      <p className="text-sm">
                        <span className="font-semibold">Estimated Deal Value:</span>{" "}
                        <span className="text-lime-500 font-bold">{prospect.estimatedValue}</span>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isRunning && prospects.length === 0 && (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No prospects yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Select an ICP and run the prospecting agent to find qualified businesses
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
