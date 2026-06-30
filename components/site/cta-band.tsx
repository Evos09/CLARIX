import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CtaBand({
  title = "Start Free — no credit card required",
  description = "Get your first structured meeting summary in minutes. Every signup includes a 14-day Pro trial.",
  primary = { label: "Start Free", href: "/signup" },
  secondary,
}: {
  title?: string;
  description?: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
}) {
  return (
    <section className="relative py-24 lg:py-32 border-t border-foreground/10 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.4]">
        {[...Array(12)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute w-px bg-foreground/[0.06]"
            style={{ left: `${8.33 * (i + 1)}%`, top: 0, bottom: 0 }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-12 text-center">
        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-tight text-balance mb-6">
          {title}
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed text-pretty max-w-xl mx-auto mb-10">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="bg-accent hover:bg-accent/90 text-background px-8 h-14 text-base rounded-full group"
          >
            <Link href={primary.href}>
              {primary.label}
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          {secondary && (
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-14 px-8 text-base rounded-full border-foreground/20 hover:bg-foreground/5"
            >
              <Link href={secondary.href}>{secondary.label}</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
