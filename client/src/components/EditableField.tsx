import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditableFieldProps {
  value: string | number | null | undefined;
  onSave: (value: string) => Promise<void>;
  type?: "text" | "email" | "tel" | "url" | "number" | "textarea";
  placeholder?: string;
  className?: string;
  displayClassName?: string;
  emptyText?: string;
}

export function EditableField({
  value,
  onSave,
  type = "text",
  placeholder,
  className,
  displayClassName,
  emptyText = "Click to add...",
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value || ""));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (editValue === String(value || "")) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(String(value || ""));
    setIsEditing(false);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && type !== "textarea") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (!isEditing) {
    return (
      <div
        onClick={() => setIsEditing(true)}
        className={cn(
          "cursor-pointer hover:bg-accent/50 rounded px-2 py-1 -mx-2 -my-1 transition-colors min-h-[2rem]",
          type === "textarea" ? "whitespace-pre-wrap" : "flex items-center",
          !value && "text-muted-foreground italic",
          displayClassName
        )}
      >
        {value || emptyText}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        {type === "textarea" ? (
          <Textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn("min-h-[100px]", className)}
            disabled={isSaving}
          />
        ) : (
          <Input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            placeholder={placeholder}
            className={className}
            disabled={isSaving}
          />
        )}
        {type === "textarea" && (
          <div className="flex gap-1">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="p-2 hover:bg-accent rounded transition-colors"
              title="Save (Enter)"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4 text-green-500" />
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="p-2 hover:bg-accent rounded transition-colors"
              title="Cancel (Esc)"
            >
              <X className="h-4 w-4 text-red-500" />
            </button>
          </div>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
