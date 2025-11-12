import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, Bot, User as UserIcon, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

export default function AIChat() {
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { data: messages, isLoading } = trpc.aiChat.getMessages.useQuery({ sessionId });
  const sendMutation = trpc.aiChat.sendMessage.useMutation({
    onSuccess: () => {
      utils.aiChat.getMessages.invalidate({ sessionId });
      setMessage("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const utils = trpc.useUtils();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sendMutation.isPending) return;
    sendMutation.mutate({ sessionId, content: message });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            AI Assistant
          </h1>
          <p className="text-muted-foreground">
            Your intelligent CRM copilot for sales and prospecting
          </p>
        </div>
      </div>

      <Card className="h-[calc(100vh-16rem)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Chat with Momentum AI
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col h-[calc(100%-5rem)]">
          <ScrollArea ref={scrollRef} className="flex-1 pr-4">
            <div className="space-y-4">
              {isLoading ? (
                <>
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </>
              ) : messages && messages.length > 0 ? (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 ${
                      msg.role === "assistant" ? "justify-start" : "justify-end"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        msg.role === "assistant"
                          ? "bg-muted"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <Streamdown>{msg.content}</Streamdown>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                    {msg.role === "user" && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                        <UserIcon className="h-4 w-4 text-accent" />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Bot className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
                  <p className="text-muted-foreground mb-4">
                    Ask me anything about your CRM, sales strategies, or prospecting
                  </p>
                  <div className="grid gap-2 max-w-md mx-auto">
                    <Button
                      variant="outline"
                      onClick={() => setMessage("What are my hot deals?")}
                    >
                      What are my hot deals?
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setMessage("Generate a sales proposal for my top lead")}
                    >
                      Generate a sales proposal
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setMessage("Show me my stale deals that need attention")}
                    >
                      Show stale deals
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask me anything..."
              disabled={sendMutation.isPending}
              className="flex-1"
            />
            <Button type="submit" disabled={sendMutation.isPending || !message.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
