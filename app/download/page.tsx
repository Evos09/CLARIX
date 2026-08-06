import type { Metadata } from "next";
import Link from "next/link";
import { Monitor, Apple, Download, Layers, Mic, Search, Move } from "lucide-react";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { PageHero } from "@/components/site/page-hero";
import { CtaBand } from "@/components/site/cta-band";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/Reveal";
import { FREE_OVERLAY_ASKS } from "@/lib/plan";
import {
  WINDOWS_DOWNLOAD_URL,
  MAC_DOWNLOAD_URL,
  WINDOWS_LIVE,
  MAC_LIVE,
  WINDOWS_VERSION,
  MAC_VERSION,
  WINDOWS_HAS_OVERLAY,
  MAC_HAS_OVERLAY,
} from "@/lib/downloads";

export const metadata: Metadata = {
  title: "Download — CLARIX Desktop",
  description:
    "Get the CLARIX desktop app for Windows. Includes the floating overlay: record a meeting and ask your past meetings anything, without leaving the call. macOS coming soon.",
};

/** The overlay is desktop-only, and the reason most people install the app. */
const overlayFeatures = [
  {
    icon: Search,
    title: "Ask mid-meeting",
    desc: "“What did we promise them last quarter?” — answered from your own past meetings, with links straight to the moment it was said.",
  },
  {
    icon: Mic,
    title: "Record from the overlay",
    desc: "One click starts recording the call. It transcribes and lands in your meetings like any other recording.",
  },
  {
    icon: Layers,
    title: "Glass or transparent",
    desc: "Keep the frosted panel, or switch to transparent so only the words float over your screen — no panel, no borders.",
  },
  {
    icon: Move,
    title: "Yours to place",
    desc: "Drag it anywhere, resize from any edge, or collapse it to just the bar. It stays on top of whatever you're in.",
  },
];

type Platform = {
  os: "Windows" | "macOS";
  icon: typeof Monitor;
  live: boolean;
  url: string;
  note: string;
  version: string;
  hasOverlay: boolean;
  /** Shown instead of the version line when the platform isn't offered yet. */
  pendingNote?: string;
};

const platforms: Platform[] = [
  {
    os: "Windows",
    icon: Monitor,
    live: WINDOWS_LIVE,
    url: WINDOWS_DOWNLOAD_URL,
    note: "Windows 10 or 11 (64-bit).",
    version: WINDOWS_VERSION,
    hasOverlay: WINDOWS_HAS_OVERLAY,
  },
  {
    os: "macOS",
    icon: Apple,
    live: MAC_LIVE,
    url: MAC_DOWNLOAD_URL,
    note: "macOS 12+ (Intel & Apple Silicon).",
    version: MAC_VERSION,
    hasOverlay: MAC_HAS_OVERLAY,
    pendingNote: "Built and working — waiting on Apple code signing",
  },
];

