import Link from "next/link";
import { SectionHeading } from "@/components/site/section-heading";
import { integrations } from "@/lib/site-data";
import { ArrowRight } from "lucide-react";

export function IntegrationsPreview() {
  return (
    <section className="relative py-24 lg:py-32 border-t border-foreground/10">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <SectionHeading
            eyebrow="Integrations"
            title="Fits the tools you already use"
            description="Connect your conferencing, calendar, email, workspace, and CRM — and let CLARIX keep them all in sync."
          />
          <Link
            href="/integrations"
            className="inline-flex items-center gap-2 text-sm font-medium hover:text-brand transition-colors group shrink-0"
          >
            See all integrations
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-foreground/10 border border-foreground/10 mt-14 rounded-xl overflow-hidden">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="bg-background p-6 flex items-center gap-3 hover:bg-foreground/[0.02] transition-colors"
            >
              <span className="grid place-items-center w-9 h-9 rounded-md border border-foreground/10 font-display text-sm">
                {integration.name.charAt(0)}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{integration.name}</p>
                <p className="text-xs text-muted-foreground">{integration.category}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
