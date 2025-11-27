import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface EmailPreviewProps {
  subject: string;
  body: string;
  contactId?: number;
  companyId?: number;
}

export function EmailPreview({ subject, body, contactId, companyId }: EmailPreviewProps) {
  const [showPreview, setShowPreview] = useState(false);

  const { data: preview, isLoading } = trpc.emailVariables.preview.useQuery(
    {
      subject,
      body,
      contactId,
      companyId,
    },
    {
      enabled: showPreview && (!!contactId || !!companyId),
    }
  );

  if (!contactId && !companyId) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Select a contact or company to preview personalized email
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Email Preview</CardTitle>
            <CardDescription>
              See how this email will look with actual data
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Hide Preview
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Show Preview
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      {showPreview && (
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : preview ? (
            <>
              {/* Validation Status */}
              {preview.validation && !preview.validation.valid && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {preview.validation.missing.length > 0 && (
                      <div>
                        Missing variables: {preview.validation.missing.join(", ")}
                      </div>
                    )}
                    {preview.validation.unknown.length > 0 && (
                      <div>
                        Unknown variables: {preview.validation.unknown.join(", ")}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {preview.validation && preview.validation.valid && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    All variables resolved successfully
                  </AlertDescription>
                </Alert>
              )}

              {/* Subject Preview */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Subject:</span>
                  <Badge variant="outline">Preview</Badge>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium">{preview.subject}</p>
                </div>
              </div>

              {/* Body Preview */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Body:</span>
                  <Badge variant="outline">Preview</Badge>
                </div>
                <div className="p-4 bg-muted rounded-md">
                  <div className="text-sm whitespace-pre-wrap">{preview.body}</div>
                </div>
              </div>

              {/* Variable Values */}
              {preview.variables && Object.keys(preview.variables).length > 0 && (
                <details className="mt-4">
                  <summary className="text-sm font-medium cursor-pointer text-muted-foreground hover:text-foreground">
                    View Variable Values ({Object.keys(preview.variables).length})
                  </summary>
                  <div className="mt-2 p-3 bg-muted rounded-md space-y-1">
                    {Object.entries(preview.variables).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between text-xs">
                        <code className="text-muted-foreground">{`{{${key}}}`}</code>
                        <span className="font-medium">{value || "(empty)"}</span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </>
          ) : null}
        </CardContent>
      )}
    </Card>
  );
}
