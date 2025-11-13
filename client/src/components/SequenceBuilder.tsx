import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, Edit2, Trash2, Mail, Clock, ArrowDown } from "lucide-react";
import { toast } from "sonner";

interface SequenceBuilderProps {
  sequenceId: number;
}

export function SequenceBuilder({ sequenceId }: SequenceBuilderProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<any | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [delayDays, setDelayDays] = useState(0);

  const utils = trpc.useUtils();

  const { data: sequence } = trpc.emailSequences.get.useQuery({ id: sequenceId });

  const addStep = trpc.emailSequences.addStep.useMutation({
    onSuccess: () => {
      utils.emailSequences.get.invalidate({ id: sequenceId });
      toast.success("Step added");
      handleClose();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add step");
    },
  });

  const updateStep = trpc.emailSequences.updateStep.useMutation({
    onSuccess: () => {
      utils.emailSequences.get.invalidate({ id: sequenceId });
      toast.success("Step updated");
      handleClose();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update step");
    },
  });

  const deleteStep = trpc.emailSequences.deleteStep.useMutation({
    onSuccess: () => {
      utils.emailSequences.get.invalidate({ id: sequenceId });
      toast.success("Step deleted");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete step");
    },
  });

  const handleClose = () => {
    setDialogOpen(false);
    setEditingStep(null);
    setSubject("");
    setBody("");
    setDelayDays(0);
  };

  const handleEdit = (step: any) => {
    setEditingStep(step);
    setSubject(step.subject);
    setBody(step.body);
    setDelayDays(step.delayDays);
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;

    if (editingStep) {
      updateStep.mutate({
        id: editingStep.id,
        subject,
        body,
        delayDays,
      });
    } else {
      addStep.mutate({
        sequenceId,
        subject,
        body,
        delayDays,
      });
    }
  };

  const steps = sequence?.steps || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Sequence Steps</h3>
        <Button onClick={() => setDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Step
        </Button>
      </div>

      {steps.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                No steps yet. Add your first email step to get started.
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Step
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="space-y-2">
              {index > 0 && (
                <div className="flex items-center justify-center py-2">
                  <div className="flex flex-col items-center text-muted-foreground">
                    <ArrowDown className="h-5 w-5" />
                    <div className="flex items-center gap-1 text-xs mt-1">
                      <Clock className="h-3 w-3" />
                      <span>Wait {step.delayDays} day{step.delayDays !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                </div>
              )}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                          {step.stepNumber}
                        </span>
                        <CardTitle className="text-base">Email Step</CardTitle>
                      </div>
                      <p className="text-sm font-medium">{step.subject}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(step)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm("Delete this step?")) {
                            deleteStep.mutate({ id: step.id });
                          }
                        }}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">{step.body}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingStep ? "Edit Step" : "Add Step"}</DialogTitle>
            <DialogDescription>
              {editingStep ? "Update the email step" : "Add a new email step to the sequence"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="delay">Delay (days) *</Label>
              <Input
                id="delay"
                type="number"
                min="0"
                value={delayDays}
                onChange={(e) => setDelayDays(parseInt(e.target.value) || 0)}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">
                Days to wait before sending this email (0 = send immediately)
              </p>
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
              <Label htmlFor="body">Email Body *</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Email content"
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
                disabled={
                  !subject.trim() || !body.trim() || addStep.isPending || updateStep.isPending
                }
              >
                {editingStep ? "Update" : "Add"} Step
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
