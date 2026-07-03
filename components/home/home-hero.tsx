"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { TranscriptDemo } from "./transcript-demo";

const NexbotStage = dynamic(
  () => import("@/components/motion/NexbotStage").then((m) => m.NexbotStage),
  { ssr: false },
);

export function HomeHero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative">
      {/* Fixed backdrop: grid lines + giant letters + mascot + side copy.
          Stays put while the page scrolls over it. */}
      <div
        className={`fixed inset-0 z-0 h-screen pointer-events-none transition-opacity duration-1000 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="absolute inset-0 overflow-hidden opacity-[0.4]" aria-hidden>
          {[...Array(12)].map((_, i) => (
            <div
              key={`v-${i}`}
              className="absolute w-px bg-foreground/[0.06]"
              style={{ left: `${8.33 * (i + 1)}%`, top: 0, bottom: 0 }}
            />
          ))}
        </div>

        <div className="absolute inset-0 flex items-center justify-center select-none" aria-hidden>
          <span className="font-display leading-none tracking-tight text-foreground text-[clamp(4.5rem,16vw,14rem)]">
            CLARIX
          </span>
        </div>

        <NexbotStage className="pointer-events-auto absolute inset-0" />

        {/* Left: badge + headline + CTAs */}
        <div
          className={`pointer-events-auto absolute left-6 lg:left-16 bottom-10 lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 max-w-[400px] transition-all duration-700 delay-150 ${
            isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
          }`}
        >
          <span className="flex items-center gap-3 text-sm font-mono text-muted-foreground mb-5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
            </span>
            Now live · no credit card
          </span>

          <h1 className="font-display text-[clamp(1.7rem,2.4vw,2.5rem)] leading-[1.08] tracking-tight mb-7">
            The AI that handles{" "}
            <span className="relative inline-block">
              every meeting
              <span className="absolute -bottom-0.5 left-0 right-0 h-2 bg-brand/20" />
            </span>{" "}
            you never have time to recap.
          </h1>

          <div className="flex items-start">
            <Button
              asChild
              size="lg"
              className="bg-accent hover:bg-accent/90 text-background px-7 h-12 text-sm rounded-full group"
            >
              <Link href="/sign-up">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          <p className="mt-7 text-[15px] text-muted-foreground leading-relaxed">
            CLARIX joins your calls, listens, and turns every conversation into a clean brief —
            action items, decisions, summaries — in minutes. Then you can talk to it about what
            was decided.
          </p>
          <p className="mt-4 text-sm text-muted-foreground font-mono">
            3 meetings free every month
          </p>
        </div>

        {/* Right: live transcript → CLARIX output demo */}
        <div
          className={`pointer-events-auto hidden lg:block absolute right-6 lg:right-16 top-1/2 -translate-y-1/2 w-[330px] xl:w-[360px] transition-all duration-700 delay-300 ${
            isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
          }`}
        >
          <TranscriptDemo stacked />
        </div>
      </div>

      {/* Spacer: the opening viewport belongs to the fixed stage. */}
      <div className="h-screen min-h-[560px]" />
    </section>
  );
}
