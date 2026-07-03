import Link from "next/link";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { PricingCards } from "@/components/site/pricing-cards";
import { ComparisonTable } from "@/components/pricing/comparison-table";
import { PricingFaq } from "@/components/pricing/pricing-faq";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "Pricing — CLARIX",
  description:
    "Simple, scalable pricing for CLARIX. Start free, then choose Starter, Pro, or Business — or talk to sales for Enterprise. Monthly and annual billing with two months free on annual.",
};

export default function PricingPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden noise-overlay">
      <SiteNav />

      <PageHero
        eyebrow="Pricing"
        title="Simple pricing that scales with your team"
        description="Start free and upgrade when you're ready. Every paid plan is billed per user, and annual billing gives you two months free."
      />

      {/* Plans */}
      <section className="py-16 lg:py-24">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <PricingCards />
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-16 lg:py-24 border-t border-foreground/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <SectionHeading
            eyebrow="Full comparison"
            title="Every feature, side by side"
            description="A complete look at what's included on each plan."
          />
          <div className="mt-12">
            <ComparisonTable />
          </div>
        </div>
      </section>

      {/* Enterprise callout */}
      <section className="py-16 lg:py-24 border-t border-foreground/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="rounded-2xl border border-foreground/10 bg-foreground text-background p-8 lg:p-14 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="text-xs font-mono uppercase tracking-widest text-background/50">Enterprise</span>
              <h2 className="font-display text-3xl lg:text-4xl mt-3 mb-4 text-balance">
                Need something custom?
              </h2>
              <p className="text-background/70 leading-relaxed text-pretty">
                For regulated industries, large rollouts, custom AI templates, and procurement, our team
                will tailor CLARIX to your security and compliance requirements, with SSO/SAML on the
                roadmap.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="bg-background text-foreground hover:bg-background/90 rounded-full h-14 px-8 text-base group shrink-0"
            >
              <Link href="/sign-up">
                Talk to Sales
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 lg:py-24 border-t border-foreground/10">
        <div className="max-w-3xl mx-auto px-6 lg:px-12">
          <SectionHeading eyebrow="FAQ" title="Questions, answered" align="center" />
          <div className="mt-12">
            <PricingFaq />
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
