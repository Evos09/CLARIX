const faqs = [
  { q: "Can I change plans anytime?", a: "Yes. Upgrade or downgrade at any time from your billing settings. Upgrades are prorated and take effect immediately; downgrades apply at the start of your next billing cycle." },
  { q: "What happens when I hit my meeting limit?", a: "On Free and Starter you'll be notified as you approach the monthly limit. Once you reach it you can wait until the next cycle or upgrade to Pro for unlimited meetings — your existing recordings always stay accessible." },
  { q: "Is there a free trial for paid plans?", a: "Every paid plan includes a 14-day trial with no credit card required. You'll get full access to Pro features like Ask CLARIX and integrations during the trial." },
  { q: "What is a Pro Vertical?", a: "Pro Verticals are domain-specific meeting types for regulated industries — Healthcare, Legal, and Financial Advisory. They use specialized prompts and output templates (SOAP-note structure, deposition timelines, suitability notes) and are available on the Enterprise plan (talk to sales)." },
  { q: "Does the meeting bot show up as a visible participant?", a: "Yes. When CLARIX auto-joins a Zoom, Google Meet, or Teams call it appears as a clearly labeled participant named CLARIX, so everyone knows it's present and recording. Auto-join is available on Starter and above." },
  { q: "Is my data secure?", a: "Your data is encrypted in transit and at rest, scoped to your workspace, and never used to train our models. CLARIX is an early-stage product and is not yet SOC 2 or HIPAA certified — see our Security page." },
  { q: "Can I use CLARIX for in-person meetings?", a: "Absolutely. Use in-browser recording to capture mic and room audio, or upload a recording afterward. CLARIX detects the meeting type and produces structured outputs just like it does for virtual calls." },
  { q: "How does billing work for teams with multiple seats?", a: "Paid plans are billed per user, per month. You can add or remove seats at any time, and annual billing gives you the equivalent of two months free across all seats." },
];

export function PricingFaq() {
  return (
    <div className="border-t border-foreground/10">
      {faqs.map((faq) => (
        <details key={faq.q} className="group border-b border-foreground/10 py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between text-base font-medium">
            {faq.q}
            <span className="ml-4 shrink-0 text-2xl leading-none text-muted-foreground transition-transform duration-200 group-open:rotate-45">+</span>
          </summary>
          <p className="mt-3 max-w-2xl pr-6 text-base leading-relaxed text-muted-foreground">{faq.a}</p>
        </details>
      ))}
    </div>
  );
}