export default function DownloadPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden noise-overlay">
      <SiteNav />

      <PageHero
        eyebrow="Desktop App"
        title="CLARIX on your desktop"
        description="The full CLARIX app in its own native window — plus the floating overlay: record the call and ask your past meetings anything, without ever leaving the meeting."
      />

      <section className="max-w-[1100px] mx-auto px-6 lg:px-12 py-16 lg:py-24">
        {/* Beta notice */}
        <Reveal>
          <div className="mb-10 rounded-2xl border border-accent/25 bg-accent/[0.06] p-5 lg:p-6 text-sm leading-relaxed">
            <p className="text-foreground font-medium mb-1">
              The desktop app is in beta, and Windows-only for now.
            </p>
            <p className="text-muted-foreground">
              The Windows app is new and still being polished — you may hit rough edges. It keeps
              itself up to date, so fixes reach you without another download. The macOS build is
              finished and working, but it isn&apos;t code-signed yet, and we&apos;re not asking
              anyone to click past a security warning to install something that listens to their
              meetings — so it stays off this page until that&apos;s sorted. Your meetings and data
              are safe either way (they live in your CLARIX account, same as the web). Run into any
              problems?{" "}
              <Link href="/contact" className="text-accent underline underline-offset-2">
                Contact support
              </Link>{" "}
              and we&apos;ll help.
            </p>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
          {platforms.map((p, i) => (
            <Reveal key={p.os} delay={i * 100}>
              <div className="h-full rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-8 flex flex-col">
                <span className="grid place-items-center w-12 h-12 rounded-xl bg-accent/10 text-accent mb-6">
                  <p.icon className="w-6 h-6" />
                </span>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-display text-2xl tracking-tight">{p.os}</h2>
                  <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider text-accent">
                    Beta
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{p.note}</p>
                <p className="text-xs font-mono text-muted-foreground mb-6">
                  {p.live ? (
                    <>
                      Version {p.version}
                      {p.hasOverlay ? (
                        <span className="text-accent"> · includes the overlay</span>
                      ) : (
                        <span> · overlay not in this build yet</span>
                      )}
                      <span> · updates itself</span>
                    </>
                  ) : (
                    // Never show a version for something nobody can download.
                    <span>{p.pendingNote}</span>
                  )}
                </p>

                <div className="mt-auto">
                  {p.live ? (
                    <Button
                      asChild
                      size="lg"
                      className="w-full bg-accent hover:bg-accent/90 text-background h-13 text-base rounded-full"
                    >
                      <a href={p.url} download>
                        <Download className="w-5 h-5 mr-1" />
                        Download for {p.os}
                      </a>
                    </Button>
                  ) : (
                    <span className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-foreground/15 bg-foreground/[0.03] h-13 text-base text-muted-foreground">
                      Coming soon
                    </span>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* The overlay — the reason to install rather than use the web app */}
        <Reveal delay={150}>
          <div className="mt-16 rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-8 lg:p-10">
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-5">
              <span className="w-8 h-px bg-foreground/30" />
              Desktop only
            </span>
            <h2 className="font-display text-3xl md:text-4xl tracking-tight text-balance max-w-2xl mb-4">
              The overlay floats over your meeting
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-2xl mb-10">
              A small always-on-top window that sits above Zoom, Meet, Teams — anything. Ask it a
              question and it answers from your own meeting history, and it can record the call
              you&apos;re on. It never captures your screen, and it only ever reads meetings in your
              own workspace.
            </p>

            <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
              {overlayFeatures.map((f) => (
                <div key={f.title} className="flex gap-4">
                  <span className="grid place-items-center shrink-0 w-10 h-10 rounded-xl bg-accent/10 text-accent">
                    <f.icon className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-medium mb-1">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-10 text-sm text-muted-foreground">
              <span className="text-foreground">
                Free accounts get {FREE_OVERLAY_ASKS} overlay questions a month
              </span>{" "}
              — enough to try it in a couple of real meetings. Paid plans raise the limit and add
              live surfacing, where the overlay pulls up relevant moments on its own without being
              asked —{" "}
              <Link href="/pricing" className="text-accent underline underline-offset-2">
                see plans
              </Link>
              . The desktop app itself is free to download and use with any account.
            </p>
          </div>
        </Reveal>

        {/* Honest install notes */}
        <Reveal delay={200}>
          <div className="mt-12 rounded-2xl border border-foreground/10 p-6 lg:p-8 text-sm text-muted-foreground leading-relaxed">
            <p className="text-foreground font-medium mb-3">Before you install</p>
            <ul className="space-y-2 list-disc pl-5">
              <li>
                The app is a native window around clarixmeetings.com — sign in with your normal CLARIX
                account and every feature works just like the web. The overlay is the one thing the
                web app can&apos;t do, since only a desktop app can float above other windows.
              </li>
              <li>
                <span className="text-foreground">You only install once.</span> New versions download
                quietly in the background and install the next time you open CLARIX — never in the
                middle of a meeting, and never a download to go hunt for.
              </li>
              <li>
                Recording from the overlay uses your microphone. Everyone in the meeting must know
                they&apos;re being recorded — in many places that&apos;s the law, not a courtesy.
              </li>
              <li>
                <span className="text-foreground">Windows:</span> the installer isn&apos;t code-signed
                yet, so Windows SmartScreen may warn. Click <em>More info → Run anyway</em>.
              </li>
              <li>
                Prefer the browser? You never need the desktop app —{" "}
                <Link href="/sign-up" className="text-accent underline">
                  start free on the web
                </Link>
                .
              </li>
            </ul>
          </div>
        </Reveal>
      </section>

      <CtaBand
        title="Every meeting, structured automatically"
        description="Download the desktop app or start free on the web — same account, same notes."
        primary={{ label: "Start Free", href: "/sign-up" }}
        secondary={{ label: "See Features", href: "/features" }}
      />
      <SiteFooter />
    </main>
  );
}
