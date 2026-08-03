"use client";

import React from "react";
import { Brain, CheckCircle, ListChecks } from "lucide-react";
import Link from "next/link";

export default function ReasoningCenter() {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center bg-transparent text-gray-900 px-6 lg:px-12 py-20 overflow-hidden">
      {/* Background layer - Cyber Grid */}
      <div className="zone-bg-layer absolute inset-0 pointer-events-none opacity-20 z-0">
        <div className="absolute inset-0 cyber-matrix-grid opacity-25" />
        <div className="absolute inset-0 cyber-data-stream opacity-30" />
      </div>

      {/* Foreground Content - Layout & copy */}
      <div className="zone-fg-content relative w-full max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center z-20">
        {/* Left Side: Headline, Copy & Cards Stacked */}
        <div className="lg:col-span-6 flex flex-col items-start text-left space-y-6">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-200 bg-violet-100/60 text-xs font-mono text-violet-700 mb-6">
              <Brain className="w-3.5 h-3.5" />
              03 · DECIDING
            </span>
            <h2 className="font-display text-5xl md:text-6xl font-normal leading-[1.08] tracking-tight mb-6">
              Action items & <span className="italic text-violet-600 font-serif font-normal">decisions</span> extracted.
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed max-w-md">
              Action items, decisions, and summaries — shaped to fit the exact kind of meeting it was.
            </p>
            <Link href="/features" className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 font-semibold text-sm transition-colors mt-6">
              Explore all features →
            </Link>
          </div>

          <div className="w-full flex flex-col gap-5 max-w-lg">
            {/* Main Decision Node */}
            <div className="reasoning-card-1 p-5 rounded-2xl bg-violet-600 text-white shadow-lg border border-violet-700 flex gap-4 items-start relative select-none hover:scale-[1.01] transition-transform duration-300">
              <CheckCircle className="w-5 h-5 text-violet-100 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <span className="text-[9px] font-mono text-violet-200 uppercase tracking-widest block font-semibold">Main Decision</span>
                <p className="text-sm font-medium leading-relaxed">
                  Commit to the new onboarding flow for the Q3 release schedule.
                </p>
              </div>
              <div className="absolute left-8 -bottom-5 w-0.5 h-5 bg-violet-600/40 pointer-events-none" />
            </div>

            {/* Action Item Node 1 */}
            <div className="reasoning-card-2 p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-violet-100 shadow-md ml-8 flex gap-4 items-start relative select-none hover:scale-[1.01] transition-transform duration-300">
              <ListChecks className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block">Action Item</span>
                  <span className="text-[10px] font-mono font-semibold bg-violet-100 text-violet-800 border border-violet-200 px-2 py-0.5 rounded-full">Devin</span>
                </div>
                <p className="text-sm text-gray-800 font-medium">
                  Ship the core onboarding routing API endpoints by the 18th.
                </p>
              </div>
              <div className="absolute left-8 -bottom-5 w-0.5 h-5 bg-violet-600/40 pointer-events-none" />
            </div>

            {/* Action Item Node 2 */}
            <div className="reasoning-card-3 p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-violet-100 shadow-md ml-8 flex gap-4 items-start select-none hover:scale-[1.01] transition-transform duration-300">
              <ListChecks className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block">Action Item</span>
                  <span className="text-[10px] font-mono font-semibold bg-violet-100 text-violet-800 border border-violet-200 px-2 py-0.5 rounded-full">Priya</span>
                </div>
                <p className="text-sm text-gray-800 font-medium">
                  Unblock the pricing page layout design through legal compliance reviews.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Empty spacer to expose zoomed console module */}
        <div className="lg:col-span-6 hidden lg:block" />
      </div>
    </section>
  );
}
