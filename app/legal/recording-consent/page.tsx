import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { PageHero } from "@/components/site/page-hero";

export const metadata = {
  title: "Recording Consent",
  description:
    "How call-recording consent laws work, which US states require all-party consent, and what CLARIX does to help you comply.",
};

const ALL_PARTY_STATES = [
  "California",
  "Connecticut",
  "Delaware",
  "Florida",
  "Illinois",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Montana",
  "Nevada",
  "New Hampshire",
  "Oregon",
  "Pennsylvania",
  "Washington",
];

export default function RecordingConsentPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden noise-overlay">
      <SiteNav />

      <PageHero
        eyebrow="Legal"
        title="Recording consent"
        description="What the law requires before a conversation is recorded — and what CLARIX does to help you stay compliant."
      />

      <section className="py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-6 lg:px-12 space-y-10">
          <div className="space-y-4">
            <h2 className="font-display text-2xl">One-party vs. all-party consent</h2>
            <p className="text-muted-foreground leading-relaxed">
              In the United States, call-recording law is set state by state. In{" "}
              <strong className="text-foreground">one-party consent</strong> states, a conversation
              may be recorded as long as one participant (which can be you) consents. In{" "}
              <strong className="text-foreground">all-party consent</strong> states, every
              participant must consent before the recording starts. When participants are in
              different states, the safest practice is to follow the strictest applicable rule.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              States commonly cited as requiring all-party consent include:
            </p>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-muted-foreground sm:grid-cols-3">
              {ALL_PARTY_STATES.map((s) => (
                <li key={s} className="text-sm">{s}</li>
              ))}
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Laws change and several states have nuances (for example, Michigan and Nevada are
              interpreted differently by different courts). This page is general information, not
              legal advice — consult a lawyer for your specific situation.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl">What CLARIX does to help</h2>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground leading-relaxed">
              <li>
                The meeting bot joins calls as a clearly labeled participant named{" "}
                <strong className="text-foreground">&ldquo;CLARIX (Recording)&rdquo;</strong> and posts a chat
                message announcing that the meeting is being recorded and transcribed.
              </li>
              <li>
                In-browser recording requires you to confirm you have permission — including
                participant consent where required — before the record button activates.
              </li>
              <li>Recordings are never made silently or without a visible indicator.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl">Your responsibility</h2>
            <p className="text-muted-foreground leading-relaxed">
              CLARIX provides the notification tools, but{" "}
              <strong className="text-foreground">
                you are responsible for obtaining any legally required consent
              </strong>{" "}
              from meeting participants before recording. Our recommendation, regardless of which
              state you are in: announce the recording verbally at the start of every meeting
              (&ldquo;Heads up — I&rsquo;m recording this with CLARIX so we get a good summary. Everyone okay
              with that?&rdquo;). It takes five seconds, satisfies the strictest standard, and is simply
              good manners.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
