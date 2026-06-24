import { icons, Check } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon = "Inbox",
  title,
  description,
  actionHref,
  actionLabel,
  variant = "default",
  chips,
}: {
  icon?: string;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  variant?: "default" | "hero";
  chips?: string[];
}) {
  const Icon = icons[icon as keyof typeof icons] ?? icons.Inbox;

  if (variant === "hero") {
    return (
      <div className="relative flex min-h-[360px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-border bg-card px-6 py-16 text-center">
        {/* pulsing rings */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 size-[340px] -translate-x-1/2 -translate-y-1/2">
          <span
            className="clarix-ring absolute inset-0 rounded-full border-[1.5px] border-teal/20"
            style={{ animation: "clarix-ring 3s ease-out infinite" }}
          />
          <span
            className="clarix-ring absolute inset-0 rounded-full border-[1.5px] border-teal/20"
            style={{ animation: "clarix-ring 3s ease-out infinite", animationDelay: "1.5s" }}
          />
        </div>

        {/* floating gradient tile */}
        <div
          className="clarix-float relative mb-6 grid size-[74px] place-items-center rounded-[20px] text-white"
          style={{ background: "linear-gradient(135deg,#6d28d9,#0b0b14)", animation: "clarix-float 4s ease-in-out infinite" }}
        >
          <Icon className="size-7" />
        </div>

        <h3 className="relative text-2xl font-extrabold tracking-tight text-navy">{title}</h3>
        <p className="relative mt-2 max-w-sm text-[15px] leading-relaxed text-muted-foreground">{description}</p>

        {actionHref && actionLabel && (
          <Link
            href={actionHref}
            className="clarix-glow relative mt-6 inline-flex items-center gap-2 rounded-xl bg-teal px-7 py-3.5 text-base font-bold text-white"
            style={{ animation: "clarix-glow 3.2s ease-in-out infinite" }}
          >
            {actionLabel}
          </Link>
        )}

        {chips && chips.length > 0 && (
          <div className="relative mt-8 flex flex-wrap justify-center gap-4">
            {chips.map((c) => (
              <span key={c} className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
                <Check className="size-3.5 text-teal-600" strokeWidth={3} />
                {c}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <div
        className="mb-4 grid size-12 place-items-center rounded-xl text-white"
        style={{ background: "linear-gradient(135deg,#6d28d9,#0b0b14)" }}
      >
        <Icon className="size-6" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {actionHref && actionLabel && (
        <Link href={actionHref} className={cn(buttonVariants({ variant: "accent" }), "mt-5")}>
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
