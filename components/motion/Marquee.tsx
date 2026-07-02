import { meetingTypes } from "@/lib/site-data";

/** Awwwards-style oversized type strip: meeting types scrolling on a tilted ink band. */
export function Marquee() {
  const names = meetingTypes.map((t) => t.name);
  const row = [...names, ...names]; // two copies = seamless -50% loop

  return (
    <section
      aria-hidden
      className="relative overflow-hidden border-y border-foreground/10 bg-foreground text-background py-5 lg:py-6 -rotate-1 w-[104%] -ml-[2%] my-6"
    >
      <div className="flex whitespace-nowrap motion-marquee">
        {row.map((name, i) => (
          <span
            key={i}
            className="flex items-center shrink-0 font-display text-3xl lg:text-5xl tracking-tight px-8"
          >
            {name}
            <span className="ml-16 inline-block w-2.5 h-2.5 rounded-full bg-accent" />
          </span>
        ))}
      </div>
    </section>
  );
}
