import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-foreground/10">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.4]">
        {[...Array(12)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute w-px bg-foreground/[0.06]"
            style={{ left: `${8.33 * (i + 1)}%`, top: 0, bottom: 0 }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 pt-36 lg:pt-44 pb-16 lg:pb-24">
        <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
          <span className="w-8 h-px bg-foreground/30" />
          {eyebrow}
        </span>
        <h1 className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] tracking-tight text-balance max-w-4xl mb-6">
          {title}
        </h1>
        <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed text-pretty max-w-2xl">
          {description}
        </p>
        {children}
      </div>
    </section>
  );
}
