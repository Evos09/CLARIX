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

export type PlanId = "FREE" | "STARTER" | "PRO" | "BUSINESS" | "ENTERPRISE";

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
    meetingsPerMonth: 10,
    exports: ["PDF"],
    allMeetingTypes: false,
    askClarix: false,
    proVerticals: false,
    sso: false,
    customTemplates: false,
    autoJoinBot: false,
    foreverRetention: false,
    blurb: "10 meetings/month, General type only, PDF export.",
  },
  STARTER: {
    id: "STARTER",
    name: "Starter",
    price: 15,
    annualPrice: 13, // per-user/mo billed annually
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
    blurb: "20 meetings/month, all General types, PDF export, 25 Clarix Chat messages/mo, auto-join bot, forever library.",
  },
  PRO: {
    id: "PRO",
    name: "Pro",
    price: 30,
    annualPrice: 25, // per-user/mo billed annually
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
    blurb: "Unlimited meetings, all types, all exports, 100 Clarix Chat messages/mo, auto-join bot.",
  },
  // Top self-serve tier. Everything in Pro + unlimited Ask CLARIX, custom AI
  // templates, and priority support. The regulated stuff (Pro Verticals, EHR,
  // SSO, CRM) lives on the sales-led ENTERPRISE tier below.
  BUSINESS: {
    id: "BUSINESS",
    name: "Business",
    price: 49,
    annualPrice: 40, // per-user/mo billed annually
    meetingsPerMonth: null,
    exports: ["PDF", "DOCX", "CSV", "JSON"],
    allMeetingTypes: true,
    askClarix: true,
    proVerticals: false,
    sso: false,
    customTemplates: true,
    autoJoinBot: true,
    foreverRetention: true,
    priceEnv: "STRIPE_BUSINESS_PRICE_ID",
    annualPriceEnv: "STRIPE_BUSINESS_ANNUAL_PRICE_ID",
    blurb: "Everything in Pro + unlimited Ask CLARIX, custom templates, priority support.",
  },
  // Sales-led / talk-to-sales tier — no self-serve Stripe price. Provisioned
  // bespoke; this is where the regulated Pro Verticals, EHR/FHIR, SSO, and CRM
  // live. Rendered as the "Talk to Sales" callout, never as a checkout card.
  ENTERPRISE: {
    id: "ENTERPRISE",
    name: "Enterprise",
    price: 0,
    meetingsPerMonth: null,
    exports: ["PDF", "DOCX", "CSV", "JSON", "EHR_HL7"],
    allMeetingTypes: true,
    askClarix: true,
    proVerticals: true,
    sso: true,
    customTemplates: true,
    autoJoinBot: true,
    foreverRetention: true,
    blurb: "Custom, sales-led: Pro Verticals, EHR/FHIR export, SSO/SAML, CRM, SLA & dedicated support.",
  },
};
