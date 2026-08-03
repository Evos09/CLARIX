"use client";

import React from "react";
import { HardDrive } from "lucide-react";
import Link from "next/link";

const MEETING_TYPES = [
  { emoji: "📊", name: "Team Standup", desc: "Yesterday/today/blockers summary" },
  { emoji: "💼", name: "Sales Call", desc: "Deal stage, pain points, objections" },
  { emoji: "🤝", name: "1:1 Meeting", desc: "Commitments & feedback for both sides" },
  { emoji: "🏢", name: "Client Meeting", desc: "Decisions, deliverables, & dependencies" },
  { emoji: "🎯", name: "Interview", desc: "Candidate highlights & red flags" },
  { emoji: "🏛️", name: "Board Meeting", desc: "Resolutions, votes, and strategy" },
  { emoji: "🔍", name: "Discovery Call", desc: "Qualification notes & requirements" },
  { emoji: "🔁", name: "Retrospective", desc: "What went well, blockers, & experiments" },
  { emoji: "💡", name: "Brainstorm", desc: "Idea compilation & ownership mapping" },
  { emoji: "📈", name: "Investor Update", desc: "KPI dashboards & strategic asks" },
  { emoji: "📆", name: "Sprint Planning", desc: "Scope definition & task estimates" },
  { emoji: "🚀", name: "Project Kickoff", desc: "Goals, timeline, & roles" },
];

export default function MemoryArchive() {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center bg-transparent text-gray-900 px-6 lg:px-12 py-20 overflow-hidden">
      {/* Background layer (Cyber Grid) */}
      <div className="zone-bg-layer absolute inset-0 pointer-events-none opacity-20 z-0">
        <div className="absolute inset-0 cyber-matrix-grid opacity-30" />
        <div className="absolute inset-0 cyber-data-stream opacity-45" />
      </div>

      {/* Foreground Content - Column split to prevent overlap */}
      <div className="zone-fg-content relative w-full max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center z-20">
        {/* Left Side: Headline & Copy */}
        <div className="lg:col-span-5 flex flex-col items-start text-left bg-white/80 p-6 rounded-3xl border border-violet-100 backdrop-blur-md shadow-lg">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-200 bg-violet-100/60 text-xs font-mono text-violet-700 mb-6">
            <HardDrive className="w-3.5 h-3.5" />
            05 · MEETING TYPES
          </span>
          <h2 className="font-display text-5xl md:text-6xl font-normal leading-[1.08] tracking-tight mb-6">
            One assistant for <span className="italic text-violet-600 font-serif">every</span> kind of meeting.
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            CLARIX knows the difference between a standup, a sales call, and a board meeting — and structures every brief accordingly.
          </p>
          <p className="text-sm text-gray-500 leading-relaxed">
            12 shown here — 20+ types in total.
          </p>
          <Link href="/meeting-types" className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 font-semibold text-sm transition-colors mt-6">
            Explore all meeting types →
          </Link>
        </div>

        {/* Right Side: 3D receding cabinet bound strictly to column */}
        <div className="lg:col-span-7 w-full flex items-center justify-center">
          <div 
            className="grid grid-cols-2 gap-4 p-4 w-full max-w-lg select-none"
            style={{
              transform: "perspective(1200px) rotateX(15deg) rotateY(-10deg)",
              transformStyle: "preserve-3d",
            }}
          >
            {MEETING_TYPES.map((item) => (
              <div
                key={item.name}
                className="p-3.5 rounded-xl bg-white border border-violet-100 flex items-center gap-3 shadow-md hover:border-violet-200 transition-all duration-300"
              >
                <span className="text-lg">{item.emoji}</span>
                <div>
                  <h4 className="font-display font-semibold text-xs text-violet-700">{item.name}</h4>
                  <p className="text-[9px] text-gray-500 leading-tight mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
