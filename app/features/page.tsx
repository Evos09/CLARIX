import Link from "next/link";
import { Globe, Monitor, Apple, ArrowRight } from "lucide-react";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { PageHero } from "@/components/site/page-hero";
import { CtaBand } from "@/components/site/cta-band";
import { Reveal } from "@/components/motion/Reveal";
import { FeatureBlock } from "@/components/features/feature-block";
import {
  TranscriptionVisual,
  OutputsVisual,
  AskClarixVisual,
  RecordingVisual,
  AudioLibraryVisual,
  IntegrationsVisual,
  AnalyticsVisual,
} from "@/components/features/visuals";

export const metadata = {
  title: "Features — CLARIX",
  description:
    "Transcription, structured outputs, Clarix Chat, recording and bot capture, audio library, integrations, and analytics.",
};

const blocks = [
  {
    eyebrow: "Transcription",
    title: "AI transcription that detects the meeting type",
    description:
      "CLARIX transcribes meetings with speaker labels and automatically figures out what type of meeting it is from the first few minutes — no manual configuration, ever.",
    bullets: ["Speaker-labeled transcripts", "Automatic meeting-type detection", "Zero setup required"],
    visual: <TranscriptionVisual />,
  },
  {
    eyebrow: "Structured outputs",
    title: "Outputs shaped to the meeting",
    description:
      "Every meeting type produces a tailored output. A standup surfaces blockers and who did what; a sales call surfaces objections, deal stage, and next steps. Same engine, different lens.",
    bullets: ["Tailored to 20+ meeting types", "Decisions, action items, and summaries", "Owners and due dates extracted"],
    visual: <OutputsVisual />,
  },
  {
    eyebrow: "Ask CLARIX",
    title: "Chat with any past meeting",
    description:
      "A chat interface tied to a specific meeting. Ask “Who owns the Q3 deliverable?” or “Write a follow-up email based on this meeting” and get an answer streamed back in real time, grounded in that meeting's transcript.",
    bullets: ["Answers grounded in the transcript", "Draft follow-ups and recaps", "Real-time streaming responses"],
    visual: <AskClarixVisual />,
  },
  {
    eyebrow: "Capture",
    title: "Three ways to capture a meeting",
    description:
      "Record directly in-browser with mic and system audio, upload any audio or video file, or send a CLARIX bot to automatically join your Zoom, Google Meet, or Microsoft Teams call.",
    bullets: ["In-browser recording", "File upload", "Auto-join meeting bot"],
    visual: <RecordingVisual />,
  },
  {
    eyebrow: "Audio library",
    title: "Every recording, saved and searchable",
    description:
      "All past recordings are stored and searchable. Replay any meeting, jump to a moment, or reprocess a recording with a different meeting type if CLARIX should look at it through a new lens.",
    bullets: ["Searchable archive", "Replay any meeting", "Reprocess with a different type"],
    visual: <AudioLibraryVisual />,
  },
  {
    eyebrow: "Integrations",
    title: "Connected to the tools teams already use",
    description:
      "CLARIX links to your calendar to see upcoming meetings and attach recordings, sends summaries by email, posts recaps to Slack, creates Notion pages, and turns action items into Linear issues — plus outbound webhooks to wire it into Zapier, Make, or your own stack.",
    bullets: ["Calendar, email & outbound webhooks", "Slack, Notion & Linear push"],
    visual: <IntegrationsVisual />,
  },
  {
    eyebrow: "Analytics",
    title: "Insight into how your team meets",
    description:
      "Speaker talk-time breakdowns, sentiment over time, engagement scoring, and filler-word tracking per meeting — plus an org-wide analytics dashboard to spot trends across the team.",
    bullets: ["Talk-time & engagement scoring", "Sentiment over time", "Org-wide dashboard"],
    visual: <AnalyticsVisual />,
  },
];

export default function FeaturesPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden noise-overlay">
      <SiteNav />
      <PageHero
        eyebrow="Features"
        title="Everything you need after the meeting ends"
        description="CLARIX does the work that used to fall through the cracks — capturing the conversation, understanding it, and turning it into something your team can act on."
      />

      <section className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {blocks.map((block, i) => (
          <FeatureBlock key={block.title} index={i + 1} flip={i % 2 === 1} {...block} />
        ))}
      </section>

      {/* Platforms — desktop apps + web */}
      <section className="border-t border-foreground/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-20 lg:py-28">
          <Reveal>
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
              <span className="w-8 h-px bg-foreground/30" />
              Everywhere you work
            </span>
            <h2 className="font-display text-4xl md:text-5xl tracking-tight text-balance max-w-2xl mb-6">
              Use CLARIX wherever your meetings happen
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mb-14">
              Beyond the web app: run CLARIX as a native desktop app on Windows and macOS,
              with a floating overlay that records and answers from your meeting history.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: Monitor,
                title: "Windows App",
                desc: "The full CLARIX app in a native window, with a tray icon, global shortcut, and the floating overlay.",
                href: "/download",
                cta: "Download",
              },
              {
                icon: Apple,
                title: "macOS App",
                desc: "Native desktop app for Intel and Apple Silicon Macs.",
                href: "/download",
                cta: "Download",
              },
              {
                icon: Globe,
                title: "Web App",
                desc: "Upload or record in the browser — nothing to install, works on any machine.",
                href: "/sign-up",
                cta: "Open CLARIX",
              },
            ].map((p, i) => (
              <Reveal key={p.title} delay={i * 100}>
                <Link
                  href={p.href}
                  className="group block h-full rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-8 transition-colors hover:bg-foreground/[0.04]"
                >
                  <span className="grid place-items-center w-12 h-12 rounded-xl bg-accent/10 text-accent mb-6">
                    <p.icon className="w-6 h-6" />
                  </span>
                  <h3 className="font-display text-xl tracking-tight mb-2">{p.title}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-5">{p.desc}</p>
                  <span className="inline-flex items-center gap-1 text-sm text-accent">
                    {p.cta}
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title="See it on your own meetings"
        description="Start free and watch CLARIX turn your next call into structured, shareable output."
        primary={{ label: "Start Free", href: "/sign-up" }}
        secondary={{ label: "See Pricing", href: "/pricing" }}
      />
      <SiteFooter />
    </main>
  );
}
