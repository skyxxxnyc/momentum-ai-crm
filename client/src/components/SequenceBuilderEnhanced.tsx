import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { SequenceCanvas } from "./sequence/SequenceCanvas";
import { EmailStepEditor } from "./sequence/EmailStepEditor";
import { SequencePreview } from "./sequence/SequencePreview";
import { toast } from "sonner";

interface SequenceBuilderEnhancedProps {
  sequenceId: number;
}

export function SequenceBuilderEnhanced({ sequenceId }: SequenceBuilderEnhancedProps) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<any | null>(null);

  const utils = trpc.useUtils();

  const { data: sequence } = trpc.emailSequences.get.useQuery({ id: sequenceId });

  const addStep = trpc.emailSequences.addStep.useMutation({
    onSuccess: () => {
      utils.emailSequences.get.invalidate({ id: sequenceId });
      toast.success("Step added successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add step");
    },
  });

  const updateStep = trpc.emailSequences.updateStep.useMutation({
    onSuccess: () => {
      utils.emailSequences.get.invalidate({ id: sequenceId });
      toast.success("Step updated successfully");
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

  const reorderSteps = trpc.emailSequences.reorderSteps.useMutation({
    onSuccess: () => {
      utils.emailSequences.get.invalidate({ id: sequenceId });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reorder steps");
    },
  });

  const steps = sequence?.steps || [];

  const handleAddStep = () => {
    setEditingStep(null);
    setEditorOpen(true);
  };

  const handleEditStep = (step: any) => {
    setEditingStep(step);
    setEditorOpen(true);
  };

  const handleDuplicateStep = async (step: any) => {
    try {
      await addStep.mutateAsync({
        sequenceId,
        subject: `${step.subject} (Copy)`,
        body: step.body,
        delayDays: step.delayDays,
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDeleteStep = async (stepId: number) => {
    if (!confirm("Are you sure you want to delete this step?")) {
      return;
    }

    try {
      await deleteStep.mutateAsync({ id: stepId });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleSaveStep = async (stepData: any) => {
    if (editingStep) {
      await updateStep.mutateAsync({
        id: editingStep.id,
        ...stepData,
      });
    } else {
      const nextStepNumber = steps.length + 1;
      await addStep.mutateAsync({
        sequenceId,
        ...stepData,
        stepNumber: nextStepNumber,
      });
    }
  };

  const handleReorder = async (reorderedSteps: any[]) => {
    // Optimistically update UI
    utils.emailSequences.get.setData(
      { id: sequenceId },
      (old: any) => old ? { ...old, steps: reorderedSteps } : old
    );

    // Send update to server
    try {
      await reorderSteps.mutateAsync({
        sequenceId,
        stepIds: reorderedSteps.map(s => s.id),
      });
    } catch (error) {
      // Revert on error
      utils.emailSequences.get.invalidate({ id: sequenceId });
    }
  };

  return (
    <>
      <SequenceCanvas
        steps={steps}
        onReorder={handleReorder}
        onAddStep={handleAddStep}
        onEditStep={handleEditStep}
        onDuplicateStep={handleDuplicateStep}
        onDeleteStep={handleDeleteStep}
        onPreview={() => setPreviewOpen(true)}
      />

      <EmailStepEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        step={editingStep}
        onSave={handleSaveStep}
      />

      <SequencePreview
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        sequenceName={sequence?.name || ""}
        steps={steps}
      />
    </>
  );
}
