import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { hasClerk } from "@/lib/auth";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { CtaBand } from "@/components/site/cta-band";
import { HomeHero } from "@/components/home/home-hero";
import { FeatureHighlights } from "@/components/home/feature-highlights";
import { MeetingTypesPreview } from "@/components/home/meeting-types-preview";
import { HowItWorks } from "@/components/home/how-it-works";
import { IntegrationsPreview } from "@/components/home/integrations-preview";
import { PricingPreview } from "@/components/home/pricing-preview";

export const metadata: Metadata = {
  title: { absolute: "CLARIX — Your AI Assistant for Every Meeting" },
  description: "The AI that handles every meeting you never have time to recap. Transcribe, summarize, and turn any meeting into action.",
};

export default async function Home() {
  if (hasClerk) {
    const { userId } = await auth();
    if (userId) redirect("/dashboard");
  }
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <SiteNav />
      <HomeHero />
      <FeatureHighlights />
      <MeetingTypesPreview />
      <HowItWorks />
      <IntegrationsPreview />
      <PricingPreview />
      <CtaBand />
      <SiteFooter />
    </main>
  );
}
