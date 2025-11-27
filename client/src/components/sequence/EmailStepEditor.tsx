import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles } from "lucide-react";
import { Streamdown } from "streamdown";
import { VariableInserter } from "@/components/VariableInserter";

interface SequenceStep {
  id?: number;
  stepNumber: number;
  subject: string;
  body: string;
  delayDays: number;
}

interface EmailStepEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  step: SequenceStep | null;
  onSave: (step: Omit<SequenceStep, "id">) => Promise<void>;
}

export function EmailStepEditor({
  open,
  onOpenChange,
  step,
  onSave,
}: EmailStepEditorProps) {
  const [subject, setSubject] = useState(step?.subject || "");
  const [body, setBody] = useState(step?.body || "");
  const [delayDays, setDelayDays] = useState(step?.delayDays || 0);
  const [isSaving, setIsSaving] = useState(false);
  const bodyTextareaRef = useState<HTMLTextAreaElement | null>(null);
  const subjectInputRef = useState<HTMLInputElement | null>(null);

  const insertVariable = (variable: string, target: 'subject' | 'body') => {
    if (target === 'subject') {
      const input = subjectInputRef[0];
      if (input) {
        const start = input.selectionStart || 0;
        const end = input.selectionEnd || 0;
        const newValue = subject.substring(0, start) + variable + subject.substring(end);
        setSubject(newValue);
        // Set cursor position after inserted variable
        setTimeout(() => {
          input.focus();
          input.setSelectionRange(start + variable.length, start + variable.length);
        }, 0);
      } else {
        setSubject(subject + variable);
      }
    } else {
      const textarea = bodyTextareaRef[0];
      if (textarea) {
        const start = textarea.selectionStart || 0;
        const end = textarea.selectionEnd || 0;
        const newValue = body.substring(0, start) + variable + body.substring(end);
        setBody(newValue);
        // Set cursor position after inserted variable
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + variable.length, start + variable.length);
        }, 0);
      } else {
        setBody(body + variable);
      }
    }
  };

  const handleSave = async () => {
    if (!subject.trim() || !body.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        stepNumber: step?.stepNumber || 1,
        subject: subject.trim(),
        body: body.trim(),
        delayDays,
      });
      onOpenChange(false);
      // Reset form
      setSubject("");
      setBody("");
      setDelayDays(0);
    } catch (error) {
      console.error("Failed to save step:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSaving) {
      // Reset form when closing
      setSubject(step?.subject || "");
      setBody(step?.body || "");
      setDelayDays(step?.delayDays || 0);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step?.id ? "Edit Email Step" : "Add Email Step"}
          </DialogTitle>
          <DialogDescription>
            Configure the email content and timing for this step
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Delay Configuration */}
          <div className="space-y-2">
            <Label htmlFor="delay">Delay (days)</Label>
            <Input
              id="delay"
              type="number"
              min="0"
              value={delayDays}
              onChange={(e) => setDelayDays(parseInt(e.target.value) || 0)}
              placeholder="0"
            />
            <p className="text-xs text-muted-foreground">
              {delayDays === 0
                ? "Sent immediately after enrollment"
                : `Sent ${delayDays} ${delayDays === 1 ? "day" : "days"} after the previous step`}
            </p>
          </div>

          {/* Subject Line */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="subject">Subject Line</Label>
              <VariableInserter onInsert={(v) => insertVariable(v, 'subject')} />
            </div>
            <Input
              id="subject"
              ref={(el) => { subjectInputRef[1](el); }}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject..."
            />
          </div>

          {/* Email Body */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="body">Email Body</Label>
              <div className="flex gap-2">
                <VariableInserter onInsert={(v) => insertVariable(v, 'body')} />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // TODO: Integrate with AI to generate email content
                    alert("AI generation coming soon!");
                  }}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate with AI
                </Button>
              </div>
            </div>

            <Tabs defaultValue="edit" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="edit" className="space-y-4">
                <Textarea
                  id="body"
                  ref={(el) => { bodyTextareaRef[1](el); }}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your email content here... Use {{variable_name}} for personalization."
                  className="min-h-[300px] font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Use the 'Insert Variable' button above to add personalization placeholders.
                  Variables will be automatically replaced with actual data when emails are sent.
                </p>
              </TabsContent>

              <TabsContent value="preview">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Subject:</p>
                        <p className="font-semibold">{subject || "(No subject)"}</p>
                      </div>
                      <div className="border-t pt-4">
                        <div className="prose prose-sm max-w-none">
                          <Streamdown>{body || "*No content yet*"}</Streamdown>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !subject.trim() || !body.trim()}>
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {step?.id ? "Update Step" : "Add Step"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
