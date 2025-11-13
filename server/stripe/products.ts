/**
 * Stripe product and price configuration for siaCRM subscriptions
 * 
 * To set up in Stripe Dashboard:
 * 1. Create products in Stripe Dashboard → Products
 * 2. Create prices for each product
 * 3. Copy the price IDs and update them here
 */

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  stripePriceId: string; // Update these with your actual Stripe Price IDs
  price: number;
  interval: "month" | "year";
  features: string[];
  contactLimit: number;
  popular?: boolean;
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  starter: {
    id: "starter",
    name: "Starter",
    description: "Perfect for solopreneurs and small teams",
    stripePriceId: process.env.STRIPE_PRICE_STARTER || "price_starter_monthly", // Replace with actual Price ID
    price: 29,
    interval: "month",
    contactLimit: 1000,
    features: [
      "Up to 1,000 contacts",
      "Email sequences",
      "Basic CRM features",
      "Activity tracking",
      "Email support",
    ],
  },
  professional: {
    id: "professional",
    name: "Professional",
    description: "For growing teams that need more power",
    stripePriceId: process.env.STRIPE_PRICE_PROFESSIONAL || "price_professional_monthly", // Replace with actual Price ID
    price: 99,
    interval: "month",
    contactLimit: 10000,
    popular: true,
    features: [
      "Up to 10,000 contacts",
      "Advanced email automation",
      "AI insights & recommendations",
      "Custom fields & workflows",
      "Priority support",
      "Team collaboration tools",
    ],
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    description: "For large organizations with custom needs",
    stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE || "price_enterprise_monthly", // Replace with actual Price ID
    price: 499,
    interval: "month",
    contactLimit: -1, // Unlimited
    features: [
      "Unlimited contacts",
      "Dedicated account manager",
      "Custom integrations",
      "Advanced security & compliance",
      "SLA guarantee",
      "White-label options",
    ],
  },
};

export function getPlanById(planId: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS[planId];
}

export function getPlanByPriceId(priceId: string): SubscriptionPlan | undefined {
  return Object.values(SUBSCRIPTION_PLANS).find(
    (plan) => plan.stripePriceId === priceId
  );
}

export function getAllPlans(): SubscriptionPlan[] {
  return Object.values(SUBSCRIPTION_PLANS);
}
