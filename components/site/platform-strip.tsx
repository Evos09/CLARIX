import Link from "next/link";
import { Puzzle, Monitor, Apple, ArrowUpRight } from "lucide-react";

const items = [
  { icon: Puzzle, label: "Chrome", href: "/extension" },
  { icon: Monitor, label: "Windows", href: "/download" },
  { icon: Apple, label: "macOS", href: "/download" },
];

/** Compact "also available on" strip — used on the homepage above the footer. */
export function PlatformStrip() {
  return (
    <section className="max-w-[1200px] mx-auto px-6 lg:px-12 py-12">
      <div className="flex flex-wrap items-center gap-x-7 gap-y-4 rounded-2xl border border-foreground/10 bg-foreground/[0.02] px-6 py-5">
        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Also on
        </span>

        {items.map((it) => (
          <Link
            key={it.label}
            href={it.href}
            className="group inline-flex items-center gap-2 text-sm text-foreground/80 hover:text-foreground transition-colors"
          >
            <it.icon className="w-[18px] h-[18px] text-accent" />
            {it.label}
            <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </Link>
        ))}

        <span className="flex-1" />

        <Link
          href="/download"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-accent whitespace-nowrap"
        >
          Get the apps
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
