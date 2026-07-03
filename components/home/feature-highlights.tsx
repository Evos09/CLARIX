import { SectionHeading } from "@/components/site/section-heading";
import { Reveal } from "@/components/motion/Reveal";
import { ScanText, ListTree, MessagesSquare, AudioLines, Video, Plug } from "lucide-react";

const features = [
  {
    icon: ScanText,
    title: "AI transcription for any meeting",
    description:
      "Accurate transcription for any meeting, with automatic detection of the meeting type from the first few minutes. Zero setup.",
  },
  {
    icon: ListTree,
    title: "Action items & decisions extracted",
    description:
      "Action items, decisions, and summaries — shaped to fit the exact kind of meeting it was.",
  },
  {
    icon: MessagesSquare,
    title: "Ask CLARIX",
    description:
      "A chat interface for any past meeting. Ask a question and get an answer pulled straight from the transcript.",
  },
  {
    icon: AudioLines,
    title: "Advanced Voice Mode",
    description:
      "Have a real-time spoken conversation with CLARIX about your meetings — completely hands-free.",
  },
  {
    icon: Video,
    title: "Three ways to capture a meeting",
    description:
      "Record in-browser, upload a file, or let a CLARIX bot join your Zoom, Google Meet, or Teams call automatically.",
  },
  {
    icon: Plug,
    title: "Works everywhere you meet",
    description:
      "Connects to Google Calendar, Gmail, and Notion today — Slack, Linear, and CRM connectors are next.",
  },
];

export function FeatureHighlights() {
  return (
    <section className="relative py-24 lg:py-32 border-t border-foreground/10">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <Reveal>
        <SectionHeading
          eyebrow="Every meeting"
          title="Every meeting, fully understood"
          description="CLARIX doesn't just transcribe. It listens, decides what matters, and produces the brief you would have written if you'd had an extra hour after every call."
        />
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-foreground/10 border border-foreground/10 mt-16 rounded-xl overflow-hidden">
          {features.map((feature, i) => (
            <Reveal
              key={feature.title}
              delay={i * 80}
              className="group bg-background p-8 lg:p-10 hover:bg-foreground/[0.02] transition-colors"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="grid place-items-center w-11 h-11 rounded-lg border border-foreground/10 bg-foreground/[0.02] group-hover:border-brand/40 transition-colors">
                  <feature.icon className="w-5 h-5" />
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="font-display text-2xl mb-3 text-balance">{feature.title}{feature.title === "Advanced Voice Mode" && <span className="ml-2 inline-block align-middle rounded-full border border-accent/30 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">Coming soon</span>}</h3>
              <p className="text-muted-foreground leading-relaxed text-pretty">{feature.description}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
