import { SectionHeading } from "@/components/site/section-heading";

const steps = [
  {
    number: "I",
    title: "Capture the meeting",
    description:
      "Record in your browser, upload a file, or let a CLARIX bot join your Zoom, Meet, or Teams call automatically.",
  },
  {
    number: "II",
    title: "CLARIX transcribes and analyzes",
    description:
      "Speaker-labeled transcription runs in real time while CLARIX detects the meeting type and reasons over what's said.",
  },
  {
    number: "III",
    title: "Get structured outputs in minutes",
    description:
      "A tailored summary, action items, decisions, and insights — ready to share, export, or push to your tools.",
  },
];

export function HowItWorks() {
  return (
    <section className="relative py-24 lg:py-32 bg-foreground text-background overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 40px, currentColor 40px, currentColor 41px)`,
          }}
        />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        <SectionHeading
          invert
          eyebrow="How it works"
          title={
            <>
              From conversation to clarity
              <br />
              <span className="text-background/50">in three steps</span>
            </>
          }
        />

        <div className="grid md:grid-cols-3 gap-px bg-background/10 border border-background/10 mt-16 rounded-xl overflow-hidden">
          {steps.map((step) => (
            <div key={step.number} className="bg-foreground p-8 lg:p-10">
              <span className="font-display text-5xl text-background/30">{step.number}</span>
              <h3 className="font-display text-2xl mt-6 mb-3">{step.title}</h3>
              <p className="text-background/60 leading-relaxed text-pretty">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
