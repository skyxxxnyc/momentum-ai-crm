import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Send, Inbox, Eye, MousePointerClick } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { EmailComposer } from "./EmailComposer";

interface EmailHistoryProps {
  contactId: number;
  contactEmail: string;
  contactName?: string;
}

export function EmailHistory({ contactId, contactEmail, contactName }: EmailHistoryProps) {
  const [composerOpen, setComposerOpen] = useState(false);
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null);

  const { data: threads, isLoading } = trpc.emailTracking.byContact.useQuery(
    { contactId },
    { enabled: !!contactId }
  );

  const { data: messages } = trpc.emailTracking.threadMessages.useQuery(
    { threadId: selectedThreadId! },
    { enabled: !!selectedThreadId }
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "opened":
        return <Eye className="h-3 w-3" />;
      case "clicked":
        return <MousePointerClick className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-blue-500/10 text-blue-500";
      case "delivered":
        return "bg-green-500/10 text-green-500";
      case "opened":
        return "bg-purple-500/10 text-purple-500";
      case "clicked":
        return "bg-orange-500/10 text-orange-500";
      case "bounced":
      case "failed":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading email history...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Email History</h3>
        <Button onClick={() => setComposerOpen(true)} size="sm">
          <Send className="h-4 w-4 mr-2" />
          Send Email
        </Button>
      </div>

      {!threads || threads.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center py-8">
              No email history yet. Send your first email to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {threads.map((thread) => (
            <Card key={thread.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-sm font-medium">
                      {thread.subject || "(No subject)"}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {thread.lastMessageAt &&
                        formatDistanceToNow(new Date(thread.lastMessageAt), {
                          addSuffix: true,
                        })}
                    </p>
                  </div>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              {selectedThreadId === thread.id && messages && (
                <CardContent className="space-y-3 border-t pt-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg ${
                        message.direction === "outbound"
                          ? "bg-primary/5 ml-4"
                          : "bg-muted mr-4"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {message.direction === "outbound" ? (
                            <Send className="h-3 w-3 text-primary" />
                          ) : (
                            <Inbox className="h-3 w-3 text-muted-foreground" />
                          )}
                          <span className="text-xs font-medium">
                            {message.direction === "outbound" ? "Sent" : "Received"}
                          </span>
                          {message.status && (
                            <Badge variant="secondary" className={getStatusColor(message.status)}>
                              {getStatusIcon(message.status)}
                              <span className="ml-1">{message.status}</span>
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(message.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                    </div>
                  ))}
                </CardContent>
              )}
              <CardContent className="pt-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() =>
                    setSelectedThreadId(selectedThreadId === thread.id ? null : thread.id)
                  }
                >
                  {selectedThreadId === thread.id ? "Hide messages" : "Show messages"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <EmailComposer
        open={composerOpen}
        onOpenChange={setComposerOpen}
        contactId={contactId}
        contactEmail={contactEmail}
        contactName={contactName}
      />
    </div>
  );
}
