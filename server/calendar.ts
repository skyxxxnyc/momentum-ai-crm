import { google } from "googleapis";

// Note: This is a simplified calendar integration
// For production, you would need to implement OAuth2 flow
// and store user tokens in the database

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
  location?: string;
  conferenceData?: any;
}

export interface CreateEventParams {
  summary: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  attendees?: string[];
  location?: string;
  addMeetLink?: boolean;
}

/**
 * Initialize Google Calendar client
 * Requires GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN
 */
function getCalendarClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Google Calendar not configured. Please add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN to environment variables."
    );
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    "http://localhost:3000/api/calendar/callback"
  );

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  return google.calendar({ version: "v3", auth: oauth2Client });
}

/**
 * List upcoming calendar events
 */
export async function listUpcomingEvents(maxResults: number = 10): Promise<CalendarEvent[]> {
  try {
    const calendar = getCalendarClient();

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      maxResults,
      singleEvents: true,
      orderBy: "startTime",
    });

    return (response.data.items || []).map((event) => ({
      id: event.id!,
      summary: event.summary || "Untitled Event",
      description: event.description || undefined,
      start: {
        dateTime: event.start?.dateTime || event.start?.date || "",
        timeZone: event.start?.timeZone || undefined,
      },
      end: {
        dateTime: event.end?.dateTime || event.end?.date || "",
        timeZone: event.end?.timeZone || undefined,
      },
      attendees: event.attendees?.map((a) => ({
        email: a.email!,
        displayName: a.displayName || undefined,
      })),
      location: event.location || undefined,
      conferenceData: event.conferenceData,
    }));
  } catch (error: any) {
    console.error("Failed to list calendar events:", error.message);
    throw new Error("Calendar integration not configured. Please add Google Calendar credentials.");
  }
}

/**
 * Create a new calendar event
 */
export async function createCalendarEvent(params: CreateEventParams): Promise<CalendarEvent> {
  try {
    const calendar = getCalendarClient();

    const event: any = {
      summary: params.summary,
      description: params.description,
      start: {
        dateTime: params.startTime.toISOString(),
        timeZone: "UTC",
      },
      end: {
        dateTime: params.endTime.toISOString(),
        timeZone: "UTC",
      },
      location: params.location,
    };

    if (params.attendees && params.attendees.length > 0) {
      event.attendees = params.attendees.map((email) => ({ email }));
    }

    if (params.addMeetLink) {
      event.conferenceData = {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      };
    }

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
      conferenceDataVersion: params.addMeetLink ? 1 : 0,
      sendUpdates: "all",
    });

    const createdEvent = response.data;

    return {
      id: createdEvent.id!,
      summary: createdEvent.summary || "",
      description: createdEvent.description || undefined,
      start: {
        dateTime: createdEvent.start?.dateTime || "",
        timeZone: createdEvent.start?.timeZone || undefined,
      },
      end: {
        dateTime: createdEvent.end?.dateTime || "",
        timeZone: createdEvent.end?.timeZone || undefined,
      },
      attendees: createdEvent.attendees?.map((a) => ({
        email: a.email!,
        displayName: a.displayName || undefined,
      })),
      location: createdEvent.location || undefined,
      conferenceData: createdEvent.conferenceData,
    };
  } catch (error: any) {
    console.error("Failed to create calendar event:", error.message);
    throw new Error("Calendar integration not configured. Please add Google Calendar credentials.");
  }
}

/**
 * Update an existing calendar event
 */
export async function updateCalendarEvent(
  eventId: string,
  params: Partial<CreateEventParams>
): Promise<CalendarEvent> {
  try {
    const calendar = getCalendarClient();

    const event: any = {};

    if (params.summary) event.summary = params.summary;
    if (params.description !== undefined) event.description = params.description;
    if (params.startTime) {
      event.start = {
        dateTime: params.startTime.toISOString(),
        timeZone: "UTC",
      };
    }
    if (params.endTime) {
      event.end = {
        dateTime: params.endTime.toISOString(),
        timeZone: "UTC",
      };
    }
    if (params.location !== undefined) event.location = params.location;
    if (params.attendees) {
      event.attendees = params.attendees.map((email) => ({ email }));
    }

    const response = await calendar.events.patch({
      calendarId: "primary",
      eventId,
      requestBody: event,
      sendUpdates: "all",
    });

    const updatedEvent = response.data;

    return {
      id: updatedEvent.id!,
      summary: updatedEvent.summary || "",
      description: updatedEvent.description || undefined,
      start: {
        dateTime: updatedEvent.start?.dateTime || "",
        timeZone: updatedEvent.start?.timeZone || undefined,
      },
      end: {
        dateTime: updatedEvent.end?.dateTime || "",
        timeZone: updatedEvent.end?.timeZone || undefined,
      },
      attendees: updatedEvent.attendees?.map((a) => ({
        email: a.email!,
        displayName: a.displayName || undefined,
      })),
      location: updatedEvent.location || undefined,
      conferenceData: updatedEvent.conferenceData,
    };
  } catch (error: any) {
    console.error("Failed to update calendar event:", error.message);
    throw new Error("Failed to update calendar event");
  }
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(eventId: string): Promise<void> {
  try {
    const calendar = getCalendarClient();

    await calendar.events.delete({
      calendarId: "primary",
      eventId,
      sendUpdates: "all",
    });
  } catch (error: any) {
    console.error("Failed to delete calendar event:", error.message);
    throw new Error("Failed to delete calendar event");
  }
}

/**
 * Get calendar authorization URL for OAuth flow
 */
export function getCalendarAuthUrl(): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Google Calendar credentials not configured");
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    "http://localhost:3000/api/calendar/callback"
  );

  const scopes = [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.events",
  ];

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
  });
}
