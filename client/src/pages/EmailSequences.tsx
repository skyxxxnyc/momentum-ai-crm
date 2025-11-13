import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Plus, Mail, Edit2, Trash2, Users, BarChart3, Play, Pause } from "lucide-react";
import { toast } from "sonner";

export default function EmailSequences() {
  const [, navigate] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const utils = trpc.useUtils();

  const { data: sequences, isLoading } = trpc.emailSequences.list.useQuery();

  const createSequence = trpc.emailSequences.create.useMutation({
    onSuccess: (data) => {
      utils.emailSequences.list.invalidate();
      toast.success("Sequence created");
      handleClose();
      // Navigate to sequence detail
      navigate(`/email-sequences/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create sequence");
    },
  });

  const updateSequence = trpc.emailSequences.update.useMutation({
    onSuccess: () => {
      utils.emailSequences.list.invalidate();
      toast.success("Sequence updated");
      handleClose();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update sequence");
    },
  });

  const deleteSequence = trpc.emailSequences.delete.useMutation({
    onSuccess: () => {
      utils.emailSequences.list.invalidate();
      toast.success("Sequence deleted");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete sequence");
    },
  });

  const handleClose = () => {
    setDialogOpen(false);
    setEditingId(null);
    setName("");
    setDescription("");
  };

  const handleEdit = (sequence: any) => {
    setEditingId(sequence.id);
    setName(sequence.name);
    setDescription(sequence.description || "");
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      updateSequence.mutate({
        id: editingId,
        name,
        description: description || undefined,
      });
    } else {
      createSequence.mutate({
        name,
        description: description || undefined,
      });
    }
  };

  const toggleStatus = (sequence: any) => {
    const newStatus = sequence.status === "active" ? "paused" : "active";
    updateSequence.mutate({
      id: sequence.id,
      status: newStatus,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-500";
      case "paused":
        return "bg-yellow-500/10 text-yellow-500";
      case "archived":
        return "bg-gray-500/10 text-gray-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Email Sequences</h1>
            <p className="text-muted-foreground mt-1">
              Automate your email outreach with multi-step campaigns
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Sequence
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading sequences...</p>
          </div>
        ) : !sequences || sequences.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  No email sequences yet. Create your first sequence to automate your outreach.
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Sequence
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sequences.map((sequence) => (
              <Card key={sequence.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{sequence.name}</CardTitle>
                      {sequence.description && (
                        <CardDescription className="mt-1 line-clamp-2">
                          {sequence.description}
                        </CardDescription>
                      )}
                    </div>
                    <Badge variant="secondary" className={getStatusColor(sequence.status)}>
                      {sequence.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-muted rounded">
                      <div className="text-xs text-muted-foreground">Steps</div>
                      <div className="text-lg font-bold">0</div>
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <div className="text-xs text-muted-foreground">Enrolled</div>
                      <div className="text-lg font-bold">0</div>
                    </div>
                    <div className="p-2 bg-muted rounded">
                      <div className="text-xs text-muted-foreground">Sent</div>
                      <div className="text-lg font-bold">0</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/email-sequences/${sequence.id}`)}
                      className="flex-1"
                    >
                      <Edit2 className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleStatus(sequence)}
                      className="flex-1"
                    >
                      {sequence.status === "active" ? (
                        <>
                          <Pause className="h-3 w-3 mr-1" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3 mr-1" />
                          Activate
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(sequence)}
                      className="flex-1"
                    >
                      <Edit2 className="h-3 w-3 mr-1" />
                      Rename
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm("Delete this sequence and all its data?")) {
                          deleteSequence.mutate({ id: sequence.id });
                        }
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Sequence" : "Create Sequence"}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Update your email sequence"
                  : "Create a new automated email sequence"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Sequence Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Welcome Series"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the purpose of this sequence"
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    !name.trim() || createSequence.isPending || updateSequence.isPending
                  }
                >
                  {editingId ? "Update" : "Create"} Sequence
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
