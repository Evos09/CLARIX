import Link from "next/link";
import { SectionHeading } from "@/components/site/section-heading";
import { Reveal } from "@/components/motion/Reveal";
import { meetingTypes } from "@/lib/site-data";
import { ArrowRight } from "lucide-react";

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

        <Reveal className="flex flex-wrap gap-2.5 mt-14">
          {meetingTypes.map((type) => (
            <span
              key={type.name}
              className="inline-flex items-center text-sm border border-foreground/15 rounded-full px-4 py-2 hover:border-foreground/40 hover:bg-foreground/[0.03] transition-colors"
            >
              {type.name}
            </span>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
