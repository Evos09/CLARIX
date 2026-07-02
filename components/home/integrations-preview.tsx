import Link from "next/link";
import { SectionHeading } from "@/components/site/section-heading";
import { Reveal } from "@/components/motion/Reveal";
import { integrations } from "@/lib/site-data";
import { ArrowRight, Plus } from "lucide-react";

export function IntegrationsPreview() {
  return (
    <section className="relative py-24 lg:py-32 border-t border-foreground/10">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <SectionHeading
            eyebrow="Integrations"
            title="Plays nicely with everything you already use"
            description="CLARIX joins your existing meeting tools, then pushes structured outputs into your team's workflow. No new tabs to check."
          />
          <Link
            href="/integrations"
            className="inline-flex items-center gap-2 text-sm font-medium hover:text-brand transition-colors group shrink-0"
          >
            See all integrations
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <Reveal className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-foreground/10 border border-foreground/10 mt-14 rounded-xl overflow-hidden">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="bg-background p-6 flex items-center gap-3 hover:bg-foreground/[0.02] transition-colors"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-foreground/10 bg-white p-[7px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={integration.logo} alt="" className="h-full w-full object-contain" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{integration.name}</p>
                <p className="text-xs text-muted-foreground">{integration.category}{integration.soon ? " · Coming soon" : ""}</p>
              </div>
            </div>
          ))}
          <Link
            href="/integrations"
            className="group bg-background p-6 flex items-center gap-3 hover:bg-foreground/[0.02] transition-colors"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-dashed border-foreground/25 text-muted-foreground">
              <Plus className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium">More on the way</p>
              <p className="text-xs text-muted-foreground group-hover:text-brand transition-colors">See all integrations</p>
            </div>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
