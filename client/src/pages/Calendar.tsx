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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, Plus, Video, MapPin, Users, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

export default function Calendar() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    summary: "",
    description: "",
    startTime: "",
    endTime: "",
    location: "",
    attendees: "",
    addMeetLink: false,
  });

  const utils = trpc.useUtils();
  const { data: eventsData, isLoading } = trpc.calendar.listEvents.useQuery({ maxResults: 20 });
  const events = eventsData?.events || [];

  const createMutation = trpc.calendar.createEvent.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Meeting created successfully");
        setOpen(false);
        setFormData({
          summary: "",
          description: "",
          startTime: "",
          endTime: "",
          location: "",
          attendees: "",
          addMeetLink: false,
        });
        utils.calendar.listEvents.invalidate();
      } else {
        toast.error(data.error || "Failed to create meeting");
      }
    },
  });

  const deleteMutation = trpc.calendar.deleteEvent.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Meeting deleted");
        utils.calendar.listEvents.invalidate();
      } else {
        toast.error(data.error || "Failed to delete meeting");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      summary: formData.summary,
      description: formData.description || undefined,
      startTime: formData.startTime,
      endTime: formData.endTime,
      location: formData.location || undefined,
      attendees: formData.attendees
        ? formData.attendees.split(",").map((e) => e.trim())
        : undefined,
      addMeetLink: formData.addMeetLink,
    });
  };

  // Show configuration message if calendar is not set up
  if (eventsData && !eventsData.success) {
    return (
      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
            <p className="text-muted-foreground mt-1">Sync meetings and schedule calls</p>
          </div>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Google Calendar Integration
            </CardTitle>
            <CardDescription>
              Connect your Google Calendar to sync meetings and automatically log activities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 p-4 space-y-2">
              <p className="text-sm font-medium">Setup Required</p>
              <p className="text-sm text-muted-foreground">
                To use calendar features, you need to configure Google Calendar API credentials:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-2">
                <li>GOOGLE_CLIENT_ID</li>
                <li>GOOGLE_CLIENT_SECRET</li>
                <li>GOOGLE_REFRESH_TOKEN</li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              Contact your administrator to enable Google Calendar integration.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground mt-1">
            {events.length} upcoming {events.length === 1 ? "meeting" : "meetings"}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Schedule Meeting
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule New Meeting</DialogTitle>
              <DialogDescription>Create a calendar event and invite attendees</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="summary">Meeting Title *</Label>
                <Input
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="e.g., Product Demo Call"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time *</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Meeting agenda and notes..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="attendees">Attendees (comma-separated emails)</Label>
                <Input
                  id="attendees"
                  value={formData.attendees}
                  onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                  placeholder="john@example.com, jane@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Office, Zoom, etc."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="addMeetLink"
                  checked={formData.addMeetLink}
                  onChange={(e) => setFormData({ ...formData, addMeetLink: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="addMeetLink" className="cursor-pointer">
                  Add Google Meet link
                </Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Meeting"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading calendar events...</div>
      ) : events.length === 0 ? (
        <Card className="border-2">
          <CardContent className="py-12 text-center">
            <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No upcoming meetings</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Schedule your first meeting to get started
            </p>
            <Button onClick={() => setOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Schedule Meeting
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <Card key={event.id} className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-xl">{event.summary}</CardTitle>
                    <CardDescription className="flex items-center gap-2 text-sm">
                      <CalendarIcon className="h-3 w-3" />
                      {format(parseISO(event.start.dateTime), "PPP 'at' p")}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMutation.mutate({ eventId: event.id })}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {event.description && (
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                )}

                <div className="flex flex-wrap gap-4 text-sm">
                  {event.location && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </div>
                  )}

                  {event.attendees && event.attendees.length > 0 && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {event.attendees.length}{" "}
                      {event.attendees.length === 1 ? "attendee" : "attendees"}
                    </div>
                  )}

                  {event.conferenceData && (
                    <div className="flex items-center gap-2 text-primary">
                      <Video className="h-4 w-4" />
                      Google Meet
                    </div>
                  )}
                </div>

                {event.conferenceData?.entryPoints?.[0]?.uri && (
                  <Button variant="outline" size="sm" className="gap-2" asChild>
                    <a
                      href={event.conferenceData.entryPoints[0].uri}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Join Meeting
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
