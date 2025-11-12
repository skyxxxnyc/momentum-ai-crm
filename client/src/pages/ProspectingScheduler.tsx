import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, Pause, Trash2, Plus, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export default function ProspectingScheduler() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    name: "",
    icpId: 0,
    frequency: "weekly" as "daily" | "weekly" | "monthly",
    maxResults: 10,
    autoCreateCompanies: true,
  });

  const utils = trpc.useUtils();
  const { data: schedules, isLoading } = trpc.scheduler.list.useQuery();
  const { data: icps } = trpc.icps.list.useQuery();

  const createSchedule = trpc.scheduler.create.useMutation({
    onSuccess: () => {
      toast.success("Schedule created successfully");
      utils.scheduler.list.invalidate();
      setIsCreateOpen(false);
      setNewSchedule({
        name: "",
        icpId: 0,
        frequency: "weekly",
        maxResults: 10,
        autoCreateCompanies: true,
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create schedule");
    },
  });

  const updateSchedule = trpc.scheduler.update.useMutation({
    onSuccess: () => {
      toast.success("Schedule updated");
      utils.scheduler.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update schedule");
    },
  });

  const deleteSchedule = trpc.scheduler.delete.useMutation({
    onSuccess: () => {
      toast.success("Schedule deleted");
      utils.scheduler.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete schedule");
    },
  });

  const triggerRun = trpc.scheduler.triggerRun.useMutation({
    onSuccess: () => {
      toast.success("Prospecting run started");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to trigger run");
    },
  });

  const handleCreate = () => {
    if (!newSchedule.name || !newSchedule.icpId) {
      toast.error("Please fill in all required fields");
      return;
    }

    createSchedule.mutate(newSchedule);
  };

  const toggleActive = (id: number, currentActive: boolean) => {
    updateSchedule.mutate({ id, isActive: !currentActive });
  };

  const getFrequencyBadge = (frequency: string) => {
    const colors = {
      daily: "bg-lime-500/20 text-lime-500 border-lime-500/50",
      weekly: "bg-blue-500/20 text-blue-500 border-blue-500/50",
      monthly: "bg-purple-500/20 text-purple-500 border-purple-500/50",
    };
    return colors[frequency as keyof typeof colors] || colors.weekly;
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Not scheduled";
    return new Date(date).toLocaleString();
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prospecting Scheduler</h1>
          <p className="text-muted-foreground mt-1">
            Automate prospecting runs on a schedule
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Schedule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Prospecting Schedule</DialogTitle>
              <DialogDescription>
                Set up automated prospecting runs for an ICP
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Schedule Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Weekly Restaurant Prospecting"
                  value={newSchedule.name}
                  onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="icp">Target ICP *</Label>
                <Select
                  value={newSchedule.icpId.toString()}
                  onValueChange={(value) =>
                    setNewSchedule({ ...newSchedule, icpId: parseInt(value) })
                  }
                >
                  <SelectTrigger id="icp">
                    <SelectValue placeholder="Select ICP..." />
                  </SelectTrigger>
                  <SelectContent>
                    {icps?.map((icp: any) => (
                      <SelectItem key={icp.id} value={icp.id.toString()}>
                        {icp.name} ({icp.industry})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency *</Label>
                <Select
                  value={newSchedule.frequency}
                  onValueChange={(value: any) =>
                    setNewSchedule({ ...newSchedule, frequency: value })
                  }
                >
                  <SelectTrigger id="frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily (9 AM)</SelectItem>
                    <SelectItem value="weekly">Weekly (Mondays 9 AM)</SelectItem>
                    <SelectItem value="monthly">Monthly (1st day 9 AM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxResults">Max Results per Run</Label>
                <Input
                  id="maxResults"
                  type="number"
                  min="1"
                  max="50"
                  value={newSchedule.maxResults}
                  onChange={(e) =>
                    setNewSchedule({ ...newSchedule, maxResults: parseInt(e.target.value) || 10 })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="autoCreate">Auto-Create Companies</Label>
                <Switch
                  id="autoCreate"
                  checked={newSchedule.autoCreateCompanies}
                  onCheckedChange={(checked) =>
                    setNewSchedule({ ...newSchedule, autoCreateCompanies: checked })
                  }
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={createSchedule.isPending}
                className="flex-1"
              >
                {createSchedule.isPending ? "Creating..." : "Create Schedule"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Schedules List */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading schedules...</div>
      ) : schedules && schedules.length > 0 ? (
        <div className="grid gap-4">
          {schedules.map((schedule: any) => {
            const icp = icps?.find((i: any) => i.id === schedule.icpId);
            return (
              <Card key={schedule.id} className="border-2">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl">{schedule.name}</CardTitle>
                        <Badge variant="outline" className={getFrequencyBadge(schedule.frequency)}>
                          {schedule.frequency.toUpperCase()}
                        </Badge>
                        {schedule.isActive === 1 ? (
                          <Badge variant="outline" className="bg-lime-500/20 text-lime-500 border-lime-500/50">
                            ACTIVE
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-500/20 text-gray-500 border-gray-500/50">
                            PAUSED
                          </Badge>
                        )}
                      </div>
                      <CardDescription>
                        ICP: {icp?.name || "Unknown"} • Max {schedule.maxResults} results •{" "}
                        {schedule.autoCreateCompanies === 1 ? "Auto-create enabled" : "Manual review"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-muted/50 p-3 space-y-1">
                      <p className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        Last Run
                      </p>
                      <p className="text-sm font-semibold">{formatDate(schedule.lastRunAt)}</p>
                    </div>
                    <div className="bg-muted/50 p-3 space-y-1">
                      <p className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        Next Run
                      </p>
                      <p className="text-sm font-semibold">{formatDate(schedule.nextRunAt)}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActive(schedule.id, schedule.isActive === 1)}
                      disabled={updateSchedule.isPending}
                      className="gap-2"
                    >
                      {schedule.isActive === 1 ? (
                        <>
                          <Pause className="h-4 w-4" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          Resume
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => triggerRun.mutate({ id: schedule.id })}
                      disabled={triggerRun.isPending}
                      className="gap-2"
                    >
                      <Play className="h-4 w-4" />
                      Run Now
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this schedule?")) {
                          deleteSchedule.mutate({ id: schedule.id });
                        }
                      }}
                      disabled={deleteSchedule.isPending}
                      className="gap-2 ml-auto text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No schedules yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first automated prospecting schedule
            </p>
            <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Schedule
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
