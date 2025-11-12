import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Database, Upload, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function NotionIntegration() {
  const [contactDbId, setContactDbId] = useState("");
  const [companyDbId, setCompanyDbId] = useState("");
  const [dealDbId, setDealDbId] = useState("");

  const utils = trpc.useUtils();
  const { data: contacts } = trpc.contacts.list.useQuery();
  const { data: companies } = trpc.companies.list.useQuery();
  const { data: deals } = trpc.deals.list.useQuery();

  const syncAllContacts = trpc.notion.syncAllContacts.useMutation({
    onSuccess: (result) => {
      toast.success(`Synced ${result.success} contacts to Notion`);
      if (result.failed > 0) {
        toast.error(`Failed to sync ${result.failed} contacts`);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to sync contacts");
    },
  });

  const syncAllCompanies = trpc.notion.syncAllCompanies.useMutation({
    onSuccess: (result) => {
      toast.success(`Synced ${result.success} companies to Notion`);
      if (result.failed > 0) {
        toast.error(`Failed to sync ${result.failed} companies`);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to sync companies");
    },
  });

  const syncAllDeals = trpc.notion.syncAllDeals.useMutation({
    onSuccess: (result) => {
      toast.success(`Synced ${result.success} deals to Notion`);
      if (result.failed > 0) {
        toast.error(`Failed to sync ${result.failed} deals`);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to sync deals");
    },
  });

  const handleSyncContacts = () => {
    if (!contactDbId) {
      toast.error("Please enter a Notion database ID");
      return;
    }
    syncAllContacts.mutate({ databaseId: contactDbId });
  };

  const handleSyncCompanies = () => {
    if (!companyDbId) {
      toast.error("Please enter a Notion database ID");
      return;
    }
    syncAllCompanies.mutate({ databaseId: companyDbId });
  };

  const handleSyncDeals = () => {
    if (!dealDbId) {
      toast.error("Please enter a Notion database ID");
      return;
    }
    syncAllDeals.mutate({ databaseId: dealDbId });
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notion Integration</h1>
        <p className="text-muted-foreground mt-1">
          Sync your CRM data with Notion databases
        </p>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Setup Instructions
          </CardTitle>
          <CardDescription>How to get your Notion database IDs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="bg-muted/50 p-4 space-y-2">
            <p className="font-semibold">Step 1: Create Notion Databases</p>
            <p className="text-muted-foreground">
              In your Notion workspace, create separate databases for Contacts, Companies, and Deals
              with appropriate properties (Name, Email, Phone, etc.)
            </p>
          </div>

          <div className="bg-muted/50 p-4 space-y-2">
            <p className="font-semibold">Step 2: Get Database IDs</p>
            <p className="text-muted-foreground">
              Open each database in Notion, copy the URL. The database ID is the 32-character string
              after the workspace name and before the "?" (if any).
            </p>
            <p className="text-xs font-mono bg-background p-2">
              Example: notion.so/workspace/DATABASE_ID?v=...
            </p>
          </div>

          <div className="bg-muted/50 p-4 space-y-2">
            <p className="font-semibold">Step 3: Paste IDs Below</p>
            <p className="text-muted-foreground">
              Enter the database IDs in the fields below and click "Sync All" to push your CRM data
              to Notion.
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="contacts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="deals">Deals</TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="space-y-4">
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Sync Contacts to Notion</CardTitle>
              <CardDescription>
                Push all {contacts?.length || 0} contacts to your Notion database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contactDbId">Notion Database ID *</Label>
                <Input
                  id="contactDbId"
                  placeholder="e.g., 1234567890abcdef1234567890abcdef"
                  value={contactDbId}
                  onChange={(e) => setContactDbId(e.target.value)}
                />
              </div>

              <Button
                onClick={handleSyncContacts}
                disabled={syncAllContacts.isPending || !contactDbId}
                className="w-full gap-2"
              >
                {syncAllContacts.isPending ? (
                  <>Syncing...</>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Sync All Contacts
                  </>
                )}
              </Button>

              {contacts && contacts.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  <p>This will create {contacts.length} pages in your Notion database.</p>
                  <p className="mt-1">
                    Make sure your database has properties: Name (Title), Email, Phone, Company,
                    Title
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="companies" className="space-y-4">
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Sync Companies to Notion</CardTitle>
              <CardDescription>
                Push all {companies?.length || 0} companies to your Notion database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyDbId">Notion Database ID *</Label>
                <Input
                  id="companyDbId"
                  placeholder="e.g., 1234567890abcdef1234567890abcdef"
                  value={companyDbId}
                  onChange={(e) => setCompanyDbId(e.target.value)}
                />
              </div>

              <Button
                onClick={handleSyncCompanies}
                disabled={syncAllCompanies.isPending || !companyDbId}
                className="w-full gap-2"
              >
                {syncAllCompanies.isPending ? (
                  <>Syncing...</>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Sync All Companies
                  </>
                )}
              </Button>

              {companies && companies.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  <p>This will create {companies.length} pages in your Notion database.</p>
                  <p className="mt-1">
                    Make sure your database has properties: Name (Title), Website (URL), Industry,
                    Phone, Address
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deals" className="space-y-4">
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Sync Deals to Notion</CardTitle>
              <CardDescription>
                Push all {deals?.length || 0} deals to your Notion database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dealDbId">Notion Database ID *</Label>
                <Input
                  id="dealDbId"
                  placeholder="e.g., 1234567890abcdef1234567890abcdef"
                  value={dealDbId}
                  onChange={(e) => setDealDbId(e.target.value)}
                />
              </div>

              <Button
                onClick={handleSyncDeals}
                disabled={syncAllDeals.isPending || !dealDbId}
                className="w-full gap-2"
              >
                {syncAllDeals.isPending ? (
                  <>Syncing...</>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Sync All Deals
                  </>
                )}
              </Button>

              {deals && deals.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  <p>This will create {deals.length} pages in your Notion database.</p>
                  <p className="mt-1">
                    Make sure your database has properties: Name (Title), Value (Number), Stage,
                    Probability (Number), Close Date (Date)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-2 border-lime-500/50 bg-lime-500/5">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-lime-500 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Notion MCP Integration Active</p>
              <p className="text-sm text-muted-foreground">
                Your Momentum AI CRM is connected to Notion via the Model Context Protocol. Data will
                be synced using your configured Notion integration.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
