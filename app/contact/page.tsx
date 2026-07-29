import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the CLARIX team — support and billing questions.",
};

const CONTACTS = [
  {
    title: "Support & general",
    desc: "Help with your account, uploads, billing, or anything else.",
    email: "support@clarixmeetings.com",
    subject: "CLARIX support",
  },
  {
    title: "Help & how-to",
    desc: "Questions about setting up or using a feature.",
    email: "help@clarixmeetings.com",
    subject: "CLARIX help",
  },
  {
    title: "Feedback & ideas",
    desc: "Bugs, feature requests, or anything you'd like to see.",
    email: "feedback@clarixmeetings.com",
    subject: "CLARIX feedback",
  },
];

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

      <div className="grid gap-4">
        {CONTACTS.map((c) => (
          <a
            key={c.email}
            href={`mailto:${c.email}?subject=${encodeURIComponent(c.subject)}`}
            className="rounded-xl border border-border bg-card p-5 transition hover:border-accent/40"
          >
            <h2 className="text-sm font-semibold text-foreground">{c.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
            <p className="mt-3 text-sm font-medium text-accent">{c.email}</p>
          </a>
        ))}
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
