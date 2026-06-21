import Link from "next/link";
import { ArrowRight, Sparkles, FileText, Wand2, MessagesSquare, Download } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { buttonVariants } from "@/components/ui/button";
import { MeetingTypeIcon } from "@/components/meetings/MeetingTypeIcon";
import { PricingTable } from "@/components/marketing/PricingTable";
import { GENERAL_TYPES } from "@/lib/meetingTypes";
import { cn } from "@/lib/utils";

const FEATURES = [
  { icon: FileText, title: "Transcription", desc: "Speaker-labeled, auto-language-detected transcripts in minutes." },
  { icon: Sparkles, title: "Auto-detect", desc: "CLARIX recognizes the meeting type and tailors the output." },
  { icon: Wand2, title: "Smart output", desc: "Action items, decisions, and summaries — structured automatically." },
  { icon: MessagesSquare, title: "Ask CLARIX", desc: "Chat with any meeting. “Who owns the Q3 deliverable?”" },
  { icon: Download, title: "Export", desc: "PDF, DOCX, CSV, follow-up emails, and Slack posts in one click." },
];

const PERSONAS = ["Sales Teams", "Product Teams", "Executives", "Agencies", "Healthcare", "Legal"];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <header className="flex h-16 items-center justify-between border-b border-border px-4 md:px-8">
        <Logo />
        <nav className="flex items-center gap-3">
          <Link href="/sign-in" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>Sign in</Link>
          <Link href="/sign-up" className={cn(buttonVariants({ variant: "accent", size: "sm" }))}>
            Try Free
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="bg-navy px-4 py-24 text-center text-white md:px-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-teal">
          <Sparkles className="size-3" /> Every Meeting. Captured. Understood. Done.
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
          Your AI assistant for <span className="text-teal">every meeting</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-slate-300">
          Transcribe, analyze, and turn any meeting into action — in minutes.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/sign-up" className={cn(buttonVariants({ variant: "accent", size: "lg" }))}>
            Try Free — No Credit Card <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* Meeting type grid */}
      <section className="px-4 py-20 md:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-2xl font-semibold md:text-3xl">One assistant for every kind of meeting</h2>
          <p className="mt-2 text-muted-foreground">CLARIX tailors its output to 20+ meeting types.</p>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {GENERAL_TYPES.slice(0, 12).map((t) => (
              <div key={t.id} className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-5">
                <MeetingTypeIcon name={t.icon} className="size-6 text-teal-600" />
                <span className="text-sm font-medium">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-card px-4 py-20 md:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-semibold md:text-3xl">Everything, automatically</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="space-y-2">
                <div className="grid size-10 place-items-center rounded-md bg-teal/10 text-teal-600">
                  <f.icon className="size-5" />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="px-4 py-20 md:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-2xl font-semibold md:text-3xl">Built for every team</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {PERSONAS.map((p) => (
              <span key={p} className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium">
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-surface px-4 py-20 md:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-semibold md:text-3xl">Simple, scalable pricing</h2>
          <p className="mt-2 text-center text-muted-foreground">From free to enterprise — pay per user, per month.</p>
          <div className="mt-10">
            <PricingTable highlight="PRO" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border px-4 py-10 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <Logo />
          <nav className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <Link href="#">Privacy</Link>
            <Link href="#">Terms</Link>
            <Link href="#">HIPAA</Link>
            <Link href="#">Contact</Link>
          </nav>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} CLARIX</p>
        </div>
      </footer>
    </div>
  );
}
