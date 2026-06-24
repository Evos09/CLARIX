import type { Metadata } from "next";
import { SiteShell } from "@/components/site/SiteShell";
import { HTML } from "@/lib/site/pricing";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple pricing that scales with your team. Start free.",
};

export default function Page() {
  return <SiteShell html={HTML} />;
}
