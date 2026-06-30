import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  invert = false,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  invert?: boolean;
}) {
  const muted = invert ? "text-background/50" : "text-muted-foreground";
  const rule = invert ? "bg-background/30" : "bg-foreground/30";

  return (
    <div className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      <span
        className={`inline-flex items-center gap-3 text-sm font-mono ${muted} mb-6 ${
          align === "center" ? "justify-center" : ""
        }`}
      >
        <span className={`w-8 h-px ${rule}`} />
        {eyebrow}
      </span>
      <h2 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-tight text-balance mb-5">
        {title}
      </h2>
      {description && (
        <p className={`text-lg ${muted} leading-relaxed text-pretty max-w-2xl ${align === "center" ? "mx-auto" : ""}`}>
          {description}
        </p>
      )}
    </div>
  );
}
