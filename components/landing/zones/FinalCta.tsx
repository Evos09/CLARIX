"use client";

import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";

export default function FinalCta() {
  return (
    <section className="relative w-full min-h-[75vh] flex flex-col justify-between px-6 lg:px-12 py-12 overflow-hidden bg-transparent">
      {/* Spacer to push content down so the robot in background is visible */}
      <div className="h-20" />

      {/* Final CTA Card Overlay - Centered and animated in Phase 3 of exit */}
      <div className="final-cta-overlay w-full max-w-2xl mx-auto text-center z-20 my-auto p-8 rounded-3xl glass-panel shadow-2xl border border-gray-200/50 flex flex-col items-center">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-100 bg-violet-50 text-xs font-mono text-violet-700 mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          GET CLARITY
        </span>
        <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-normal leading-[1.1] tracking-tight text-ink mb-6">
          Ready to <span className="italic text-violet-600 font-serif">handle</span> every meeting?
        </h2>
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-md mb-8">
          Let CLARIX recap, summarize, and coordinate your meetings automatically.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <a
            href="/sign-up"
            className="inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-paper text-sm font-semibold px-8 h-12 rounded-full shadow-md transition-all group"
          >
            Start Free Today
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>

      {/* Full site footer is rendered by app/page.tsx below this section */}
      <div className="h-6" />
    </section>
  );
}
