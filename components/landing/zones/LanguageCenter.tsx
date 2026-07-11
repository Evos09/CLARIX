"use client";

import React from "react";
import { MessageSquare, Copy, Send } from "lucide-react";

export default function LanguageCenter() {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center bg-transparent text-gray-900 px-6 lg:px-12 py-20 overflow-hidden">
      {/* Background layer - Cyber Grid */}
      <div className="zone-bg-layer absolute inset-0 pointer-events-none opacity-20 z-0">
        <div className="absolute inset-0 cyber-matrix-grid opacity-25" />
        <div className="absolute inset-0 cyber-data-stream opacity-30" />
      </div>

      {/* Foreground Content - Layout & chat panel */}
      <div className="zone-fg-content relative w-full max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center z-20">
        {/* Left Side: Headline & Copy */}
        <div className="lg:col-span-5 flex flex-col items-start text-left">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-200 bg-violet-100/60 text-xs font-mono text-violet-700 mb-6">
            <MessageSquare className="w-3.5 h-3.5" />
            02 · ASK CLARIX
          </span>
          <h2 className="font-display text-5xl md:text-6xl font-normal leading-[1.08] tracking-tight mb-6">
            Ask CLARIX. <span className="italic text-violet-600 font-serif">About any</span> past meeting.
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed max-w-md">
            A chat interface for any past meeting. Ask a question and get an answer pulled straight from the transcript.
          </p>
          <a href="/features" className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 font-semibold text-sm transition-colors mt-6">
            Explore all features →
          </a>
        </div>

        {/* Right Side: Chat Panel Interface */}
        <div className="lg:col-span-7 w-full max-w-xl mx-auto">
          <div className="rounded-2xl border border-violet-100 bg-white/80 backdrop-blur-md shadow-xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-5 py-4 border-b border-violet-100 bg-violet-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-violet-600" />
                <span className="font-mono text-xs font-semibold text-violet-900/60 uppercase tracking-wider">Ask CLARIX AI Session</span>
              </div>
              <span className="text-[10px] text-gray-500 font-mono">Q3 Review Sync</span>
            </div>

            {/* Chat Messages */}
            <div className="p-5 flex flex-col gap-4 max-h-[400px] overflow-y-auto">
              {/* User message 1 */}
              <div className="flex items-start gap-3 justify-end">
                <div className="flex flex-col items-end">
                  <div className="p-3.5 rounded-2xl rounded-tr-none bg-violet-600 text-white text-sm max-w-sm shadow-sm select-none">
                    What were the 3 biggest risks raised in the Q3 review?
                  </div>
                  <span className="text-[9px] text-gray-400 font-mono mt-1 mr-1">User · 10:24 AM</span>
                </div>
                <div className="w-7 h-7 rounded-full bg-violet-100 border border-violet-200 flex items-center justify-center font-bold text-[10px] text-violet-800 shrink-0 select-none">
                  SM
                </div>
              </div>

              {/* CLARIX response 1 */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-[10px] text-white shrink-0 font-bold shadow-sm select-none">
                  C
                </div>
                <div className="flex flex-col items-start">
                  <div className="p-4 rounded-2xl rounded-tl-none bg-white border border-violet-100 text-sm text-gray-800 max-w-md shadow-sm space-y-2 leading-relaxed">
                    <p className="font-semibold text-gray-900">Three risks were raised, in order of emphasis:</p>
                    <ol className="list-decimal list-inside space-y-2 pl-1 text-gray-700">
                      <li>
                        <strong>Pricing competitiveness</strong> — VP Sales worried about the $99 tier vs. competitor X at $79. <span className="text-[10px] text-violet-500 font-mono">↳ 14:23</span>
                      </li>
                      <li>
                        <strong>API quota limits</strong> — Eng flagged that current infra caps power users at 5k requests/mo. <span className="text-[10px] text-violet-500 font-mono">↳ 22:08</span>
                      </li>
                      <li>
                        <strong>Onboarding drop-off</strong> — 38% of trial users churn at day 2. <span className="text-[10px] text-violet-500 font-mono">↳ 31:45</span>
                      </li>
                    </ol>
                    <p className="text-gray-500 italic text-xs mt-2">Want me to draft action items for any of these?</p>
                  </div>
                  <span className="text-[9px] text-gray-400 font-mono mt-1 ml-1">CLARIX · 10:24 AM</span>
                </div>
              </div>

              {/* User message 2 */}
              <div className="flex items-start gap-3 justify-end">
                <div className="flex flex-col items-end">
                  <div className="p-3.5 rounded-2xl rounded-tr-none bg-violet-600 text-white text-sm max-w-sm shadow-sm select-none">
                    Yes — create those action items and email me the recap.
                  </div>
                  <span className="text-[9px] text-gray-400 font-mono mt-1 mr-1">User · 10:25 AM</span>
                </div>
                <div className="w-7 h-7 rounded-full bg-violet-100 border border-violet-200 flex items-center justify-center font-bold text-[10px] text-violet-800 shrink-0 select-none">
                  SM
                </div>
              </div>

              {/* CLARIX response 2 */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-[10px] text-white shrink-0 font-bold shadow-sm select-none">
                  C
                </div>
                <div className="flex flex-col items-start w-full">
                  <div className="p-4 rounded-2xl rounded-tl-none bg-white border border-violet-100 text-sm text-gray-800 max-w-md shadow-sm space-y-3 leading-relaxed">
                    <p className="font-semibold text-gray-900">Done. 3 action items created — recap sent to your inbox:</p>
                    <div className="p-3 bg-violet-50/50 rounded-lg border border-violet-100 font-mono text-xs text-gray-700 leading-normal">
                      <strong>📌 Q3 Review — Top Risks</strong><br />
                      • Pricing competitiveness vs $79 competitor…<br />
                      • API quota limiting power users…<br />
                      • 38% onboarding churn at day 2…
                    </div>
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-violet-200 bg-white text-xs font-semibold text-violet-700 hover:bg-violet-50 shadow-sm transition-colors cursor-pointer select-none">
                        <Copy className="w-3.5 h-3.5" />
                        Copy
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-600 text-xs font-semibold text-white hover:bg-violet-700 shadow-sm transition-colors cursor-pointer select-none">
                        <Send className="w-3.5 h-3.5" />
                        Email sent
                      </button>
                    </div>
                  </div>
                  <span className="text-[9px] text-gray-400 font-mono mt-1 ml-1">CLARIX · 10:25 AM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
