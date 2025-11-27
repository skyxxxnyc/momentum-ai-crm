import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  EMAIL_VARIABLES,
  extractVariables,
  getEmailPreview,
  getVariableValues,
} from "../utils/emailVariables";

export const emailVariablesRouter = router({
  // Get list of available variables
  list: protectedProcedure.query(() => {
    return Object.entries(EMAIL_VARIABLES).map(([key, description]) => ({
      key,
      description,
      placeholder: `{{${key}}}`,
    }));
  }),

  // Get variable values for a specific contact/company
  getValues: protectedProcedure
    .input(
      z.object({
        contactId: z.number().optional(),
        companyId: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await getVariableValues({
        contactId: input.contactId,
        companyId: input.companyId,
        userId: ctx.user.id,
      });
    }),

  // Extract variables from content
  extract: protectedProcedure
    .input(
      z.object({
        content: z.string(),
      })
    )
    .query(({ input }) => {
      return extractVariables(input.content);
    }),

  // Get email preview with variables replaced
  preview: protectedProcedure
    .input(
      z.object({
        subject: z.string(),
        body: z.string(),
        contactId: z.number().optional(),
        companyId: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await getEmailPreview({
        subject: input.subject,
        body: input.body,
        contactId: input.contactId,
        companyId: input.companyId,
        userId: ctx.user.id,
      });
    }),
});
