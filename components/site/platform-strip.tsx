import Link from "next/link";
import { Monitor, Apple, ArrowUpRight } from "lucide-react";

// macOS is built and working but not offered yet — it isn't code-signed, and we
// won't ask anyone to click past a Gatekeeper warning to install something that
// listens to their meetings. Kept visible with a "soon" tag rather than removed,
// so Mac users know it's coming instead of assuming it never will.
const items: { icon: typeof Monitor; label: string; href: string; soon?: boolean }[] = [
  { icon: Monitor, label: "Windows", href: "/download" },
  { icon: Apple, label: "macOS", href: "/download", soon: true },
];

/** Compact "also available on" strip — used on the homepage above the footer. */
export function PlatformStrip() {
  return (
    <section className="max-w-[1200px] mx-auto px-6 lg:px-12 py-12">
      <div className="flex flex-wrap items-center gap-x-7 gap-y-4 rounded-2xl border border-foreground/10 bg-foreground/[0.02] px-6 py-5">
        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Desktop app · floating overlay
        </span>

        {items.map((it) => (
          <Link
            key={it.label}
            href={it.href}
            className="group inline-flex items-center gap-2 text-sm text-foreground/80 hover:text-foreground transition-colors"
          >
            <it.icon className="w-[18px] h-[18px] text-accent" />
            {it.label}
            {it.soon && (
              <span className="rounded-full border border-foreground/15 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                soon
              </span>
            )}
            <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </Link>
        ))}

        <span className="flex-1" />

        <Link
          href="/download"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-accent whitespace-nowrap"
        >
          Get the desktop app
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
