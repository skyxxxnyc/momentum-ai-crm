import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

export default function EmailSequences() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">EmailSequences</h1>
          <p className="text-muted-foreground">Manage your EmailSequences</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add EmailSequences
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This feature is under active development
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
