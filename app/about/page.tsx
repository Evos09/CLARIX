import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { PageHero } from "@/components/site/page-hero";
import { CtaBand } from "@/components/site/cta-band";

export const metadata = {
  title: "About",
  description:
    "Why CLARIX exists: turning the hours you spend in meetings into structured, actionable records — automatically and honestly.",
};

export default function AboutPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden noise-overlay">
      <SiteNav />

      <PageHero
        eyebrow="About"
        title="Why CLARIX exists"
        description="Professionals spend upwards of 23 hours a week in meetings — and most of what's said is forgotten by Friday."
      />

      <section className="py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-6 lg:px-12 space-y-8 text-lg leading-relaxed text-muted-foreground">
          <p>
            Every meeting produces decisions, commitments, and context that teams need later — and
            almost none of it gets written down well. Notes are rushed, action items get lost, and
            the person who remembers &ldquo;what we agreed&rdquo; eventually leaves the room for good. CLARIX
            was built to fix that: it joins, records, or ingests your meetings and turns each one
            into a clean, structured brief — summary, decisions, action items — shaped to the kind
            of meeting it actually was.
          </p>
          <p>
            CLARIX is an early-stage, independent product, and we build it with a simple set of
            rules. The notetaker is always a visible participant — never hidden. Your recordings
            and transcripts stay scoped to your workspace and are never used to train AI models.
            And we only advertise what actually works today — anything still in progress is
            labeled &ldquo;coming soon,&rdquo; not sold as finished. If that sounds like the kind of tool you
            want in your meetings, we&rsquo;d love to have you try it.
          </p>
        </div>
      </section>

      <CtaBand
        title="See what CLARIX does with your next meeting"
        description="Start free — 10 meetings a month, no credit card."
        primary={{ label: "Start Free", href: "/sign-up" }}
        secondary={{ label: "Contact us", href: "/contact" }}
      />
      <SiteFooter />
    </main>
  );
}
