import type { Metadata } from "next";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { PageHero } from "@/components/site/page-hero";

export const metadata: Metadata = {
  title: "Security",
  description: "How CLARIX protects your meetings and data.",
};

const UPDATED = "June 23, 2026";

export default function SecurityPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <SiteNav />
      <PageHero
        eyebrow="Trust"
        title="Security"
        description="How CLARIX protects your meetings and your data, in plain language."
      />

      <div className="mx-auto max-w-3xl px-6 py-16 lg:px-12">
        <p className="text-sm text-muted-foreground">Last updated: {UPDATED}</p>

        <div className="mt-8 space-y-8 text-[15px] leading-relaxed text-foreground">
          <section>
            <p className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
              This page describes how CLARIX protects your data in plain language. We aim to be accurate
              and we will not claim certifications we do not hold.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-2xl tracking-tight">Encryption</h2>
            <p>
              Traffic to CLARIX is served over HTTPS (TLS), and your meeting audio, transcripts, and
              derived output are stored with encryption at rest by our cloud storage and database
              providers. Integration tokens are additionally encrypted in our application before storage.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-2xl tracking-tight">Your data, your control</h2>
            <p>
              You own your meetings and the output CLARIX generates. You can delete a meeting at any time,
              which removes its audio, transcript, and derived data. We do not sell your data, and we do
              not use your meeting content to train our own models.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-2xl tracking-tight">Subprocessors</h2>
            <p>
              To deliver the service we rely on trusted providers for authentication, cloud hosting and
              storage, speech-to-text transcription, AI summarization, payments, and transactional email.
              Each processes data only to perform its function on our behalf.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-2xl tracking-tight">Access &amp; isolation</h2>
            <p>
              Data is scoped to your workspace and only accessible to authenticated members of that
              workspace. Calendar connections are read-only — CLARIX never creates, edits, or deletes
              your events.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-2xl tracking-tight">Compliance requests</h2>
            <p>
              CLARIX is an early-stage product, and this page describes{" "}
              <strong>everything we currently hold</strong> — we don&rsquo;t claim certifications or
              attestations anywhere on this site. If your organization has a specific security review,
              data-processing agreement, or compliance requirement before adopting CLARIX, contact us
              and we&rsquo;ll tell you plainly what we can and can&rsquo;t support today.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-2xl tracking-tight">Reporting a vulnerability</h2>
            <p>
              If you believe you&rsquo;ve found a security issue, please reach out to your CLARIX
              workspace administrator or the email associated with your account so we can investigate.
            </p>
          </section>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
