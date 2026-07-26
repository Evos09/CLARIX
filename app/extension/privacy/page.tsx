import type { Metadata } from "next";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { PageHero } from "@/components/site/page-hero";

export const metadata: Metadata = {
  title: "Chrome Extension Privacy Notice — CLARIX",
  description:
    "What the CLARIX Chrome extension accesses, why, and how your data is handled.",
};

const BODY = `
  <section id="summary">
    <h2>1. What this notice covers</h2>
    <p>This notice explains what the <strong>CLARIX Chrome extension</strong> accesses on your device, what it sends to CLARIX, and why. It supplements our main <a href="/privacy">Privacy Policy</a>, which covers the CLARIX service as a whole and applies here in full.</p>
  </section>

  <section id="what-it-accesses">
    <h2>2. What the extension accesses</h2>
    <p>The extension requests only the permissions it needs to record a meeting tab and send it to your CLARIX account:</p>
    <ul>
      <li><strong>Tab audio capture</strong> — when you press <em>Record</em>, the extension captures the audio playing in the current tab (the meeting). It never captures audio in the background or without an explicit press of Record.</li>
      <li><strong>Microphone (optional)</strong> — if your browser allows it, your microphone is mixed in so your own voice is captured alongside the other participants. This is best-effort; if the mic is blocked, tab audio is still recorded.</li>
      <li><strong>Active tab</strong> — used to identify the tab you chose to record and to read its title for the meeting name.</li>
      <li><strong>Local storage</strong> — a short-lived sign-in token is stored locally in the browser so you don't have to reconnect on every recording.</li>
    </ul>
  </section>

  <section id="what-it-sends">
    <h2>3. What the extension sends to CLARIX</h2>
    <ul>
      <li>The audio you recorded, uploaded over an encrypted (HTTPS) connection to your CLARIX workspace.</li>
      <li>The meeting title (taken from the tab title, which you can edit).</li>
      <li>Your CLARIX sign-in token, used only to authenticate the upload to your own account.</li>
    </ul>
    <p>The extension does <strong>not</strong> collect your browsing history, read other tabs, track you across the web, or send data to anyone other than CLARIX.</p>
  </section>

  <section id="how-its-used">
    <h2>4. How your recording is used</h2>
    <p>Once uploaded, your recording follows the same path as any meeting created on the CLARIX website: it is transcribed, analyzed into structured notes, and stored in your workspace. As stated in our main policy, <strong>your recordings and transcripts are never used to train AI models.</strong></p>
    <p>Processing is carried out by the same subprocessors listed in our <a href="/privacy">Privacy Policy</a> (including AssemblyAI for transcription and Anthropic for analysis).</p>
  </section>

  <section id="control">
    <h2>5. Your control</h2>
    <ul>
      <li>Recording only happens when you press Record, and stops when you press Stop.</li>
      <li>You can delete any meeting — including its audio and transcript — at any time from the CLARIX web app.</li>
      <li>Signing out of the extension clears the stored token from your browser.</li>
      <li>Removing the extension from Chrome removes its access entirely; recordings already saved to your workspace remain until you delete them.</li>
    </ul>
  </section>

  <section id="consent">
    <h2>6. Recording responsibly</h2>
    <p>Laws on recording conversations vary by location, and some require the consent of the people being recorded. You are responsible for recording only where you are permitted to, and for obtaining any consent the law or your organization requires.</p>
  </section>

  <section id="contact">
    <h2>7. Contact</h2>
    <p>Questions about the extension or your data? Reach us through our <a href="/contact">contact page</a>.</p>
  </section>
`;

export default function Page() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <SiteNav />
      <PageHero
        eyebrow="Legal"
        title="Chrome Extension Privacy Notice"
        description="What the CLARIX Chrome extension accesses, why, and how your data is handled."
      />
      <div
        className="max-w-3xl mx-auto px-6 lg:px-12 py-16 [&_section]:mb-8 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:tracking-tight [&_h2]:mt-2 [&_h2]:mb-3 [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:pl-5 [&_ul]:list-disc [&_li]:text-muted-foreground [&_li]:leading-relaxed [&_li]:mt-1 [&_strong]:text-foreground [&_strong]:font-medium [&_em]:text-foreground [&_a]:text-accent [&_a]:underline"
        dangerouslySetInnerHTML={{ __html: BODY }}
      />
      <SiteFooter />
    </main>
  );
}
