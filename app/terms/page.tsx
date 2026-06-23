import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of CLARIX.",
};

const UPDATED = "June 23, 2026";

export default function TermsPage() {
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
        <h1 className="text-3xl font-extrabold tracking-tight text-navy">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {UPDATED}</p>

        <div className="mt-8 space-y-8 text-[15px] leading-relaxed text-foreground">
          <section>
            <p className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
              This is a plain-language summary of the terms for using CLARIX. It is provided in good faith
              and is not a substitute for legal advice.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-navy">Using CLARIX</h2>
            <p>
              CLARIX transcribes and analyzes meetings you upload or record. You may use it for lawful
              purposes and only with content you have the right to process. You are responsible for
              obtaining any consents required to record or transcribe a meeting in your jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-navy">Your content</h2>
            <p>
              You retain ownership of the meetings you upload and the output CLARIX generates for you. You
              grant us the limited rights needed to process your content and provide the service.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-navy">Plans and billing</h2>
            <p>
              The Free plan includes a monthly meeting allowance. Paid plans add capacity and features and
              are billed through our payment provider. You can change or cancel your plan at any time; the
              current plan tiers and what they include are shown on the pricing and billing pages.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-navy">AI-generated output</h2>
            <p>
              Summaries, action items, and answers are produced by automated models and may contain errors.
              Review important details against the original recording before relying on them.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-navy">Availability and changes</h2>
            <p>
              We work to keep CLARIX available and accurate, but the service is provided &ldquo;as is&rdquo;
              without warranties. We may update these terms; material changes will be reflected by the
              &ldquo;last updated&rdquo; date above.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-navy">Contact</h2>
            <p>
              Questions about these terms? Reach your CLARIX workspace administrator or contact us at the
              email associated with your account.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
