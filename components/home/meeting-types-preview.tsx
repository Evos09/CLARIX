import Link from "next/link";
import { SectionHeading } from "@/components/site/section-heading";
import { meetingTypes, proVerticals } from "@/lib/site-data";
import { ArrowRight, Lock } from "lucide-react";

export function MeetingTypesPreview() {
  return (
    <section className="relative py-24 lg:py-32 border-t border-foreground/10">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <SectionHeading
            eyebrow="20+ meeting types"
            title={
              <>
                One assistant for
                <br />
                every kind of meeting
              </>
            }
            description="CLARIX knows the difference between a standup, a sales call, and a board meeting — and structures every brief accordingly."
          />
          <Link
            href="/meeting-types"
            className="inline-flex items-center gap-2 text-sm font-medium hover:text-brand transition-colors group shrink-0"
          >
            Explore all meeting types
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="flex flex-wrap gap-2.5 mt-14">
          {meetingTypes.map((type) => (
            <span
              key={type.name}
              className="inline-flex items-center text-sm border border-foreground/15 rounded-full px-4 py-2 hover:border-foreground/40 hover:bg-foreground/[0.03] transition-colors"
            >
              {type.name}
            </span>
          ))}
        </div>

        {/* Pro verticals */}
        <div className="mt-12 rounded-xl border border-foreground/10 bg-foreground text-background p-8 lg:p-10">
          <div className="flex items-center gap-2 mb-6 text-xs font-mono uppercase tracking-widest text-background/50">
            <Lock className="w-3.5 h-3.5" />
            Pro Verticals · Enterprise
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {proVerticals.map((v) => (
              <div key={v.name}>
                <h3 className="font-display text-xl mb-2">{v.name}</h3>
                <p className="text-sm text-background/60 leading-relaxed">{v.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
