import {
  Check,
  Mic,
  Upload,
  Bot,
  Play,
  RefreshCw,
  Sparkles,
  AudioLines,
  MessageSquare as Slack,
  Calendar,
  Mail,
  StickyNote,
} from "lucide-react";

function Panel({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="rounded-xl border border-foreground/10 bg-background overflow-hidden shadow-sm">
      <div className="px-4 py-2.5 border-b border-foreground/10 flex items-center gap-2">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-foreground/15" />
          <span className="w-2.5 h-2.5 rounded-full bg-foreground/15" />
          <span className="w-2.5 h-2.5 rounded-full bg-foreground/15" />
        </div>
        <span className="text-xs font-mono text-muted-foreground ml-1">{label}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export function TranscriptionVisual() {
  const lines = [
    { s: "Priya", t: "Let's start with the renewal — they pushed back on price." },
    { s: "Marcus", t: "Right, but they confirmed budget for Q3." },
    { s: "Priya", t: "I'll send the revised proposal by Friday." },
  ];
  return (
    <Panel label="meeting-3417.transcript">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-mono text-muted-foreground">Auto-detected</span>
        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-brand text-brand-foreground">
          Sales Call
        </span>
      </div>
      <div className="space-y-3">
        {lines.map((l) => (
          <div key={l.t}>
            <span className="font-mono text-[11px] text-brand">{l.s}</span>
            <p className="text-sm text-foreground/80 leading-relaxed">{l.t}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function OutputsVisual() {
  const standup = ["Devin: shipped auth, no blockers", "Mia: blocked on API keys", "Risk: release slips 1 day"];
  const sales = ["Stage: Negotiation", "Objection: pricing", "Next: revised proposal Friday"];
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl border border-foreground/10 bg-background p-4">
        <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Standup</p>
        <ul className="space-y-2">
          {standup.map((i) => (
            <li key={i} className="text-xs text-foreground/80 leading-snug flex gap-2">
              <span className="text-brand">·</span>
              {i}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl border border-foreground/10 bg-foreground text-background p-4">
        <p className="text-[11px] font-mono uppercase tracking-widest text-background/50 mb-3">Sales Call</p>
        <ul className="space-y-2">
          {sales.map((i) => (
            <li key={i} className="text-xs text-background/90 leading-snug flex gap-2">
              <span className="text-background/50">·</span>
              {i}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function AskClarixVisual() {
  return (
    <Panel label="Ask CLARIX">
      <div className="space-y-3">
        <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-foreground text-background text-sm px-4 py-2.5">
          Who owns the Q3 deliverable?
        </div>
        <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-foreground/10 text-sm px-4 py-2.5">
          <span className="inline-flex items-center gap-1.5 text-xs font-mono text-brand mb-1">
            <Sparkles className="w-3 h-3" /> CLARIX
          </span>
          <p className="text-foreground/80 leading-relaxed">
            Devin owns the Q3 onboarding deliverable, committed to ship by the 18th.
          </p>
        </div>
      </div>
    </Panel>
  );
}

export function VoiceVisual() {
  return (
    <Panel label="Advanced Voice Mode">
      <div className="flex flex-col items-center text-center py-2">
        <span className="grid place-items-center w-14 h-14 rounded-full bg-brand/10 text-brand mb-4">
          <AudioLines className="w-6 h-6" />
        </span>
        <div className="flex items-end gap-1 h-10 mb-4">
          {[5, 12, 22, 14, 30, 18, 26, 10, 20, 8, 16, 28].map((h, i) => (
            <span key={i} className="w-1 rounded-full bg-foreground/40" style={{ height: `${h}px` }} />
          ))}
        </div>
        <p className="text-sm text-foreground/80">&ldquo;Read back my action items.&rdquo;</p>
        <p className="text-xs text-muted-foreground mt-1">Speaking · hands-free</p>
      </div>
    </Panel>
  );
}

export function RecordingVisual() {
  const options = [
    { icon: Mic, label: "Record in-browser", note: "Mic + system audio" },
    { icon: Upload, label: "Upload a file", note: "Any audio or video" },
    { icon: Bot, label: "Send the bot", note: "Zoom · Meet · Teams" },
  ];
  return (
    <div className="space-y-3">
      {options.map((o) => (
        <div
          key={o.label}
          className="flex items-center gap-3 rounded-xl border border-foreground/10 bg-background p-4"
        >
          <span className="grid place-items-center w-10 h-10 rounded-lg border border-foreground/10">
            <o.icon className="w-5 h-5" />
          </span>
          <div>
            <p className="text-sm font-medium">{o.label}</p>
            <p className="text-xs text-muted-foreground">{o.note}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AudioLibraryVisual() {
  const items = [
    { name: "Weekly Sales Sync", len: "32:14", type: "Sales Call" },
    { name: "Design Review", len: "47:02", type: "Product Review" },
    { name: "Q3 Board Meeting", len: "58:39", type: "Board Meeting" },
  ];
  return (
    <Panel label="Audio Library">
      <ul className="divide-y divide-foreground/10">
        {items.map((i) => (
          <li key={i.name} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <span className="grid place-items-center w-9 h-9 rounded-md border border-foreground/10 shrink-0">
              <Play className="w-4 h-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{i.name}</p>
              <p className="text-xs text-muted-foreground">{i.type}</p>
            </div>
            <span className="text-xs font-mono text-muted-foreground">{i.len}</span>
            <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function IntegrationsVisual() {
  const tools = [
    { icon: Calendar, label: "Calendar" },
    { icon: Mail, label: "Email" },
    { icon: Slack, label: "Slack" },
    { icon: StickyNote, label: "Notion" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {tools.map((t) => (
        <div
          key={t.label}
          className="flex items-center gap-3 rounded-xl border border-foreground/10 bg-background p-4"
        >
          <span className="grid place-items-center w-9 h-9 rounded-lg border border-foreground/10">
            <t.icon className="w-4 h-4" />
          </span>
          <span className="text-sm font-medium">{t.label}</span>
          <Check className="w-4 h-4 text-brand ml-auto" />
        </div>
      ))}
    </div>
  );
}

export function AnalyticsVisual() {
  const speakers = [
    { name: "Maya", pct: 42 },
    { name: "Devin", pct: 31 },
    { name: "Priya", pct: 18 },
    { name: "Sam", pct: 9 },
  ];
  return (
    <Panel label="Meeting analytics">
      <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-4">
        Talk-time breakdown
      </p>
      <div className="space-y-3">
        {speakers.map((s) => (
          <div key={s.name} className="flex items-center gap-3">
            <span className="w-12 text-xs text-foreground/70 shrink-0">{s.name}</span>
            <div className="flex-1 h-2 rounded-full bg-foreground/10 overflow-hidden">
              <div className="h-full bg-foreground rounded-full" style={{ width: `${s.pct}%` }} />
            </div>
            <span className="w-9 text-right text-xs font-mono text-muted-foreground">{s.pct}%</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function VerticalsVisual() {
  const items = [
    { tag: "Healthcare", note: "SOAP note · ICD-10 codes" },
    { tag: "Legal", note: "Admissions · case timeline" },
    { tag: "Financial", note: "Compliance · suitability" },
  ];
  return (
    <div className="space-y-3">
      {items.map((i) => (
        <div key={i.tag} className="rounded-xl border border-foreground/10 bg-foreground text-background p-4">
          <p className="text-xs font-mono uppercase tracking-widest text-background/50 mb-1">{i.tag}</p>
          <p className="text-sm text-background/90">{i.note}</p>
        </div>
      ))}
    </div>
  );
}
