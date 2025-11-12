import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { sendEmail, sendSequenceEmail, emailTemplates, renderTemplate } from "../email";

export const emailRouter = router({
  // Send a single email
  send: protectedProcedure
    .input(
      z.object({
        to: z.string().email(),
        subject: z.string(),
        body: z.string(),
        dealId: z.number().optional(),
        contactId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await sendEmail({
        to: input.to,
        subject: input.subject,
        html: input.body,
      });

      // Log activity
      if (result.success && input.dealId) {
        await db.createActivity({
          userId: ctx.user.id,
          dealId: input.dealId,
          type: "email",
          description: `Sent email: ${input.subject}`,
          createdAt: new Date(),
        });
      }

      return result;
    }),

  // Get email templates
  templates: protectedProcedure.query(() => {
    return Object.entries(emailTemplates).map(([key, template]) => ({
      id: key,
      ...template,
    }));
  }),

  // Create email sequence
  createSequence: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return db.createEmailSequence({
        ownerId: ctx.user.id,
        name: input.name,
        description: input.description,
        status: "active",
        createdAt: new Date(),
      });
    }),

  // List email sequences
  listSequences: protectedProcedure.query(async ({ ctx }) => {
    return db.getEmailSequences(ctx.user.id);
  }),

  // Add step to sequence
  addStep: protectedProcedure
    .input(
      z.object({
        sequenceId: z.number(),
        stepNumber: z.number(),
        delayDays: z.number(),
        subject: z.string(),
        body: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return db.createEmailSequenceStep({
        sequenceId: input.sequenceId,
        stepNumber: input.stepNumber,
        delayDays: input.delayDays,
        subject: input.subject,
        body: input.body,
        createdAt: new Date(),
      });
    }),

  // Get sequence steps
  getSteps: protectedProcedure
    .input(z.object({ sequenceId: z.number() }))
    .query(async ({ input }) => {
      return db.getEmailSequenceSteps(input.sequenceId);
    }),

  // Enroll contact in sequence
  enrollContact: protectedProcedure
    .input(
      z.object({
        sequenceId: z.number(),
        contactId: z.number(),
        dealId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const contact = await db.getContactById(input.contactId);
      if (!contact || !contact.email) {
        throw new Error("Contact email not found");
      }

      // Create enrollment (would need createEmailSequenceEnrollment function in db.ts)
      // For now, just send the first email

      // Send first email immediately
      const steps = await db.getEmailSequenceSteps(input.sequenceId);
      const firstStep = steps.find((s) => s.stepNumber === 1);

      if (firstStep) {
        const variables: Record<string, string> = {
          contact_name: `${contact.firstName} ${contact.lastName || ""}`.trim() || "there",
          sender_name: ctx.user.name || "The Team",
        };

        await sendSequenceEmail({
          to: contact.email,
          subject: renderTemplate(firstStep.subject || "", variables),
          body: renderTemplate(firstStep.body || "", variables),
          contactId: input.contactId,
          dealId: input.dealId,
          sequenceId: input.sequenceId,
          stepNumber: 1,
        });
      }

      return { success: true };
    }),

  // Send test email
  sendTest: protectedProcedure
    .input(
      z.object({
        to: z.string().email(),
        templateId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const template = emailTemplates[input.templateId];
      if (!template) {
        throw new Error("Template not found");
      }

      const variables: Record<string, string> = {
        contact_name: "Test User",
        company_name: "Momentum AI",
        deal_title: "Test Deal",
        sender_name: ctx.user.name || "The Team",
      };

      return sendEmail({
        to: input.to,
        subject: renderTemplate(template.subject, variables),
        html: renderTemplate(template.body, variables),
      });
    }),
});
