import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How CLARIX collects, uses, and protects your data.",
};

const UPDATED = "June 23, 2026";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Logo href="/" />
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            ← Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-navy">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {UPDATED}</p>

        <div className="mt-8 space-y-8 text-[15px] leading-relaxed text-foreground">
          <section>
            <p className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
              This page summarizes how CLARIX handles your data in plain language. It is a good-faith
              description of current practices, not a substitute for legal advice.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-navy">What we collect</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li><strong>Account details</strong> — your name, email, and organization, managed through our authentication provider.</li>
              <li><strong>Meeting content</strong> — audio or video you upload, the transcripts we generate, and the summaries, action items, and analytics derived from them.</li>
              <li><strong>Usage data</strong> — basic information about how you use the product, to keep it running and improve it.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-navy">How we use it</h2>
            <p>
              We use your content solely to provide the service: transcribing your meetings, generating
              summaries and action items, powering Ask CLARIX, and showing your dashboard and analytics.
              We do not sell your data, and we do not use your meeting content to train our own models.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-navy">Service providers</h2>
            <p>
              To deliver CLARIX we share data with trusted processors strictly as needed: authentication,
              cloud storage and database hosting, speech-to-text transcription, AI summarization, payment
              processing, and transactional email. Each processes data only to perform its function.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-navy">Integrations you choose</h2>
            <p>
              If you connect a calendar, Slack, Notion, Linear, or a CRM, CLARIX accesses only what that
              integration requires and only when you ask it to. Calendar connections are read-only — CLARIX
              never creates, edits, or deletes your events.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-navy">Your choices</h2>
            <p>
              You can delete meetings and your account at any time. Deleting a meeting removes its audio,
              transcript, and derived output. To request access to or deletion of your data, contact your
              CLARIX workspace administrator or reach us at the email associated with your account.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
