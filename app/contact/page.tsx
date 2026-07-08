import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the CLARIX team — support, sales, and billing questions.",
};

// Set NEXT_PUBLIC_SUPPORT_EMAIL in your environment to use a branded address.
const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "eliptical09@gmail.com";

export default function ContactPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-8 px-6 py-16">
      <div>
        <Link href="/" className="text-sm font-medium text-accent hover:underline">
          ← Back to home
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Get in touch
        </h1>
        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground">
          Questions about CLARIX, pricing, billing, or your account? We read every message and
          typically reply within one business day.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <a
          href={`mailto:${SUPPORT_EMAIL}?subject=CLARIX%20support`}
          className="rounded-xl border border-border bg-card p-5 transition hover:border-accent/40"
        >
          <h2 className="text-sm font-semibold text-foreground">Support &amp; general</h2>
          <p className="mt-1 text-sm text-muted-foreground">Help with your account, uploads, or features.</p>
          <p className="mt-3 text-sm font-medium text-accent">{SUPPORT_EMAIL}</p>
        </a>
        <a
          href={`mailto:${SUPPORT_EMAIL}?subject=CLARIX%20sales`}
          className="rounded-xl border border-border bg-card p-5 transition hover:border-accent/40"
        >
          <h2 className="text-sm font-semibold text-foreground">Sales</h2>
          <p className="mt-1 text-sm text-muted-foreground">Team plans and volume pricing.</p>
          <p className="mt-3 text-sm font-medium text-accent">{SUPPORT_EMAIL}</p>
        </a>
      </div>

      <p className="text-xs text-muted-foreground">
        Already a customer? You can also manage your plan from{" "}
        <Link href="/settings/billing" className="font-medium text-accent hover:underline">
          Settings → Billing
        </Link>
        .
      </p>
    </main>
  );
}
