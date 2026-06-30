import Link from "next/link";
import { SectionHeading } from "@/components/site/section-heading";
import { PricingCards } from "@/components/site/pricing-cards";
import { ArrowRight } from "lucide-react";

export function PricingPreview() {
  return (
    <section className="relative py-24 lg:py-32 border-t border-foreground/10">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
          <SectionHeading
            eyebrow="Pricing"
            title="Simple plans that scale with you"
            description="Start free. Upgrade when your team is ready. Annual billing saves you two months."
          />
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-sm font-medium hover:text-brand transition-colors group shrink-0"
          >
            Compare full pricing
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <PricingCards />
      </div>
    </section>
  );
}
