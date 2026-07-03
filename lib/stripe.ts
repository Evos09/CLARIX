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
  price: number; // USD per user / month (monthly billing)
  annualPrice?: number; // USD per user / month (annual billing)
  meetingsPerMonth: number | null; // null = unlimited
  exports: ("PDF" | "DOCX" | "CSV" | "JSON" | "EHR_HL7")[];
  allMeetingTypes: boolean; // false = General only
  askClarix: boolean;
  proVerticals: boolean;
  sso: boolean;
  customTemplates: boolean;
  autoJoinBot: boolean; // calendar auto-join notetaker (Zoom/Meet/Teams)
  foreverRetention: boolean; // audio library kept forever (vs best-effort on Free)
  priceEnv?: string; // env var holding the Stripe price id
  annualPriceEnv?: string; // env var holding the Stripe annual price id
  blurb: string;
}

export const PLANS: Record<PlanId, PlanConfig> = {
  FREE: {
    id: "FREE",
    name: "Free",
    price: 0,
    meetingsPerMonth: 3,
    exports: ["PDF"],
    allMeetingTypes: false,
    askClarix: false,
    proVerticals: false,
    sso: false,
    customTemplates: false,
    autoJoinBot: false,
    foreverRetention: false,
    blurb: "3 meetings/month, General type only, PDF export.",
  },
  STARTER: {
    id: "STARTER",
    name: "Starter",
    price: 14,
    annualPrice: 12,
    meetingsPerMonth: 20,
    exports: ["PDF", "DOCX", "CSV"],
    allMeetingTypes: true,
    askClarix: false,
    proVerticals: false,
    sso: false,
    customTemplates: false,
    autoJoinBot: true,
    foreverRetention: true,
    priceEnv: "STRIPE_STARTER_PRICE_ID",
    annualPriceEnv: "STRIPE_STARTER_ANNUAL_PRICE_ID",
    blurb: "20 meetings/month, all General types, PDF export, auto-join bot, forever library.",
  },
  PRO: {
    id: "PRO",
    name: "Pro",
    price: 29,
    annualPrice: 24,
    meetingsPerMonth: null,
    exports: ["PDF", "DOCX", "CSV", "JSON"],
    allMeetingTypes: true,
    askClarix: true,
    proVerticals: false,
    sso: false,
    customTemplates: false,
    autoJoinBot: true,
    foreverRetention: true,
    priceEnv: "STRIPE_PRO_PRICE_ID",
    annualPriceEnv: "STRIPE_PRO_ANNUAL_PRICE_ID",
    blurb: "Unlimited meetings, all types, all exports, Ask CLARIX, auto-join bot.",
  },
  // Internal id stays "ENTERPRISE" (matches the Prisma Plan enum + webhooks, so
  // no DB migration); customer-facing name is "Business" — our top self-serve
  // tier. True Enterprise is a talk-to-sales tier with no self-serve price.
  ENTERPRISE: {
    id: "ENTERPRISE",
    name: "Business",
    price: 59,
    annualPrice: 49,
    meetingsPerMonth: null,
    exports: ["PDF", "DOCX", "CSV", "JSON", "EHR_HL7"],
    allMeetingTypes: true,
    askClarix: true,
    proVerticals: true,
    sso: true,
    customTemplates: true,
    autoJoinBot: true,
    foreverRetention: true,
    priceEnv: "STRIPE_ENTERPRISE_PRICE_ID",
    annualPriceEnv: "STRIPE_ENTERPRISE_ANNUAL_PRICE_ID",
    blurb: "Everything in Pro + Pro Verticals, custom templates, EHR/FHIR export, priority support.",
  },
};
