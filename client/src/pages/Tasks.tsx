import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function Tasks() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ title: "", priority: "medium", status: "todo" });
  const utils = trpc.useUtils();
  const { data: tasks } = trpc.tasks.list.useQuery();
  const createMutation = trpc.tasks.create.useMutation({
    onSuccess: () => { utils.tasks.list.invalidate(); toast.success("Task created"); setOpen(false); setFormData({ title: "", priority: "medium", status: "todo" }); },
  });
  const updateMutation = trpc.tasks.update.useMutation({
    onSuccess: () => { utils.tasks.list.invalidate(); toast.success("Task updated"); },
  });

  const toggleStatus = (task: any) => {
    updateMutation.mutate({
      id: task.id,
      status: task.status === "completed" ? "todo" : "completed",
      completedAt: task.status === "completed" ? undefined : new Date(),
    });
  };

  const todoTasks = tasks?.filter(t => t.status === "todo") || [];
  const inProgressTasks = tasks?.filter(t => t.status === "in_progress") || [];
  const completedTasks = tasks?.filter(t => t.status === "completed") || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Tasks</h1><p className="text-muted-foreground">Manage your to-do list</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" />Add Task</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Task</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData as any); }}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2"><Label>Title *</Label><Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Priority</Label><Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v as any })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="urgent">Urgent</SelectItem></SelectContent></Select></div>
              </div>
              <DialogFooter><Button type="submit">Create Task</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-yellow-500" />To Do ({todoTasks.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {todoTasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Checkbox checked={false} onCheckedChange={() => toggleStatus(task)} />
                <div className="flex-1"><p className="font-medium">{task.title}</p><p className="text-xs text-muted-foreground capitalize">{task.priority} priority</p></div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-blue-500" />In Progress ({inProgressTasks.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {inProgressTasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Checkbox checked={false} onCheckedChange={() => toggleStatus(task)} />
                <div className="flex-1"><p className="font-medium">{task.title}</p><p className="text-xs text-muted-foreground capitalize">{task.priority} priority</p></div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" />Completed ({completedTasks.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {completedTasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 opacity-60">
                <Checkbox checked={true} onCheckedChange={() => toggleStatus(task)} />
                <div className="flex-1"><p className="font-medium line-through">{task.title}</p><p className="text-xs text-muted-foreground capitalize">{task.priority} priority</p></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
