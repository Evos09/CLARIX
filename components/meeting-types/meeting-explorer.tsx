"use client";

import { useState } from "react";
import { meetingTypes } from "@/lib/site-data";
import { ArrowRight, Sparkles } from "lucide-react";

export function MeetingExplorer() {
  const [activeName, setActiveName] = useState(meetingTypes[0].name);

  const active = meetingTypes.find((m) => m.name === activeName) ?? meetingTypes[0];

  return (
    <div className="grid lg:grid-cols-[1.1fr_1fr] gap-px bg-foreground/10 border border-foreground/10 rounded-xl overflow-hidden">
      {/* List */}
      <div className="bg-background">
        <div className="max-h-[560px] overflow-y-auto divide-y divide-foreground/10">
          {meetingTypes.map((type) => {
            const isActive = type.name === active.name;
            return (
              <button
                key={type.name}
                type="button"
                onClick={() => setActiveName(type.name)}
                className={`w-full text-left px-5 py-4 flex items-center justify-between gap-4 group transition-colors ${
                  isActive ? "bg-foreground/[0.04]" : "hover:bg-foreground/[0.02]"
                }`}
              >
                <div className="min-w-0">
                  <p className={`text-sm font-medium ${isActive ? "text-foreground" : "text-foreground/80"}`}>
                    {type.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{type.summary}</p>
                </div>
                <ArrowRight
                  className={`w-4 h-4 shrink-0 transition-all ${
                    isActive
                      ? "text-brand translate-x-0 opacity-100"
                      : "text-muted-foreground -translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail */}
      <div className="bg-foreground text-background p-7 lg:p-10">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-background/50 mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          CLARIX extracts
        </div>
        <h3 className="font-display text-3xl mb-3">{active.name}</h3>
        <p className="text-background/60 leading-relaxed mb-8">{active.summary}</p>

        <div className="space-y-3">
          {active.extracts.map((item, i) => (
            <div key={item} className="flex items-center gap-3 border-b border-background/10 pb-3">
              <span className="font-mono text-xs text-background/40 w-6">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-sm text-background/90">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
