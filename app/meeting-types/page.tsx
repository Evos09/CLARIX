import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { CtaBand } from "@/components/site/cta-band";
import { MeetingExplorer } from "@/components/meeting-types/meeting-explorer";

export const metadata = {
  title: "Meeting Types — CLARIX",
  description:
    "CLARIX handles 20+ meeting types — from sales calls to standups to board meetings — detecting each format automatically and extracting exactly what matters.",
};

export default function MeetingTypesPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden noise-overlay">
      <SiteNav />

      <PageHero
        eyebrow="Meeting types"
        title="An assistant for every kind of meeting"
        description="CLARIX isn't built for one narrow use case. It detects the meeting type automatically and extracts exactly what matters for that format — explore what it produces for each."
      />

      {/* Directory */}
      <section className="py-16 lg:py-24">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <SectionHeading
            eyebrow="Browse the directory"
            title="Pick a meeting type to see what CLARIX delivers"
          />
          <div className="mt-12">
            <MeetingExplorer />
          </div>
        </div>
      </section>

      <CtaBand
        title="Try any meeting type free"
        description="Record your next meeting and let CLARIX detect the type and structure the output automatically."
        primary={{ label: "Try any meeting type free", href: "/sign-up" }}
        secondary={{ label: "See Pricing", href: "/pricing" }}
      />
      <SiteFooter />
    </main>
  );
}
