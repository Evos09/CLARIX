import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { PageHero } from "@/components/site/page-hero";
import { CtaBand } from "@/components/site/cta-band";
import { FeatureBlock } from "@/components/features/feature-block";
import {
  TranscriptionVisual,
  OutputsVisual,
  AskClarixVisual,
  VoiceVisual,
  RecordingVisual,
  AudioLibraryVisual,
  IntegrationsVisual,
  AnalyticsVisual,
  VerticalsVisual,
} from "@/components/features/visuals";

export const metadata = {
  title: "Features — CLARIX",
  description:
    "Transcription, structured outputs, Ask CLARIX chat, Advanced Voice Mode, recording and bot capture, audio library, integrations, analytics, and compliance-aware Pro Verticals.",
};

const blocks = [
  {
    eyebrow: "Transcription",
    title: "AI transcription that detects the meeting type",
    description:
      "CLARIX transcribes meetings with speaker labels and automatically figures out what type of meeting it is from the first few minutes — no manual configuration, ever.",
    bullets: ["Speaker-labeled transcripts", "Automatic meeting-type detection", "Zero setup required"],
    visual: <TranscriptionVisual />,
  },
  {
    eyebrow: "Structured outputs",
    title: "Outputs shaped to the meeting",
    description:
      "Every meeting type produces a tailored output. A standup surfaces blockers and who did what; a sales call surfaces objections, deal stage, and next steps. Same engine, different lens.",
    bullets: ["Tailored to 20+ meeting types", "Decisions, action items, and summaries", "Owners and due dates extracted"],
    visual: <OutputsVisual />,
  },
  {
    eyebrow: "Ask CLARIX",
    title: "Chat with any past meeting",
    description:
      "A chat interface tied to a specific meeting. Ask “Who owns the Q3 deliverable?” or “Write a follow-up email based on this meeting” and get an answer streamed back in real time, grounded in that meeting's transcript.",
    bullets: ["Answers grounded in the transcript", "Draft follow-ups and recaps", "Real-time streaming responses"],
    visual: <AskClarixVisual />,
  },
  {
    eyebrow: "Voice mode · Coming soon",
    title: "Talk to CLARIX, hands-free",
    description:
      "Advanced Voice Mode lets you have a real-time spoken conversation with CLARIX. Ask questions out loud and hear a spoken response — perfect for “read back my action items” or “what did Sarah commit to.”",
    bullets: ["Real-time spoken responses", "Hands-free recall", "Great for driving or walking"],
    visual: <VoiceVisual />,
  },
  {
    eyebrow: "Capture",
    title: "Three ways to capture a meeting",
    description:
      "Record directly in-browser with mic and system audio, upload any audio or video file, or send a CLARIX bot to automatically join your Zoom, Google Meet, or Microsoft Teams call.",
    bullets: ["In-browser recording", "File upload", "Auto-join meeting bot"],
    visual: <RecordingVisual />,
  },
  {
    eyebrow: "Audio library",
    title: "Every recording, saved and searchable",
    description:
      "All past recordings are stored and searchable. Replay any meeting, jump to a moment, or reprocess a recording with a different meeting type if CLARIX should look at it through a new lens.",
    bullets: ["Searchable archive", "Replay any meeting", "Reprocess with a different type"],
    visual: <AudioLibraryVisual />,
  },
  {
    eyebrow: "Integrations",
    title: "Connected to the tools teams already use",
    description:
      "CLARIX links to your calendar to see upcoming meetings and attach recordings, sends summaries by email, posts to Slack, creates structured pages in Notion, turns action items into Linear issues, and logs notes and tasks in Salesforce and HubSpot.",
    bullets: ["Calendar, email, Slack, Notion, Linear", "Salesforce & HubSpot CRM", "Automatic, two-way sync"],
    visual: <IntegrationsVisual />,
  },
  {
    eyebrow: "Analytics",
    title: "Insight into how your team meets",
    description:
      "Speaker talk-time breakdowns, sentiment over time, engagement scoring, and filler-word tracking per meeting — plus an org-wide analytics dashboard to spot trends across the team.",
    bullets: ["Talk-time & engagement scoring", "Sentiment over time", "Org-wide dashboard"],
    visual: <AnalyticsVisual />,
  },
  {
    eyebrow: "Pro Verticals",
    title: "Compliance-aware outputs for regulated industries",
    description:
      "Specialized outputs for healthcare, legal, and financial teams: SOAP notes and ICD-10 suggestions for clinical visits, deposition action items and case timelines for legal, and compliance flags and suitability notes for financial advisory meetings.",
    bullets: ["Healthcare: SOAP notes & ICD-10", "Legal: admissions & case timeline", "Financial: compliance & suitability"],
    visual: <VerticalsVisual />,
  },
];

export default function FeaturesPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden noise-overlay">
      <SiteNav />
      <PageHero
        eyebrow="Features"
        title="Everything you need after the meeting ends"
        description="CLARIX does the work that used to fall through the cracks — capturing the conversation, understanding it, and turning it into something your team can act on."
      />

      <section className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {blocks.map((block, i) => (
          <FeatureBlock key={block.title} index={i + 1} flip={i % 2 === 1} {...block} />
        ))}
      </section>

      <CtaBand
        title="See it on your own meetings"
        description="Start free and watch CLARIX turn your next call into structured, shareable output."
        primary={{ label: "Start Free", href: "/signup" }}
        secondary={{ label: "See Pricing", href: "/pricing" }}
      />
      <SiteFooter />
    </main>
  );
}
