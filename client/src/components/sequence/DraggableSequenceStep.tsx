import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Mail, Clock, Copy, Trash2, Edit } from "lucide-react";
import { cn } from "@/lib/utils";

interface SequenceStep {
  id: number;
  stepNumber: number;
  subject: string;
  body: string;
  delayDays: number;
}

interface DraggableSequenceStepProps {
  step: SequenceStep;
  onEdit: (step: SequenceStep) => void;
  onDuplicate: (step: SequenceStep) => void;
  onDelete: (stepId: number) => void;
}

export function DraggableSequenceStep({
  step,
  onEdit,
  onDuplicate,
  onDelete,
}: DraggableSequenceStepProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "mb-4",
        isDragging && "opacity-50 cursor-grabbing"
      )}
    >
      <Card className={cn(
        "border-2 transition-all",
        isDragging ? "border-primary shadow-lg" : "border-border hover:border-primary/50"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            {/* Drag Handle */}
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing hover:bg-accent rounded p-1 transition-colors"
            >
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>

            {/* Step Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="font-mono">
                  Step {step.stepNumber}
                </Badge>
                {step.delayDays > 0 && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      {step.delayDays === 1
                        ? "1 day after"
                        : `${step.delayDays} days after`}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{step.subject}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(step)}
                title="Edit step"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDuplicate(step)}
                title="Duplicate step"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(step.id)}
                title="Delete step"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="text-sm text-muted-foreground line-clamp-2">
            {step.body.replace(/<[^>]*>/g, "").substring(0, 150)}
            {step.body.length > 150 && "..."}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
