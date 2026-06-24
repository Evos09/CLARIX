import type { Metadata } from "next";
import { SiteShell } from "@/components/site/SiteShell";
import { HTML } from "@/lib/site/landing";

export const metadata: Metadata = {
  title: { absolute: "CLARIX — Your AI Assistant for Every Meeting" },
  description: "The AI that handles every meeting you never have time to recap. Transcribe, summarize, and turn any meeting into action.",
};

export default function Page() {
  return <SiteShell html={HTML} />;
}
