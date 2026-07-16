"use client";

import React, { useState } from "react";
import { Sparkles, Check, ArrowRight } from "lucide-react";

// Prices and features mirror lib/stripe.ts (PLANS) — keep in sync.
const PLANS = [
  {
    name: "Free",
    desc: "For trying CLARIX on your own meetings.",
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      "10 meetings / month",
      "General meeting type",
      "AI summary + action items",
      "PDF export",
      "Record in-browser or upload audio",
    ],
    cta: "Start Free",
    href: "/sign-up",
    accent: false,
  },
  {
    name: "Starter",
    desc: "For individuals who meet often.",
    monthlyPrice: 15,
    annualPrice: 13,
    features: [
      "20 meetings / month",
      "All general meeting types",
      "PDF, DOCX & CSV export",
      "25 Clarix Chat messages / mo",
      "Calendar auto-join bot",
      "Audio library kept forever",
    ],
    cta: "Start 14-day trial",
    href: "/sign-up",
    accent: false,
  },
  {
    name: "Pro",
    desc: "For teams that run on meetings.",
    monthlyPrice: 30,
    annualPrice: 25,
    features: [
      "Unlimited meetings",
      "All general meeting types",
      "PDF, DOCX, CSV & JSON export",
      "Ask CLARIX on every meeting",
      "100 Clarix Chat messages / mo",
      "Calendar auto-join bot",
    ],
    cta: "Start 14-day trial",
    href: "/sign-up",
    accent: true,
  },
  {
    name: "Business",
    desc: "For power users who want the full toolkit.",
    monthlyPrice: 59,
    annualPrice: 50,
    features: [
      "Everything in Pro",
      "Unlimited Clarix Chat",
      "Custom AI templates",
      "Email support",
    ],
    cta: "Start 14-day trial",
    href: "/sign-up",
    accent: false,
  },
];

export default function PricingCore() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");

  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center bg-transparent text-gray-900 px-6 lg:px-12 py-20 overflow-hidden">
      <div className="zone-bg-layer absolute inset-0 pointer-events-none z-0 opacity-20 flex items-center justify-center">
        <div className="absolute inset-0 cyber-matrix-grid opacity-25" />
        <div className="absolute inset-0 cyber-data-stream opacity-30" />
      </div>

      {/* Foreground Content */}
      <div className="zone-fg-content relative w-full max-w-7xl mx-auto flex flex-col items-center z-20">
        <div className="text-center max-w-2xl mb-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-200 bg-violet-100/60 text-xs font-mono text-violet-700 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            06 · PRICING
          </span>
          <h2 className="font-display text-5xl md:text-6xl font-normal leading-[1.08] tracking-tight mb-4">
            Simple pricing. <span className="italic text-violet-600 font-serif">Scales with</span> your team.
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            Start free. Upgrade when you need more meetings, more exports, or more Clarix Chat.{" "}
            <a href="/pricing" className="text-violet-600 hover:text-violet-700 font-semibold whitespace-nowrap">
              Compare full pricing →
            </a>
          </p>

          {/* Billing Switcher Toggle */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-4 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer select-none ${
                billingPeriod === "monthly"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-violet-50 text-violet-600 hover:bg-violet-100 border border-violet-200"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("annual")}
              className={`px-4 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer select-none ${
                billingPeriod === "annual"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-violet-50 text-violet-600 hover:bg-violet-100 border border-violet-200"
              }`}
            >
              Annual
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
          {PLANS.map((plan) => {
            const price = billingPeriod === "monthly" ? plan.monthlyPrice : plan.annualPrice;
            return (
              <div
                key={plan.name}
                className={`p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 shadow-md border ${
                  plan.accent
                    ? "bg-violet-600 text-white border-violet-700 shadow-xl scale-[1.02] relative"
                    : "bg-white/80 text-gray-900 border-violet-100 backdrop-blur-md"
                } hover:scale-[1.03]`}
              >
                {plan.accent && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white font-mono text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm select-none">
                    Most Popular
                  </span>
                )}
                <div>
                  <div className="mb-6">
                    <h3 className={`text-base font-bold font-display ${plan.accent ? "text-white" : "text-violet-700"}`}>
                      {plan.name}
                    </h3>
                    <p className={`text-xs mt-2 leading-relaxed min-h-[36px] ${plan.accent ? "text-violet-100" : "text-gray-600"}`}>
                      {plan.desc}
                    </p>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="font-display text-4xl font-semibold">${price}</span>
                      <span className={`text-[10px] font-mono uppercase tracking-wider ${plan.accent ? "text-violet-200" : "text-gray-500"}`}>
                        {plan.monthlyPrice === 0 ? "/ month" : "/ user / mo"}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-2.5 border-t border-dashed py-5 border-violet-100/20 text-xs">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${plan.accent ? "text-white" : "text-violet-600"}`} />
                        <span className={plan.accent ? "text-white" : "text-gray-700"}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href={plan.href}
                  className={`block w-full py-2.5 mt-4 rounded-xl text-center text-xs font-semibold shadow-sm transition-all cursor-pointer select-none ${
                    plan.accent
                      ? "bg-white hover:bg-violet-50 text-violet-800"
                      : "bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200"
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            );
          })}
        </div>

        {/* Enterprise — sales-led, no self-serve price */}
        <div className="mt-6 w-full max-w-6xl rounded-2xl border border-violet-100 bg-white/80 backdrop-blur-md shadow-md px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold font-display text-violet-700">Enterprise</h3>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Custom, sales-led. Pro vertical types (healthcare, legal, financial), EHR/HL7 export, SSO/SAML, SLA &amp; dedicated support.
            </p>
          </div>
          <a
            href="/contact"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-violet-50 hover:bg-violet-100 border border-violet-200 px-5 py-2.5 text-xs font-semibold text-violet-700 transition-all"
          >
            Talk to Sales
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
