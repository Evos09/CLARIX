import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

export const metadata: Metadata = {
  title: "Security",
  description: "How CLARIX protects your meetings and data.",
};

const UPDATED = "June 23, 2026";

export default function SecurityPage() {
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
        <h1 className="text-3xl font-extrabold tracking-tight text-navy">Security</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {UPDATED}</p>

        <div className="mt-8 space-y-8 text-[15px] leading-relaxed text-foreground">
          <section>
            <p className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
              This page describes how CLARIX protects your data in plain language. We aim to be accurate
              and we will not claim certifications we do not hold.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-navy">Encryption</h2>
            <p>
              Traffic to CLARIX is served over HTTPS (TLS), and your meeting audio, transcripts, and
              derived output are stored with encryption at rest by our cloud storage and database
              providers. Integration tokens are additionally encrypted in our application before storage.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-navy">Your data, your control</h2>
            <p>
              You own your meetings and the output CLARIX generates. You can delete a meeting at any time,
              which removes its audio, transcript, and derived data. We do not sell your data, and we do
              not use your meeting content to train our own models.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-navy">Subprocessors</h2>
            <p>
              To deliver the service we rely on trusted providers for authentication, cloud hosting and
              storage, speech-to-text transcription, AI summarization, payments, and transactional email.
              Each processes data only to perform its function on our behalf.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-navy">Access &amp; isolation</h2>
            <p>
              Data is scoped to your workspace and only accessible to authenticated members of that
              workspace. Calendar connections are read-only — CLARIX never creates, edits, or deletes
              your events.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-navy">Compliance requests</h2>
            <p>
              CLARIX is an early-stage product, and this page describes{" "}
              <strong>everything we currently hold</strong> — we don&rsquo;t claim certifications or
              attestations anywhere on this site. If your organization has a specific security review,
              data-processing agreement, or compliance requirement before adopting CLARIX, contact us
              and we&rsquo;ll tell you plainly what we can and can&rsquo;t support today.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-navy">Reporting a vulnerability</h2>
            <p>
              If you believe you&rsquo;ve found a security issue, please reach out to your CLARIX
              workspace administrator or the email associated with your account so we can investigate.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
