import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { hasClerk } from "@/lib/auth";
import LenisProvider from "@/components/landing/LenisProvider";
import ChromaticFringe from "@/components/landing/ChromaticFringe";
import TransitionContainer from "@/components/landing/TransitionContainer";
import { SiteFooter } from "@/components/site/site-footer";
import { PlatformStrip } from "@/components/site/platform-strip";

export const metadata: Metadata = {
  // Leads on memory, not note-taking. "AI meeting notes" is a saturated search
  // term owned by funded incumbents; answering from meetings months old, with a
  // jump to the second it was said, is the thing none of them do.
  title: { absolute: "CLARIX — The AI that remembers every meeting" },
  description:
    "Ask what was decided months ago and get an answer mid-call, with a link to the exact second it was said. CLARIX searches every meeting you've recorded — notes, decisions and action items included.",
};

export default async function Home() {
  if (hasClerk) {
    const { userId } = await auth();
    if (userId) redirect("/dashboard");
  }
  return (
    <LenisProvider>
      <main className="relative min-h-screen overflow-x-hidden bg-paper text-ink">
        {/* Absolute SVG filter overlay definitions */}
        <ChromaticFringe />

        {/* Scroll-driven Transition Core */}
        <TransitionContainer />

        {/* Compact "also on" platform strip + full footer */}
        <div className="relative z-10 bg-paper">
          <PlatformStrip />
          <SiteFooter />
        </div>
      </main>
    </LenisProvider>
  );
}
