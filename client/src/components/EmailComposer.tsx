import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Send } from "lucide-react";
import { toast } from "sonner";

interface EmailComposerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactId: number;
  contactEmail: string;
  contactName?: string;
}

export function EmailComposer({
  open,
  onOpenChange,
  contactId,
  contactEmail,
  contactName,
}: EmailComposerProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  const utils = trpc.useUtils();

  const { data: templates } = trpc.emailTemplates.list.useQuery();

  const sendEmail = trpc.emailTracking.send.useMutation({
    onSuccess: () => {
      utils.emailTracking.byContact.invalidate({ contactId });
      toast.success("Email sent");
      handleClose();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send email");
    },
  });

  const handleClose = () => {
    setSubject("");
    setBody("");
    setSelectedTemplate("");
    onOpenChange(false);
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates?.find((t) => t.id.toString() === templateId);
    if (template) {
      setSubject(template.subject);
      setBody(template.body);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;

    sendEmail.mutate({
      contactId,
      toEmail: contactEmail,
      subject,
      body,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            <Mail className="inline h-5 w-5 mr-2" />
            Send Email
          </DialogTitle>
          <DialogDescription>
            Compose an email to {contactName || contactEmail}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Use Template (Optional)</Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template..." />
              </SelectTrigger>
              <SelectContent>
                {templates?.map((template) => (
                  <SelectItem key={template.id} value={template.id.toString()}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="to">To</Label>
            <Input id="to" value={contactEmail} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Message *</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Email message"
              className="min-h-[200px]"
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!subject.trim() || !body.trim() || sendEmail.isPending}
            >
              <Send className="h-4 w-4 mr-2" />
              Send Email
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
