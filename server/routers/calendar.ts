import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as calendar from "../calendar";
import * as db from "../db";

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
        const event = await calendar.createCalendarEvent({
          summary: input.summary,
          description: input.description,
          startTime: new Date(input.startTime),
          endTime: new Date(input.endTime),
          attendees: input.attendees,
          location: input.location,
          addMeetLink: input.addMeetLink,
        });

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
