import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as calendar from "../calendar";
import * as db from "../db";
import { createCalendarEventViaPica, createMeetingViaPica, formatEventText } from "../services/picaCalendar";

// Check if Pica is configured
function isPicaConfigured(): boolean {
  return !!(process.env.PICA_SECRET_KEY && process.env.PICA_GOOGLE_CALENDAR_CONNECTION_KEY);
}

export const calendarRouter = router({
  // List upcoming calendar events
  listEvents: protectedProcedure
    .input(
      z
        .object({
          maxResults: z.number().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      try {
        const events = await calendar.listUpcomingEvents(input?.maxResults || 10);
        return { success: true, events };
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
          events: [],
        };
      }
    }),

  // Create a new calendar event
  createEvent: protectedProcedure
    .input(
      z.object({
        summary: z.string(),
        description: z.string().optional(),
        startTime: z.string(), // ISO string
        endTime: z.string(), // ISO string
        attendees: z.array(z.string()).optional(),
        location: z.string().optional(),
        addMeetLink: z.boolean().optional(),
        // CRM-specific fields
        dealId: z.number().optional(),
        contactId: z.number().optional(),
        companyId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        let event;

        // Use Pica if configured, otherwise fall back to Google OAuth
        if (isPicaConfigured()) {
          // Use Pica's quickAdd API with natural language
          const startDate = new Date(input.startTime);
          const endDate = new Date(input.endTime);
          const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60)); // minutes
          
          // Format natural language event text
          const attendeeEmail = input.attendees && input.attendees.length > 0 ? input.attendees[0] : undefined;
          const eventText = formatEventText({
            title: input.summary,
            attendeeEmail,
            date: startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
            time: startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
            duration: duration > 0 ? `${duration} minutes` : undefined,
          });

          event = await createCalendarEventViaPica({
            eventText,
            calendarId: 'primary',
            sendUpdates: 'all',
          });
        } else {
          // Fallback to Google OAuth
          event = await calendar.createCalendarEvent({
            summary: input.summary,
            description: input.description,
            startTime: new Date(input.startTime),
            endTime: new Date(input.endTime),
            attendees: input.attendees,
            location: input.location,
            addMeetLink: input.addMeetLink,
          });
        }

        // Log activity in CRM
        if (input.dealId || input.contactId || input.companyId) {
          await db.createActivity({
            userId: ctx.user.id,
            type: "meeting",
            subject: input.summary,
            description: input.description || null,
            dealId: input.dealId || null,
            contactId: input.contactId || null,
            companyId: input.companyId || null,
            activityDate: new Date(input.startTime),
          });
        }

        return { success: true, event };
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
        };
      }
    }),

  // Quick create meeting with natural language (Pica-specific)
  quickCreateMeeting: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        attendeeEmail: z.string().email(),
        date: z.string(), // e.g., "tomorrow", "next Tuesday", "2024-01-15"
        time: z.string(), // e.g., "2pm", "14:00"
        duration: z.string().optional(), // e.g., "1 hour", "30 minutes"
        dealId: z.number().optional(),
        contactId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!isPicaConfigured()) {
        return {
          success: false,
          error: "Pica Calendar integration not configured. Please set PICA_SECRET_KEY and PICA_GOOGLE_CALENDAR_CONNECTION_KEY.",
        };
      }

      try {
        const event = await createMeetingViaPica({
          title: input.title,
          attendeeEmail: input.attendeeEmail,
          date: input.date,
          time: input.time,
          duration: input.duration,
          sendUpdates: 'all',
        });

        // Log activity in CRM
        if (input.dealId || input.contactId) {
          await db.createActivity({
            userId: ctx.user.id,
            type: "meeting",
            subject: input.title,
            description: `Meeting scheduled via Pica Calendar`,
            dealId: input.dealId || null,
            contactId: input.contactId || null,
            activityDate: new Date(event.start.dateTime),
          });
        }

        return { success: true, event };
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
        };
      }
    }),

  // Update calendar event
  updateEvent: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
        summary: z.string().optional(),
        description: z.string().optional(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        attendees: z.array(z.string()).optional(),
        location: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const event = await calendar.updateCalendarEvent(input.eventId, {
          summary: input.summary,
          description: input.description,
          startTime: input.startTime ? new Date(input.startTime) : undefined,
          endTime: input.endTime ? new Date(input.endTime) : undefined,
          attendees: input.attendees,
          location: input.location,
        });

        return { success: true, event };
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
        };
      }
    }),

  // Delete calendar event
  deleteEvent: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        await calendar.deleteCalendarEvent(input.eventId);
        return { success: true };
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
        };
      }
    }),

  // Get OAuth authorization URL
  getAuthUrl: protectedProcedure.query(() => {
    try {
      const url = calendar.getCalendarAuthUrl();
      return { success: true, url };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        url: "",
      };
    }
  }),
});
