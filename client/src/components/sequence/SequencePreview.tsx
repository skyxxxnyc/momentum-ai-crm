import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Clock, ArrowRight, Calendar } from "lucide-react";
import { Streamdown } from "streamdown";

interface SequenceStep {
  id: number;
  stepNumber: number;
  subject: string;
  body: string;
  delayDays: number;
}

interface SequencePreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sequenceName: string;
  steps: SequenceStep[];
}

export function SequencePreview({
  open,
  onOpenChange,
  sequenceName,
  steps,
}: SequencePreviewProps) {
  const calculateTotalDuration = () => {
    return steps.reduce((total, step) => total + step.delayDays, 0);
  };

  const getStepDate = (stepIndex: number) => {
    const daysFromStart = steps
      .slice(0, stepIndex + 1)
      .reduce((total, step) => total + step.delayDays, 0);
    
    const date = new Date();
    date.setDate(date.getDate() + daysFromStart);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sequence Preview</DialogTitle>
          <DialogDescription>
            Preview how your email sequence will look to recipients
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sequence Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{sequenceName}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {steps.length} {steps.length === 1 ? "step" : "steps"} •{" "}
                    {calculateTotalDuration()} {calculateTotalDuration() === 1 ? "day" : "days"} duration
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  Starts immediately
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Timeline View */}
          <div className="space-y-4">
            <h4 className="font-semibold">Email Timeline</h4>
            {steps.map((step, index) => (
              <div key={step.id} className="relative">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-border" />
                )}

                <div className="flex gap-4">
                  {/* Timeline Marker */}
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    {step.delayDays > 0 && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>+{step.delayDays}d</span>
                      </div>
                    )}
                  </div>

                  {/* Email Content */}
                  <Card className="flex-1">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="font-mono text-xs">
                              Step {step.stepNumber}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {getStepDate(index)}
                            </span>
                          </div>
                          <div className="font-semibold">{step.subject}</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="preview" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="preview">Preview</TabsTrigger>
                          <TabsTrigger value="html">HTML</TabsTrigger>
                        </TabsList>
                        <TabsContent value="preview" className="mt-4">
                          <div className="prose prose-sm max-w-none">
                            <Streamdown>{step.body}</Streamdown>
                          </div>
                        </TabsContent>
                        <TabsContent value="html" className="mt-4">
                          <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
                            <code>{step.body}</code>
                          </pre>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ArrowRight className="h-4 w-4" />
                  <span>
                    Sequence completes in {calculateTotalDuration()}{" "}
                    {calculateTotalDuration() === 1 ? "day" : "days"}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                  Close Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
