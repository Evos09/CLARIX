import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { PricingCards } from "@/components/site/pricing-cards";
import { ComparisonTable } from "@/components/pricing/comparison-table";
import { PricingFaq } from "@/components/pricing/pricing-faq";

export const metadata = {
  title: "Pricing",
  description:
    "Simple, scalable pricing for CLARIX. Start free, then choose Starter, Pro, or Business. Monthly and annual billing available.",
};

export default function PricingPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden noise-overlay">
      <SiteNav />

      <PageHero
        eyebrow="Pricing"
        title="Simple pricing that scales with your team"
        description="Every plan can ask across your whole meeting history — Free includes 10 questions a month, no card required. Paid plans raise the limit and are billed per user, monthly or annually."
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
