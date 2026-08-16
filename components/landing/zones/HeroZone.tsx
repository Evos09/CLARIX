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
          <Link href="/demo" className="text-sm text-gray-500 hover:text-ink transition-colors">Live Demo</Link>
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
          {/* Positioned on cross-meeting memory, not note-taking. Every rival in
              this category — Granola, Jamie, Fellow, Krisp — already writes good
              botless summaries of the call you are in, so leading with that is
              leading with the thing four funded competitors also say. What none
              of them do is answer a question from meetings months old, mid-call,
              with a link to the second it was said. */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-normal leading-[1.1] tracking-tight text-ink">
            The AI that <span className="italic text-violet-600 font-serif">remembers</span> every meeting — and answers you mid-call.
          </h1>
          <p className="mt-6 text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl">
            &ldquo;What did we promise them last quarter?&rdquo; CLARIX searches every meeting you&rsquo;ve ever recorded and answers while you&rsquo;re still on the call — with a link that <span className="italic">jumps to the exact second</span> it was said. Notes, decisions and action items come as standard.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/sign-up" className="inline-flex items-center gap-2 bg-ink hover:bg-ink-2 text-paper text-sm font-semibold px-6 h-12 rounded-full shadow-md transition-all group">
              Start Free
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            {/* The no-signup escape hatch. A stranger evaluating a meeting
                recorder wants to judge the output before handing over audio —
                this lets them, without an account or an install. */}
            <Link href="/demo" className="inline-flex items-center gap-2 border border-gray-300 hover:border-ink text-ink text-sm font-semibold px-6 h-12 rounded-full transition-all">
              See a real meeting
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
            {/* The moment the product exists for: a question nobody in the room
                can answer, about a meeting months ago. The card to the right is
                CLARIX answering it before the call moves on. */}
            <div className="space-y-3 text-gray-600">
              <p><span className="text-violet-600 font-semibold">Client:</span> You quoted us a discount when we first spoke — what was it?</p>
              <p><span className="text-violet-600 font-semibold">Sarah:</span> I want to say fifteen percent? Let me check and come back to you.</p>
              <p><span className="text-violet-600 font-semibold">Mike:</span> That call was back in March, it'll be somewhere in the notes...</p>
            </div>
          </div>

          {/* Transfer Icon */}
          <div className="w-10 h-10 rounded-full bg-violet-50 border border-violet-100 flex items-center justify-center shadow-sm shrink-0 my-2 md:my-0 rotate-90 md:rotate-0">
            <Sparkles className="w-4 h-4 text-violet-600" />
          </div>

          {/* The overlay answering from a meeting five months back, while the
              call above is still running. The timestamp chip is the part rivals
              cannot copy: the answer is checkable, not just plausible. */}
          <div className="w-full max-w-[300px] p-5 rounded-2xl bg-ink text-paper shadow-2xl flex flex-col text-xs">
            <div className="flex items-center justify-between border-b border-paper/10 pb-3 mb-3">
              <span className="font-semibold text-paper flex items-center gap-1.5 font-display text-sm">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                CLARIX
              </span>
              <span className="bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full text-[9px] font-mono">
                0.9s
              </span>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-[9px] font-mono text-paper/40 uppercase tracking-wider block mb-1">You asked</span>
                <p className="text-paper/70 leading-relaxed">What discount did we quote Acme?</p>
              </div>
              <div className="border-t border-paper/10 pt-3">
                <p className="text-paper/90 leading-relaxed">
                  You offered <span className="text-violet-300 font-semibold">15%</span>, conditional on a 12-month commitment. Acme asked for 20% and you said you&rsquo;d take it back to the team.
                </p>
              </div>
              <div className="border-t border-paper/10 pt-3">
                <span className="text-[9px] font-mono text-paper/40 uppercase tracking-wider block mb-1.5">Source</span>
                <div className="flex items-center gap-2 rounded-lg border border-paper/10 bg-paper/[0.04] px-2.5 py-2">
                  <span className="min-w-0 flex-1 truncate text-paper/85">Acme discovery</span>
                  <span className="shrink-0 rounded bg-violet-500/20 px-1.5 py-0.5 font-mono text-[9px] text-violet-300">
                    Mar 4 · 22:14
                  </span>
                </div>
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
