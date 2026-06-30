"use client";

import { useEffect, useState } from "react";
import { Check, FileText, ListChecks, Sparkles } from "lucide-react";

const transcript = [
  { speaker: "Maya", line: "Okay, so for Q3 we're committing to the new onboarding flow." },
  { speaker: "Devin", line: "I'll own the API work — should be ready by the 18th." },
  { speaker: "Maya", line: "Great. The pricing page redesign is blocked on legal review." },
  { speaker: "Priya", line: "I'll chase legal today and report back tomorrow." },
];

const summary = {
  type: "Sprint Planning",
  decisions: ["Commit to new onboarding flow for Q3"],
  actions: [
    { who: "Devin", task: "Ship onboarding API by the 18th" },
    { who: "Priya", task: "Unblock pricing page with legal review" },
  ],
};

export function TranscriptDemo() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    let timeouts: ReturnType<typeof setTimeout>[] = [];

    const run = () => {
      setVisibleLines(0);
      setShowSummary(false);
      transcript.forEach((_, i) => {
        timeouts.push(setTimeout(() => setVisibleLines(i + 1), 700 * (i + 1)));
      });
      timeouts.push(setTimeout(() => setShowSummary(true), 700 * (transcript.length + 1)));
    };

    run();
    const loop = setInterval(run, 700 * (transcript.length + 1) + 4500);
    return () => {
      clearInterval(loop);
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="grid sm:grid-cols-2 gap-px bg-foreground/10 border border-foreground/10 rounded-xl overflow-hidden shadow-2xl">
      {/* Transcript panel */}
      <div className="bg-background p-5 lg:p-6">
        <div className="flex items-center gap-2 mb-4 text-xs font-mono text-muted-foreground uppercase tracking-widest">
          <FileText className="w-3.5 h-3.5" />
          Live transcript
        </div>
        <div className="space-y-3 min-h-[220px]">
          {transcript.map((row, i) => (
            <div
              key={i}
              className={`transition-all duration-500 ${
                i < visibleLines ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
            >
              <span className="font-mono text-[11px] text-brand">{row.speaker}</span>
              <p className="text-sm text-foreground/80 leading-relaxed">{row.line}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Summary panel */}
      <div className="bg-foreground text-background p-5 lg:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-background/50 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            CLARIX output
          </div>
          <span
            className={`text-[11px] font-mono px-2 py-0.5 rounded-full bg-background/15 transition-all duration-500 ${
              showSummary ? "opacity-100" : "opacity-0"
            }`}
          >
            {summary.type}
          </span>
        </div>

        <div className="min-h-[220px]">
          <div
            className={`transition-all duration-700 ${
              showSummary ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
          >
            <p className="text-[11px] font-mono uppercase tracking-widest text-background/40 mb-2">Decisions</p>
            <ul className="space-y-1.5 mb-5">
              {summary.decisions.map((d) => (
                <li key={d} className="flex items-start gap-2 text-sm text-background/90">
                  <Check className="w-4 h-4 mt-0.5 shrink-0" />
                  {d}
                </li>
              ))}
            </ul>

            <p className="text-[11px] font-mono uppercase tracking-widest text-background/40 mb-2">Action items</p>
            <ul className="space-y-2">
              {summary.actions.map((a) => (
                <li key={a.task} className="flex items-start gap-2 text-sm">
                  <ListChecks className="w-4 h-4 mt-0.5 shrink-0 text-background/60" />
                  <span>
                    <span className="font-mono text-[11px] text-background/60">{a.who} · </span>
                    <span className="text-background/90">{a.task}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
