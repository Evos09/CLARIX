import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { hasClerk } from "@/lib/auth";
import LenisProvider from "@/components/landing/LenisProvider";
import ChromaticFringe from "@/components/landing/ChromaticFringe";
import TransitionContainer from "@/components/landing/TransitionContainer";
import { SiteFooter } from "@/components/site/site-footer";

export const metadata: Metadata = {
  title: { absolute: "CLARIX — Your AI Assistant for Every Meeting" },
  description: "The AI that handles every meeting you never have time to recap. Transcribe, summarize, and turn any meeting into action.",
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

        {/* Full footer (same one used across the marketing site) */}
        <div className="relative z-10 bg-paper">
          <SiteFooter />
        </div>
      </main>
    </LenisProvider>
  );
}
