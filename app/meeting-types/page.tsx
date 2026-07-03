import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { CtaBand } from "@/components/site/cta-band";
import { MeetingExplorer } from "@/components/meeting-types/meeting-explorer";
import { proVerticals } from "@/lib/site-data";
import { Lock } from "lucide-react";

export const metadata = {
  title: "Meeting Types — CLARIX",
  description:
    "CLARIX handles 20+ meeting types — from sales calls to standups to board meetings — plus compliance-aware Pro Verticals for healthcare, legal, and financial teams.",
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

      {/* Pro verticals */}
      <section className="py-16 lg:py-24 border-t border-foreground/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-brand mb-6">
            <Lock className="w-3.5 h-3.5" />
            Pro Verticals · Business · Built for regulated industries
          </div>
          <SectionHeading
            eyebrow="Specialized"
            title="Compliance-aware meeting types"
            description="Three premium meeting types built for regulated industries, available on the Business plan."
          />

          <div className="grid md:grid-cols-3 gap-px bg-foreground/10 border border-foreground/10 mt-12 rounded-xl overflow-hidden">
            {proVerticals.map((v) => (
              <div key={v.name} className="bg-background p-8">
                <h3 className="font-display text-2xl mb-2">{v.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">{v.summary}</p>
                <ul className="space-y-2.5">
                  {v.extracts.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-foreground/80">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
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
