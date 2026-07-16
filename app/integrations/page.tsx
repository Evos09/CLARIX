import { Fragment } from "react";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { CtaBand } from "@/components/site/cta-band";
import { integrations, type Integration } from "@/lib/site-data";
import { Bot, MessageSquare, FileText } from "lucide-react";

export const metadata = {
  title: "Integrations — CLARIX",
  description:
    "CLARIX connects to Zoom, Google Meet, Teams, Google Calendar, Gmail, and Notion — with Slack and Linear on the way.",
};

const categories: Integration["category"][] = ["Conferencing", "Calendar", "Email", "Workspace"];

const explainers = [
  {
    icon: Bot,
    title: "The meeting bot",
    tools: "Zoom · Google Meet · Microsoft Teams",
    body: "Connect your conferencing tools and a clearly labeled CLARIX bot joins your scheduled calls automatically. It records and transcribes in real time, so you never have to remember to hit record — and the structured summary is waiting the moment the call ends.",
  },
  {
    icon: MessageSquare,
    title: "Slack",
    tools: "Channels · DMs · Coming soon",
    body: "Pipe meeting summaries and action items straight into Slack. Post recaps to a team channel automatically after every meeting, or send them as a DM to the right owner so follow-ups land where work already happens.",
  },
  {
    icon: FileText,
    title: "Notion",
    tools: "Workspace pages",
    body: "CLARIX creates a structured Notion page for each meeting — complete with the summary, decisions, and action items — in the workspace and database you choose. Your meeting notes become a searchable, linked part of your knowledge base.",
  },
];

export default function IntegrationsPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden noise-overlay">
      <SiteNav />

      <PageHero
        eyebrow="Integrations"
        title="CLARIX works with the tools you already use"
        description="Connect your conferencing, calendar, email, and workspace tools — then let CLARIX capture meetings and keep everything in sync, automatically."
      />

      {/* Grid by category */}
      <section className="py-16 lg:py-24">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 space-y-16">
          {categories.map((category) => (
            <div key={category}>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs font-mono uppercase tracking-widest text-brand">{category}</span>
                <span className="flex-1 h-px bg-foreground/10" />
              </div>
              <div className="grid gap-px bg-foreground/10 border border-foreground/10 rounded-xl overflow-hidden sm:grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
                {integrations
                  .filter((i) => i.category === category)
                  .map((integration) => (
                    <div
                      key={integration.name}
                      className="bg-background p-7 hover:bg-foreground/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-foreground/10 bg-white p-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={integration.logo} alt="" className="h-full w-full object-contain" />
                        </span>
                        <h3 className="font-display text-xl">{integration.name}</h3>
                        {integration.soon && (
                          <span className="rounded-full border border-accent/30 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">
                            Coming soon
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {integration.description}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Deeper explainers */}
      <section className="py-16 lg:py-24 border-t border-foreground/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <SectionHeading
            eyebrow="How it works"
            title="A closer look at the integrations that matter most"
          />

          <div className="grid md:grid-cols-2 gap-px bg-foreground/10 border border-foreground/10 mt-12 rounded-xl overflow-hidden">
            {explainers.map((e) => (
              <div key={e.title} className="bg-background p-8 lg:p-10">
                <span className="grid place-items-center w-12 h-12 rounded-lg border border-foreground/10 mb-6">
                  <e.icon className="w-5 h-5" />
                </span>
                <h3 className="font-display text-2xl mb-1">{e.title}</h3>
                <p className="text-xs font-mono text-muted-foreground mb-4">{e.tools}</p>
                <p className="text-muted-foreground leading-relaxed text-pretty">{e.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title="Connect your tools in minutes"
        description="Sign up free, link your stack, and let CLARIX handle the busywork after every meeting."
        primary={{ label: "Start Free", href: "/sign-up" }}
        secondary={{ label: "View Features", href: "/features" }}
      />
      <SiteFooter />
    </main>
  );
}
