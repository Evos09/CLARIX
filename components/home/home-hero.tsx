"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { TranscriptDemo } from "./transcript-demo";

export function HomeHero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative overflow-hidden">
      {/* Subtle grid lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.4]">
        {[...Array(12)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute w-px bg-foreground/[0.06]"
            style={{ left: `${8.33 * (i + 1)}%`, top: 0, bottom: 0 }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 pt-36 lg:pt-44 pb-20 lg:pb-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Copy */}
          <div>
            <div
              className={`mb-7 transition-all duration-700 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground">
                <span className="w-8 h-px bg-foreground/30" />
                The AI meeting assistant
              </span>
            </div>

            <h1
              className={`text-[clamp(2.6rem,6vw,5rem)] font-display leading-[0.95] tracking-tight mb-7 transition-all duration-1000 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              Every meeting,
              <br />
              turned into{" "}
              <span className="relative inline-block">
                action
                <span className="absolute -bottom-1 left-0 right-0 h-3 bg-brand/20" />
              </span>
              .
            </h1>

            <p
              className={`text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-xl mb-9 transition-all duration-700 delay-200 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              CLARIX records or joins your calls, transcribes every word, and automatically
              produces action items, decisions, and summaries — tailored to the exact type of
              meeting. No setup required.
            </p>

            <div
              className={`flex flex-col sm:flex-row items-start gap-4 transition-all duration-700 delay-300 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <Button
                asChild
                size="lg"
                className="bg-accent hover:bg-accent/90 text-background px-8 h-14 text-base rounded-full group"
              >
                <Link href="/sign-up">
                  Start Free
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-base rounded-full border-foreground/20 hover:bg-foreground/5 group"
              >
                <Play className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />
                Watch Demo
              </Button>
            </div>

            <p
              className={`mt-6 text-sm text-muted-foreground transition-all duration-700 delay-500 ${
                isVisible ? "opacity-100" : "opacity-0"
              }`}
            >
              No credit card required · Includes a 14-day Pro trial
            </p>
          </div>

          {/* Interactive visual */}
          <div
            className={`transition-all duration-1000 delay-300 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <TranscriptDemo />
          </div>
        </div>
      </div>
    </section>
  );
}
