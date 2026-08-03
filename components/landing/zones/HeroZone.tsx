"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Check } from "lucide-react";

export default function HeroZone() {
  return (
    <section className="relative w-full min-h-screen flex flex-col justify-between px-6 lg:px-12 py-6 overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between z-30">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="font-display text-2xl tracking-tight font-semibold text-ink">CLARIX</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/features" className="text-sm text-gray-500 hover:text-ink transition-colors">Features</Link>
          <Link href="/meeting-types" className="text-sm text-gray-500 hover:text-ink transition-colors">Meeting Types</Link>
          <Link href="/pricing" className="text-sm text-gray-500 hover:text-ink transition-colors">Pricing</Link>
          <Link href="/integrations" className="text-sm text-gray-500 hover:text-ink transition-colors">Integrations</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="text-sm text-gray-500 hover:text-ink transition-colors px-3 py-1.5">Sign In</Link>
          <Link href="/sign-up" className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-sm transition-all">
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Main Hero Copy - Linked to fade out in Phase 0 */}
      <div className="hero-overlay-text w-full max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center my-auto z-20 pt-16">
        <div className="lg:col-span-6 flex flex-col items-start text-left">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-normal leading-[1.1] tracking-tight text-ink">
            The AI that <span className="italic text-violet-600 font-serif">handles</span> every meeting you never have time to recap.
          </h1>
          <p className="mt-6 text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl">
            CLARIX joins your calls, listens, and turns every conversation into a clean brief — action items, decisions, summaries — ready moments after the call ends. Then you can <span className="italic">talk to it</span> about what was decided.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/sign-up" className="inline-flex items-center gap-2 bg-ink hover:bg-ink-2 text-paper text-sm font-semibold px-6 h-12 rounded-full shadow-md transition-all group">
              Start Free
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-gray-100 pt-6 w-full max-w-xl text-xs text-gray-500">
            <span className="inline-flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-violet-600" /> 10 free meetings every month — no credit card</span>
          </div>
        </div>

        {/* Visual Showcase - Floating raw transcript to structured summary card */}
        <div className="lg:col-span-6 flex flex-col md:flex-row items-center justify-center gap-6 relative">
          <div className="absolute inset-0 bg-violet-500/5 blur-[120px] rounded-full pointer-events-none" />

          {/* Raw Transcript Card */}
          <div className="w-full max-w-[280px] p-5 rounded-2xl glass-panel shadow-lg border border-gray-200/50 flex flex-col text-xs font-mono">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
              <span className="font-bold text-[10px] text-gray-400">raw_transcript.txt</span>
              <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full text-[9px] font-semibold">
                <span className="w-1 h-1 rounded-full bg-rose-500 animate-ping" />
                Recording
              </span>
            </div>
            <div className="space-y-3 text-gray-600">
              <p><span className="text-violet-600 font-semibold">Sarah:</span> So the Q3 launch is locked for Sep 15 unless we...</p>
              <p><span className="text-violet-600 font-semibold">Mike:</span> Yeah but legal hasn't signed off on the pricing yet</p>
              <p><span className="text-violet-600 font-semibold">Priya:</span> I can have the deck done by Friday, maybe Thursday</p>
              <p><span className="text-violet-600 font-semibold">Sarah:</span> Great. And someone needs to ping Marcus about...</p>
              <p><span className="text-violet-600 font-semibold">Mike:</span> right the API integration, I'll loop in Daniel too</p>
            </div>
          </div>

          {/* Transfer Icon */}
          <div className="w-10 h-10 rounded-full bg-violet-50 border border-violet-100 flex items-center justify-center shadow-sm shrink-0 my-2 md:my-0 rotate-90 md:rotate-0">
            <Sparkles className="w-4 h-4 text-violet-600" />
          </div>

          {/* Structured CLARIX Brief */}
          <div className="w-full max-w-[300px] p-5 rounded-2xl bg-ink text-paper shadow-2xl flex flex-col text-xs">
            <div className="flex items-center justify-between border-b border-paper/10 pb-3 mb-3">
              <span className="font-semibold text-paper flex items-center gap-1.5 font-display text-sm">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                Q3 Launch Sync — Aug 14
              </span>
              <span className="bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full text-[9px] font-mono">
                Complete
              </span>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-[9px] font-mono text-paper/40 uppercase tracking-wider block mb-1">TLDR</span>
                <p className="text-paper/80 leading-relaxed">Q3 launch targets Sep 15. Priya's deck is on track for Thu/Fri. Pricing is blocked on legal review.</p>
              </div>
              <div className="border-t border-paper/10 pt-3">
                <span className="text-[9px] font-mono text-paper/40 uppercase tracking-wider block mb-1.5">Action Items</span>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                    <div className="flex justify-between w-full">
                      <span className="text-paper/85">Ping Marcus about API</span>
                      <span className="text-paper/45 font-mono text-[9px]">Mike</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                    <div className="flex justify-between w-full">
                      <span className="text-paper/85">Finish Q3 launch deck</span>
                      <span className="text-paper/45 font-mono text-[9px]">Priya</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Arrow Indicator */}
      <div className="w-full max-w-7xl mx-auto flex justify-center py-4 z-20">
        <div className="flex flex-col items-center gap-1.5 text-gray-400">
          <span className="text-[10px] font-mono uppercase tracking-widest">Scroll to Enter Mind</span>
          <div className="w-px h-6 bg-gray-200 animate-bounce" />
        </div>
      </div>
    </section>
  );
}
