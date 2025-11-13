import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Trash2, Edit2, X, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface NotesListProps {
  entityType: string;
  entityId: number;
}

export function NotesList({ entityType, entityId }: NotesListProps) {
  const [newNote, setNewNote] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  const utils = trpc.useUtils();

  const { data: notes, isLoading } = trpc.notes.byEntity.useQuery(
    { entityType, entityId },
    { enabled: !!entityId }
  );

  const createNote = trpc.notes.create.useMutation({
    onSuccess: () => {
      utils.notes.byEntity.invalidate({ entityType, entityId });
      setNewNote("");
      toast.success("Note added");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add note");
    },
  });

  const updateNote = trpc.notes.update.useMutation({
    onSuccess: () => {
      utils.notes.byEntity.invalidate({ entityType, entityId });
      setEditingId(null);
      toast.success("Note updated");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update note");
    },
  });

  const deleteNote = trpc.notes.delete.useMutation({
    onSuccess: () => {
      utils.notes.byEntity.invalidate({ entityType, entityId });
      toast.success("Note deleted");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete note");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    createNote.mutate({ entityType, entityId, content: newNote });
  };

  const handleEdit = (note: any) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  const handleSaveEdit = (id: number) => {
    if (!editContent.trim()) return;
    updateNote.mutate({ id, content: editContent });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading notes...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Add Note Form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note..."
          className="min-h-[100px]"
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!newNote.trim() || createNote.isPending}
            size="sm"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        </div>
      </form>

      {/* Notes List */}
      {!notes || notes.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No notes yet. Add one above to get started.
        </p>
      ) : (
        <div className="space-y-3">
          {notes.map((note: any) => (
            <Card key={note.id}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {note.userName?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-medium text-sm">{note.userName || "User"}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                        </span>
                        {note.updatedAt && note.updatedAt !== note.createdAt && (
                          <span className="text-xs text-muted-foreground ml-1">(edited)</span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(note)}
                          className="h-7 w-7 p-0"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm("Delete this note?")) {
                              deleteNote.mutate({ id: note.id });
                            }
                          }}
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {editingId === note.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="min-h-[80px]"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveEdit(note.id)}
                            disabled={updateNote.isPending}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
