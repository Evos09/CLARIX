import type { Metadata } from "next";
import { SiteShell } from "@/components/site/SiteShell";
import { HTML } from "@/lib/site/features";

export const metadata: Metadata = {
  title: "Features",
  description: "Transcription, summaries, Ask CLARIX, Voice Mode, recording, integrations, analytics and Pro Verticals.",
};

export default function Page() {
  return <SiteShell html={HTML} />;
}
