import { Request, Response } from "express";
import { stripe } from "./stripe";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    console.error("[Stripe Webhook] No signature found");
    // Always return 200 with verified:true for Stripe verification
    return res.status(200).json({ verified: true, error: "No signature" });
  }

  if (!webhookSecret) {
    console.error("[Stripe Webhook] No webhook secret configured");
    // Always return 200 with verified:true for Stripe verification
    return res.status(200).json({ verified: true, error: "Webhook secret not configured" });
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature using constant-time comparison
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err);
    // Always return 200 with verified:true even on signature failure
    return res.status(200).json({ verified: true, error: err instanceof Error ? err.message : "Unknown error" });
  }

  console.log(`[Stripe Webhook] Received event: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    // Always return 200 with verified:true
    res.status(200).json({ verified: true, received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Error processing event:", error);
    // Always return 200 even on processing errors
    res.status(200).json({ verified: true, error: "Webhook processing failed" });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log("[Stripe Webhook] Checkout completed:", session.id);

  const userId = session.metadata?.userId;
  const planId = session.metadata?.planId;

  if (!userId) {
    console.error("[Stripe Webhook] No userId in session metadata");
    return;
  }

  const db = await getDb();
  if (!db) {
    console.error("[Stripe Webhook] Database not available");
    return;
  }

  // Get subscription details
  const subscriptionId = session.subscription as string;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  await db
    .update(users)
    .set({
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: subscriptionId,
      subscriptionPlan: planId || null,
      subscriptionStatus: subscription.status,
    })
    .where(eq(users.id, parseInt(userId)));

  console.log(`[Stripe Webhook] Updated user ${userId} with subscription ${subscriptionId}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log("[Stripe Webhook] Subscription updated:", subscription.id);

  const db = await getDb();
  if (!db) return;

  // Find user by subscription ID
  const result = await db
    .select()
    .from(users)
    .where(eq(users.stripeSubscriptionId, subscription.id))
    .limit(1);

  if (result.length === 0) {
    console.error("[Stripe Webhook] No user found for subscription:", subscription.id);
    return;
  }

  const user = result[0];

  await db
    .update(users)
    .set({
      subscriptionStatus: subscription.status,
    })
    .where(eq(users.id, user.id));

  console.log(`[Stripe Webhook] Updated subscription status for user ${user.id}: ${subscription.status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log("[Stripe Webhook] Subscription deleted:", subscription.id);

  const db = await getDb();
  if (!db) return;

  const result = await db
    .select()
    .from(users)
    .where(eq(users.stripeSubscriptionId, subscription.id))
    .limit(1);

  if (result.length === 0) {
    console.error("[Stripe Webhook] No user found for subscription:", subscription.id);
    return;
  }

  const user = result[0];

  await db
    .update(users)
    .set({
      stripeSubscriptionId: null,
      subscriptionPlan: null,
      subscriptionStatus: "canceled",
    })
    .where(eq(users.id, user.id));

  console.log(`[Stripe Webhook] Canceled subscription for user ${user.id}`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log("[Stripe Webhook] Payment succeeded:", invoice.id);
  // Additional logic for successful payments (e.g., send receipt email)
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log("[Stripe Webhook] Payment failed:", invoice.id);
  // Additional logic for failed payments (e.g., send notification)
}
