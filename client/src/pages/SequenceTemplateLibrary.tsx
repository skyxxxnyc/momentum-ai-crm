import DashboardLayout from "@/components/DashboardLayout";
import { TemplateGallery } from "@/components/TemplateGallery";
import { BookTemplate } from "lucide-react";

export default function SequenceTemplateLibrary() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BookTemplate className="h-8 w-8" />
              Email Sequence Templates
            </h1>
            <p className="text-muted-foreground mt-1">
              Pre-built sequences for common use cases. Clone and customize to get started fast.
            </p>
          </div>
        </div>

        <TemplateGallery />
      </div>
    </DashboardLayout>
  );
}
