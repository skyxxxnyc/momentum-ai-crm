/**
 * Pica OS Google Calendar Integration Service
 * Creates calendar events using Pica's passthrough API with quickAdd
 */

interface CreateEventParams {
  eventText: string;
  calendarId?: string;
  sendUpdates?: 'all' | 'externalOnly' | 'none';
}

interface PicaCalendarEvent {
  kind: string;
  etag: string;
  id: string;
  status: string;
  htmlLink: string;
  created: string;
  updated: string;
  summary: string;
  creator: {
    email: string;
    self: boolean;
  };
  organizer: {
    email: string;
    self: boolean;
  };
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  eventType: string;
}

/**
 * Create a calendar event using natural language via Pica Calendar API
 * 
 * @param eventText - Natural language description, e.g., "Meeting with sarah@example.com tomorrow at 2pm"
 * @param calendarId - Calendar ID (default: 'primary')
 * @param sendUpdates - Whether to send email notifications ('all', 'externalOnly', 'none')
 */
export async function createCalendarEventViaPica(params: CreateEventParams): Promise<PicaCalendarEvent> {
  const { eventText, calendarId = 'primary', sendUpdates = 'all' } = params;

  const picaSecretKey = process.env.PICA_SECRET_KEY;
  const picaCalendarConnectionKey = process.env.PICA_GOOGLE_CALENDAR_CONNECTION_KEY;

  if (!picaSecretKey || !picaCalendarConnectionKey) {
    throw new Error(
      'Missing Pica credentials. Please set PICA_SECRET_KEY and PICA_GOOGLE_CALENDAR_CONNECTION_KEY environment variables.'
    );
  }

  // URL-encode the event text
  const encodedEventText = encodeURIComponent(eventText);
  
  // Build the URL with query parameters
  const url = `https://api.picaos.com/v1/passthrough/calendars/${calendarId}/events/quickAdd?text=${encodedEventText}&sendUpdates=${sendUpdates}`;

  const headers = {
    'x-pica-secret': picaSecretKey,
    'x-pica-connection-key': picaCalendarConnectionKey,
    'x-pica-action-id': 'conn_mod_def::F_Jd9lD1m3Y::XwU7qyzzQJSb6VGapt1tcQ',
    'Content-Type': 'application/json',
  };

  // Always include empty JSON object as body (as per Pica docs)
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Pica Calendar API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Helper function to format event text from structured data
 */
export function formatEventText(params: {
  title: string;
  attendeeEmail?: string;
  date: string; // e.g., "tomorrow", "next Tuesday", "2024-01-15"
  time: string; // e.g., "2pm", "14:00", "2:30 PM"
  duration?: string; // e.g., "1 hour", "30 minutes"
}): string {
  const { title, attendeeEmail, date, time, duration } = params;
  
  let eventText = title;
  
  if (attendeeEmail) {
    eventText += ` with ${attendeeEmail}`;
  }
  
  eventText += ` ${date} at ${time}`;
  
  if (duration) {
    eventText += ` for ${duration}`;
  }
  
  return eventText;
}

/**
 * Create a meeting with specific details
 */
export async function createMeetingViaPica(params: {
  title: string;
  attendeeEmail: string;
  date: string;
  time: string;
  duration?: string;
  calendarId?: string;
  sendUpdates?: 'all' | 'externalOnly' | 'none';
}): Promise<PicaCalendarEvent> {
  const { title, attendeeEmail, date, time, duration, calendarId, sendUpdates } = params;
  
  const eventText = formatEventText({ title, attendeeEmail, date, time, duration });
  
  return createCalendarEventViaPica({
    eventText,
    calendarId,
    sendUpdates,
  });
}
