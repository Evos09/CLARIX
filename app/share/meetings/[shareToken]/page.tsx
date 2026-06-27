import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { PublicChecklist } from "@/components/meetings/PublicChecklist";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ shareToken: string }> };

export async function generateMetadata({ params }: Params) {
  const { shareToken } = await params;
  const meeting = await prisma.meeting.findUnique({
    where: { shareToken },
    select: { title: true },
  });
  return { title: meeting?.title ? `${meeting.title} — Shared Action Items` : "Shared Checklist" };
}

export default async function SharedChecklistPage({ params }: Params) {
  const { shareToken } = await params;
  if (!shareToken) notFound();

  const meeting = await prisma.meeting.findUnique({
    where: { shareToken },
    include: {
      actionItemRecords: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!meeting) notFound();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Header/Brand */}
      <header className="border-b border-border bg-surface px-6 py-4.5">
        <div className="mx-auto max-w-3xl flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 font-semibold tracking-tight">
            <svg width="28" height="28" viewBox="0 0 32 32" role="img" aria-label="CLARIX">
              <rect width="32" height="32" rx="8" fill="#6D28D9" />
              <path d="M22.89 10.21 A9 9 0 1 0 22.89 21.79" fill="none" stroke="#FAFAF7" strokeWidth="5" strokeLinecap="round" />
            </svg>
            <span className="text-lg">CLAR<span className="text-teal">IX</span></span>
          </Link>
          <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1.5 rounded-full font-semibold">
            🔗 Public Share Page
          </span>
        </div>
      </header>

      {/* Main Checklist Container */}
      <main className="flex-1 mx-auto w-full max-w-3xl px-6 py-10 space-y-8">
        <header className="space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-teal/20 bg-teal/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-600">
            <span className="size-1.5 rounded-full bg-teal" /> Action Items
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
            {meeting.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            Meeting held on {format(meeting.createdAt, "MMMM d, yyyy")}
          </p>
        </header>

        {/* Interactive Public Checklist */}
        <PublicChecklist initialActionItems={meeting.actionItemRecords} shareToken={shareToken} />

        {/* Viral Conversion Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-teal/20 bg-gradient-to-br from-teal/5 to-teal/10 p-6 sm:p-8 space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-teal-600">Free AI Assistant</span>
            <h3 className="text-lg font-bold text-navy">Never take meeting notes manually again.</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
              CLARIX automatically joins your calendar events (Zoom/Meet/Teams), transcribes across accents, and extracts beautiful briefs, action items, and timelines like this one in 12 seconds.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center rounded-xl bg-teal px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-600"
            >
              Get Started Free — 3 Meetings/mo
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold hover:bg-muted transition"
            >
              Learn More
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/20 py-6 text-center text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} CLARIX, Inc. All rights reserved.</span>
      </footer>
    </div>
  );
}
