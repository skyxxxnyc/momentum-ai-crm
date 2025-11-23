import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { DraggableSequenceStep } from "./DraggableSequenceStep";
import { Button } from "@/components/ui/button";
import { Plus, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";

interface SequenceStep {
  id: number;
  stepNumber: number;
  subject: string;
  body: string;
  delayDays: number;
}

interface SequenceCanvasProps {
  steps: SequenceStep[];
  onReorder: (steps: SequenceStep[]) => void;
  onAddStep: () => void;
  onEditStep: (step: SequenceStep) => void;
  onDuplicateStep: (step: SequenceStep) => void;
  onDeleteStep: (stepId: number) => void;
  onPreview: () => void;
}

export function SequenceCanvas({
  steps,
  onReorder,
  onAddStep,
  onEditStep,
  onDuplicateStep,
  onDeleteStep,
  onPreview,
}: SequenceCanvasProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = steps.findIndex((step) => step.id === active.id);
      const newIndex = steps.findIndex((step) => step.id === over.id);

      const reorderedSteps = arrayMove(steps, oldIndex, newIndex);
      
      // Update step numbers
      const updatedSteps = reorderedSteps.map((step, index) => ({
        ...step,
        stepNumber: index + 1,
      }));

      onReorder(updatedSteps);
    }
  };

  if (steps.length === 0) {
    return (
      <Card className="p-12 text-center border-2 border-dashed">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Plus className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No steps yet</h3>
          <p className="text-muted-foreground mb-6">
            Start building your email sequence by adding your first step.
          </p>
          <Button onClick={onAddStep} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Add First Step
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Sequence Steps</h3>
          <p className="text-sm text-muted-foreground">
            Drag to reorder • {steps.length} {steps.length === 1 ? "step" : "steps"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onPreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={onAddStep}>
            <Plus className="h-4 w-4 mr-2" />
            Add Step
          </Button>
        </div>
      </div>

      {/* Draggable Steps */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={steps.map((step) => step.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-0">
            {steps.map((step) => (
              <DraggableSequenceStep
                key={step.id}
                step={step}
                onEdit={onEditStep}
                onDuplicate={onDuplicateStep}
                onDelete={onDeleteStep}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add Step Button at Bottom */}
      <Button
        variant="outline"
        className="w-full border-2 border-dashed"
        onClick={onAddStep}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Another Step
      </Button>
    </div>
  );
}
