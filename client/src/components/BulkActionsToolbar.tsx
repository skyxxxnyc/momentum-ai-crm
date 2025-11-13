import { Button } from "@/components/ui/button";
import { Mail, Edit, Tag, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BulkActionsToolbarProps {
  selectedCount: number;
  onEmail?: () => void;
  onUpdate?: () => void;
  onTag?: () => void;
  onDelete?: () => void;
  onClear: () => void;
}

export function BulkActionsToolbar({
  selectedCount,
  onEmail,
  onUpdate,
  onTag,
  onDelete,
  onClear,
}: BulkActionsToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-card border-2 border-primary shadow-lg px-6 py-4 flex items-center gap-4">
        <Badge variant="default" className="text-sm px-3 py-1">
          {selectedCount} selected
        </Badge>

        <div className="flex gap-2">
          {onEmail && (
            <Button size="sm" variant="outline" onClick={onEmail} className="gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Button>
          )}

          {onUpdate && (
            <Button size="sm" variant="outline" onClick={onUpdate} className="gap-2">
              <Edit className="h-4 w-4" />
              Update
            </Button>
          )}

          {onTag && (
            <Button size="sm" variant="outline" onClick={onTag} className="gap-2">
              <Tag className="h-4 w-4" />
              Tag
            </Button>
          )}

          {onDelete && (
            <Button
              size="sm"
              variant="outline"
              onClick={onDelete}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
        </div>

        <Button size="sm" variant="ghost" onClick={onClear} className="gap-2">
          <X className="h-4 w-4" />
          Clear
        </Button>
      </div>
    </div>
  );
}
