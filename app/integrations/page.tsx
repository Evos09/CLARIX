import type { Metadata } from "next";
import { SiteShell } from "@/components/site/SiteShell";
import { HTML } from "@/lib/site/integrations";

export const metadata: Metadata = {
  title: "Integrations",
  description: "CLARIX plays nicely with Zoom, Meet, Teams, Slack, Notion, your CRM and more.",
};

export default function Page() {
  return <SiteShell html={HTML} />;
}
