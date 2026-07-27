import type { Metadata } from "next";
import Link from "next/link";
import { Monitor, Apple, Download } from "lucide-react";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { PageHero } from "@/components/site/page-hero";
import { CtaBand } from "@/components/site/cta-band";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/Reveal";
import { WINDOWS_DOWNLOAD_URL, MAC_DOWNLOAD_URL, WINDOWS_LIVE, MAC_LIVE } from "@/lib/downloads";

export const metadata: Metadata = {
  title: "Download — CLARIX Desktop",
  description:
    "Get the CLARIX desktop app for Windows and macOS. The full CLARIX app in a native window, with a tray icon and a global shortcut.",
};

type Platform = {
  os: "Windows" | "macOS";
  icon: typeof Monitor;
  live: boolean;
  url: string;
  note: string;
};

const platforms: Platform[] = [
  {
    os: "Windows",
    icon: Monitor,
    live: WINDOWS_LIVE,
    url: WINDOWS_DOWNLOAD_URL,
    note: "Windows 10 or 11 (64-bit).",
  },
  {
    os: "macOS",
    icon: Apple,
    live: MAC_LIVE,
    url: MAC_DOWNLOAD_URL,
    note: "macOS 12+ (Intel & Apple Silicon).",
  },
];

export default function DownloadPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden noise-overlay">
      <SiteNav />

      <PageHero
        eyebrow="Desktop App"
        title="CLARIX on your desktop"
        description="The full CLARIX app in its own native window — sign in and use everything, with a tray icon and a global shortcut to summon it from anywhere."
      />

      <section className="max-w-[1100px] mx-auto px-6 lg:px-12 py-16 lg:py-24">
        <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
          {platforms.map((p, i) => (
            <Reveal key={p.os} delay={i * 100}>
              <div className="h-full rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-8 flex flex-col">
                <span className="grid place-items-center w-12 h-12 rounded-xl bg-accent/10 text-accent mb-6">
                  <p.icon className="w-6 h-6" />
                </span>
                <h2 className="font-display text-2xl tracking-tight mb-1">{p.os}</h2>
                <p className="text-sm text-muted-foreground mb-6">{p.note}</p>

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

        {/* Honest install notes */}
        <Reveal delay={200}>
          <div className="mt-12 rounded-2xl border border-foreground/10 p-6 lg:p-8 text-sm text-muted-foreground leading-relaxed">
            <p className="text-foreground font-medium mb-3">Before you install</p>
            <ul className="space-y-2 list-disc pl-5">
              <li>
                The app is a native window around clarixmeetings.com — sign in with your normal CLARIX
                account and every feature works just like the web.
              </li>
              <li>
                <span className="text-foreground">Windows:</span> the installer isn&apos;t code-signed
                yet, so Windows SmartScreen may warn. Click <em>More info → Run anyway</em>.
              </li>
              <li>
                <span className="text-foreground">macOS:</span> for the same reason, right-click the app
                and choose <em>Open</em> the first time to get past Gatekeeper.
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
