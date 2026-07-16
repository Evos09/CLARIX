"use client";

import React from "react";
import { Mic } from "lucide-react";

export default function AuditoryCortex() {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center bg-transparent text-gray-900 px-6 lg:px-12 py-20 overflow-hidden">
      {/* Background layer */}
      <div className="zone-bg-layer absolute inset-0 pointer-events-none opacity-20 z-0">
        <div className="absolute inset-0 cyber-matrix-grid opacity-30" />
        <div className="absolute inset-0 cyber-data-stream opacity-45" />
      </div>

      {/* Foreground Content - Core copy and active transcript demo */}
      <div className="zone-fg-content relative w-full max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center z-20">
        {/* Left Side: Headline & Copy */}
        <div className="lg:col-span-5 flex flex-col items-start text-left">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-200 bg-violet-100/60 text-xs font-mono text-violet-700 mb-6">
            <Mic className="w-3.5 h-3.5" />
            01 · TRANSCRIPTION
          </span>
          <h2 className="font-display text-5xl md:text-6xl font-normal leading-[1.08] tracking-tight mb-6">
            AI transcription for <span className="italic text-violet-600 font-serif">any</span> meeting.
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed max-w-md">
            Accurate transcription with automatic detection of the meeting type from the first few minutes. Zero setup.
          </p>
          <a href="/features" className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 font-semibold text-sm transition-colors mt-6">
            Explore all features →
          </a>
        </div>

        {/* Right Side: Materializing Transcript Lines */}
        <div className="lg:col-span-7 flex flex-col gap-4 w-full max-w-xl mx-auto">
          {/* Transcript bubble 1 */}
          <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-md flex gap-4 items-start shadow-md border border-violet-100 hover:border-violet-200 transition-all duration-300">
            <div className="w-8 h-8 rounded-full bg-violet-100 border border-violet-200 flex items-center justify-center font-bold text-xs text-violet-800 shrink-0 select-none">
              SM
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-violet-700 font-mono">Sarah Miller</span>
                <span className="text-[10px] text-gray-500 font-mono">00:12</span>
              </div>
              <p className="text-sm text-gray-800 leading-relaxed">
                Let's make sure the engineering handoff is completed by Friday. We need the API documentation finalized for the integration team.
              </p>
            </div>
          </div>

          {/* Transcript bubble 2 */}
          <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-md flex gap-4 items-start shadow-md border border-violet-100 hover:border-violet-200 transition-all duration-300">
            <div className="w-8 h-8 rounded-full bg-violet-100 border border-violet-200 flex items-center justify-center font-bold text-xs text-violet-800 shrink-0 select-none">
              DK
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-violet-700 font-mono">Daniel Kim</span>
                <span className="text-[10px] text-gray-500 font-mono">00:28</span>
              </div>
              <p className="text-sm text-gray-800 leading-relaxed">
                I'm already working on the routes and schemas. The core API should be deployed to staging by Thursday afternoon.
              </p>
            </div>
          </div>

          {/* Transcript bubble 3 */}
          <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-md flex gap-4 items-start shadow-md border border-violet-100 hover:border-violet-200 transition-all duration-300 opacity-60">
            <div className="w-8 h-8 rounded-full bg-violet-100 border border-violet-200 flex items-center justify-center font-bold text-xs text-violet-800 shrink-0 select-none">
              AP
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-violet-700 font-mono">Alex Patel</span>
                <span className="text-[10px] text-gray-500 font-mono">00:41</span>
              </div>
              <p className="text-sm text-gray-800 leading-relaxed">
                Excellent. Once Daniel deploys, I will start hookups with Slack and Notion to run tests on the summary webhooks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
