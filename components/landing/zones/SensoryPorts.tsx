"use client";

import React from "react";
import { Link2, ArrowUpRight, AlertCircle } from "lucide-react";

const INTEGRATIONS = [
  { name: "Zoom", type: "Conferencing", status: "Active" },
  { name: "Google Meet", type: "Conferencing", status: "Active" },
  { name: "Microsoft Teams", type: "Conferencing", status: "Active" },
  { name: "Google Calendar", type: "Calendar", status: "Active" },
  { name: "Gmail", type: "Email", status: "Active" },
  { name: "Slack", type: "Workspace", status: "Active" },
  { name: "Notion", type: "Workspace", status: "Active" },
  { name: "Linear", type: "Workspace", status: "Active" },
];

export default function SensoryPorts() {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center bg-transparent text-gray-900 px-6 lg:px-12 py-20 overflow-hidden">
      {/* Background layer - Cyber Grid */}
      <div className="zone-bg-layer absolute inset-0 pointer-events-none opacity-20 z-0">
        <div className="absolute inset-0 cyber-matrix-grid opacity-30" />
        <div className="absolute inset-0 cyber-data-stream opacity-45" />
      </div>

      {/* Foreground Content - Layout */}
      <div className="zone-fg-content relative w-full max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center z-20">
        {/* Left Side: Headline & Copy */}
        <div className="lg:col-span-5 flex flex-col items-start text-left bg-white/80 p-6 rounded-3xl border border-violet-100 backdrop-blur-md shadow-lg">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-200 bg-violet-100/60 text-xs font-mono text-violet-700 mb-6">
            <Link2 className="w-3.5 h-3.5" />
            04 · INTEGRATIONS
          </span>
          <h2 className="font-display text-5xl md:text-6xl font-normal leading-[1.08] tracking-tight mb-6">
            Works <span className="italic text-violet-600 font-serif">everywhere</span> you meet.
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-6">
            Connects to Google Calendar, Gmail, Notion, Slack, and Linear. No new tabs to check.
          </p>

          <a
            href="/integrations"
            className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 font-semibold text-sm transition-colors mt-8 group"
          >
            See all integrations
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>

        {/* Right Side: Integration Logos Grid */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-xl mx-auto">
          {INTEGRATIONS.map((integration) => {
            const isComingSoon = integration.status === "Coming soon";
            return (
              <div
                key={integration.name}
                className={`p-4 rounded-xl border flex flex-col gap-2 hover:bg-violet-50/50 transition-all duration-300 select-none ${
                  isComingSoon ? "bg-white border-violet-100/50" : "bg-white/80 border-violet-100 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 font-display">{integration.name}</span>
                  {isComingSoon ? (
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-250 px-1.5 py-0.5 rounded text-[8px] font-mono">
                      <AlertCircle className="w-2.5 h-2.5" />
                      Soon
                    </span>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-600 shadow-[0_0_6px_rgba(124,79,232,0.4)]" />
                  )}
                </div>
                <p className="text-[9px] text-gray-500 font-mono">{integration.type}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
