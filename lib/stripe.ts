import Stripe from "stripe";

let client: Stripe | null = null;

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  if (!client) {
    client = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return client;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export type PlanId = "FREE" | "STARTER" | "PRO" | "ENTERPRISE";

export interface PlanConfig {
  id: PlanId;
  name: string;
  price: number; // USD per user / month
  meetingsPerMonth: number | null; // null = unlimited
  exports: ("PDF" | "DOCX" | "CSV" | "JSON" | "EHR_HL7")[];
  allMeetingTypes: boolean; // false = General only
  askClarix: boolean;
  proVerticals: boolean;
  sso: boolean;
  customTemplates: boolean;
  priceEnv?: string; // env var holding the Stripe price id
  blurb: string;
}

export const PLANS: Record<PlanId, PlanConfig> = {
  FREE: {
    id: "FREE",
    name: "Free",
    price: 0,
    meetingsPerMonth: 3,
    exports: [],
    allMeetingTypes: false,
    askClarix: false,
    proVerticals: false,
    sso: false,
    customTemplates: false,
    blurb: "3 meetings/month, General type only.",
  },
  STARTER: {
    id: "STARTER",
    name: "Starter",
    price: 19,
    meetingsPerMonth: 20,
    exports: ["PDF"],
    allMeetingTypes: true,
    askClarix: false,
    proVerticals: false,
    sso: false,
    customTemplates: false,
    priceEnv: "STRIPE_STARTER_PRICE_ID",
    blurb: "20 meetings/month, all General types, PDF export.",
  },
  PRO: {
    id: "PRO",
    name: "Pro",
    price: 49,
    meetingsPerMonth: null,
    exports: ["PDF", "DOCX", "CSV", "JSON"],
    allMeetingTypes: true,
    askClarix: true,
    proVerticals: false,
    sso: false,
    customTemplates: false,
    priceEnv: "STRIPE_PRO_PRICE_ID",
    blurb: "Unlimited meetings, all types, all exports, Ask CLARIX.",
  },
  ENTERPRISE: {
    id: "ENTERPRISE",
    name: "Enterprise",
    price: 89,
    meetingsPerMonth: null,
    exports: ["PDF", "DOCX", "CSV", "JSON", "EHR_HL7"],
    allMeetingTypes: true,
    askClarix: true,
    proVerticals: true,
    sso: true,
    customTemplates: true,
    priceEnv: "STRIPE_ENTERPRISE_PRICE_ID",
    blurb: "Everything + Pro Verticals, SSO, custom templates, API, HIPAA BAA.",
  },
};
