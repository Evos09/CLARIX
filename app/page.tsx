import type { Metadata } from "next";
import { LANDING_HTML } from "@/lib/landingHtml";
import { LandingScript } from "@/components/landing/LandingScript";

export const metadata: Metadata = {
  title: "CLARIX — Your AI Assistant for Every Meeting",
  description: "Transcribe, analyze, and turn any meeting into action — in minutes. Every Meeting. Captured. Understood. Done.",
};

const REVEAL_CSS =
  "@media (prefers-reduced-motion:no-preference){[data-reveal]{opacity:0;transform:translateY(22px);transition:opacity .7s cubic-bezier(.2,.8,.2,1),transform .7s cubic-bezier(.2,.8,.2,1);}[data-reveal].is-in{opacity:1 !important;transform:none !important;}}";

export default function LandingPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: REVEAL_CSS }} />
      <div dangerouslySetInnerHTML={{ __html: LANDING_HTML }} />
      <LandingScript />
    </>
  );
}
