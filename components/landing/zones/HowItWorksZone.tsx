"use client";

import React from "react";

// Steps carried over from the previous homepage (components/home/how-it-works.tsx).
const STEPS = [
  {
    number: "I",
    title: "Capture the meeting",
    description:
      "Record in your browser, upload a file, or let a CLARIX bot join your Zoom, Meet, or Teams call automatically.",
  },
  {
    number: "II",
    title: "CLARIX transcribes and analyzes",
    description:
      "Speaker-labeled transcription runs while CLARIX reasons over what's said.",
  },
  {
    number: "III",
    title: "Get structured outputs in minutes",
    description:
      "A tailored summary, action items, decisions, and insights — ready to share, export, or push to your tools.",
  },
];

export default function HowItWorksZone() {
  return (
    <section className="relative w-full bg-ink text-paper px-6 lg:px-12 py-24 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg, transparent, transparent 40px, currentColor 40px, currentColor 41px)",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-paper/20 bg-paper/5 text-xs font-mono text-violet-300 mb-6">
          HOW IT WORKS
        </span>
        <h2 className="font-display text-4xl md:text-5xl font-normal leading-[1.1] tracking-tight mb-12">
          From conversation to clarity <span className="text-paper/50">in three steps</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-px bg-paper/10 border border-paper/10 rounded-xl overflow-hidden">
          {STEPS.map((step) => (
            <div key={step.number} className="bg-ink p-8 lg:p-10">
              <span className="font-display text-5xl text-paper/30">{step.number}</span>
              <h3 className="font-display text-2xl mt-6 mb-3">{step.title}</h3>
              <p className="text-paper/60 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
