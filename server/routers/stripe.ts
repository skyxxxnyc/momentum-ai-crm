import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { stripe } from "../_core/stripe";
import { getPlanById } from "../stripe/products";
import { ENV } from "../_core/env";

export const stripeRouter = router({
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        planId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const plan = getPlanById(input.planId);
      if (!plan) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid plan ID",
        });
      }

      try {
        // Create or get Stripe customer
        let customerId = ctx.user.stripeCustomerId;
        
        if (!customerId) {
          const customer = await stripe.customers.create({
            email: ctx.user.email || undefined,
            name: ctx.user.name || undefined,
            metadata: {
              userId: ctx.user.id.toString(),
            },
          });
          customerId = customer.id;
          
          // Update user with Stripe customer ID
          const { getDb } = await import("../db");
          const db = await getDb();
          if (db) {
            const { users } = await import("../../drizzle/schema");
            const { eq } = await import("drizzle-orm");
            await db.update(users)
              .set({ stripeCustomerId: customerId })
              .where(eq(users.id, ctx.user.id));
          }
        }

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          payment_method_types: ["card"],
          line_items: [
            {
              price: plan.stripePriceId,
              quantity: 1,
            },
          ],
          mode: "subscription",
          success_url: `${ENV.frontendUrl}/dashboard?checkout=success`,
          cancel_url: `${ENV.frontendUrl}/?checkout=canceled`,
          metadata: {
            userId: ctx.user.id.toString(),
            planId: plan.id,
          },
        });

        return {
          sessionId: session.id,
          url: session.url,
        };
      } catch (error) {
        console.error("Stripe checkout error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create checkout session",
        });
      }
    }),

  createPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
    if (!ctx.user.stripeCustomerId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No Stripe customer found",
      });
    }

    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: ctx.user.stripeCustomerId,
        return_url: `${ENV.frontendUrl}/dashboard`,
      });

      return {
        url: session.url,
      };
    } catch (error) {
      console.error("Stripe portal error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create portal session",
      });
    }
  }),

  getSubscriptionStatus: protectedProcedure.query(async ({ ctx }) => {
    return {
      plan: ctx.user.subscriptionPlan,
      status: ctx.user.subscriptionStatus,
      stripeCustomerId: ctx.user.stripeCustomerId,
      stripeSubscriptionId: ctx.user.stripeSubscriptionId,
    };
  }),
});
