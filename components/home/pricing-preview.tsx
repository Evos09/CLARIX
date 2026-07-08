import Link from "next/link";
import { SectionHeading } from "@/components/site/section-heading";
import { Reveal } from "@/components/motion/Reveal";
import { PricingCards } from "@/components/site/pricing-cards";
import { ArrowRight } from "lucide-react";

export function PricingPreview() {
  return (
    <section className="relative py-24 lg:py-32 border-t border-foreground/10">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
          <SectionHeading
            eyebrow="Pricing"
            title="Simple pricing. Scales with your team."
            description="Start free. Upgrade when you need more meetings, more integrations, or more Clarix Chat."
          />
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-sm font-medium hover:text-brand transition-colors group shrink-0"
          >
            Compare full pricing
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <Reveal delay={100}>
          <PricingCards />
        </Reveal>
      </div>
    </section>
  );
}
