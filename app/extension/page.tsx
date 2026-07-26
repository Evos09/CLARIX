import type { Metadata } from "next";
import Link from "next/link";
import { Puzzle, Mic, Sparkles, ShieldCheck, ArrowRight, Check } from "lucide-react";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { PageHero } from "@/components/site/page-hero";
import { CtaBand } from "@/components/site/cta-band";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/Reveal";
import { CHROME_STORE_URL, EXTENSION_LIVE } from "@/lib/extension";

export const metadata: Metadata = {
  title: "Chrome Extension — CLARIX",
  description:
    "Record any meeting tab — Zoom, Google Meet, or Teams — straight from your browser. No bot joins the call. CLARIX transcribes it and writes notes shaped by the meeting type.",
};

const steps = [
  {
    icon: Puzzle,
    title: "Add it to Chrome",
    body: "Install from the Chrome Web Store and pin the CLARIX icon. Click it and connect your CLARIX account — no new password, it uses your existing sign-in.",
  },
  {
    icon: Mic,
    title: "Record the meeting tab",
    body: "Open your Zoom, Meet, or Teams call in a tab and hit Record. CLARIX captures the tab's audio — every participant, not just your mic. Nothing joins the call.",
  },
  {
    icon: Sparkles,
    title: "Get notes automatically",
    body: "Hit Stop and the recording uploads, transcribes, and turns into structured notes shaped by the meeting type. The finished meeting opens in CLARIX.",
  },
];

const points = [
  "Captures every participant's audio, not just your microphone",
  "No bot joins the call — nothing shows up in the participant list",
  "Works on Zoom, Google Meet, Microsoft Teams, and any tab with audio",
  "Uses your existing CLARIX sign-in — no separate account",
];

export default function ExtensionPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden noise-overlay">
      <SiteNav />

      <PageHero
        eyebrow="Chrome Extension"
        title="Record any meeting, right from your browser"
        description="CLARIX for Chrome captures the audio of any meeting tab — Zoom, Google Meet, Teams — and turns it into structured notes. No bot joins the call."
      >
        <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {EXTENSION_LIVE ? (
            <Button
              asChild
              size="lg"
              className="bg-accent hover:bg-accent/90 text-background px-8 h-14 text-base rounded-full group"
            >
              <a href={CHROME_STORE_URL} target="_blank" rel="noopener noreferrer">
                <Puzzle className="w-5 h-5 mr-1" />
                Add to Chrome
                <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-foreground/[0.03] px-6 h-14 text-base text-muted-foreground">
                <Puzzle className="w-5 h-5" />
                Coming soon to the Chrome Web Store
              </span>
              <span className="text-sm text-muted-foreground/80">
                In review. In the meantime,{" "}
                <Link href="/sign-up" className="text-accent underline">
                  start free on the web
                </Link>{" "}
                — record, upload, or send a bot to your call.
              </span>
            </div>
          )}
        </div>
      </PageHero>

      {/* How it works */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 py-20 lg:py-28">
        <Reveal>
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
            <span className="w-8 h-px bg-foreground/30" />
            How it works
          </span>
          <h2 className="font-display text-4xl md:text-5xl tracking-tight text-balance max-w-2xl mb-16">
            Three clicks from call to notes
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 100}>
              <div className="relative">
                <div className="flex items-center gap-4 mb-5">
                  <span className="grid place-items-center w-12 h-12 rounded-xl bg-accent/10 text-accent">
                    <step.icon className="w-6 h-6" />
                  </span>
                  <span className="font-mono text-sm text-muted-foreground">0{i + 1}</span>
                </div>
                <h3 className="font-display text-xl tracking-tight mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Why the extension */}
      <section className="border-t border-foreground/10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-20 lg:py-28 grid lg:grid-cols-2 gap-16 items-center">
          <Reveal>
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
              <span className="w-8 h-px bg-foreground/30" />
              Why browser-native
            </span>
            <h2 className="font-display text-4xl md:text-5xl tracking-tight text-balance mb-6">
              The meeting stays private to the room
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Most AI notetakers send a bot that shows up in the call and asks everyone to consent to
              a stranger in the room. CLARIX for Chrome records the tab you're already in — quietly,
              on your side, with nothing to explain to the other participants.
            </p>
            <ul className="space-y-4">
              {points.map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <span className="mt-1 grid place-items-center w-5 h-5 rounded-full bg-accent/15 text-accent shrink-0">
                    <Check className="w-3 h-3" />
                  </span>
                  <span className="text-muted-foreground leading-relaxed">{p}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={100}>
            <div className="relative rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-8 lg:p-10">
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="w-6 h-6 text-accent" />
                <span className="font-display text-lg">Your data, handled honestly</span>
              </div>
              <ul className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <li>The extension only records when you press Record — never in the background.</li>
                <li>Audio goes straight to your CLARIX workspace over an encrypted connection.</li>
                <li>Recordings and transcripts are never used to train AI models.</li>
                <li>You can delete any meeting, or your whole account, at any time.</li>
              </ul>
              <Link
                href="/extension/privacy"
                className="inline-flex items-center gap-1 text-sm text-accent underline mt-6"
              >
                Read the extension privacy notice
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <CtaBand
        title="Notes for every call, without the bot"
        description="Start free on the web today. The Chrome extension is on the way — same account, same notes, fewer clicks."
        primary={{ label: "Start Free", href: "/sign-up" }}
        secondary={{ label: "See Features", href: "/features" }}
      />
      <SiteFooter />
    </main>
  );
}
