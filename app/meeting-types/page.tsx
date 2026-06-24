import type { Metadata } from "next";
import { SiteShell } from "@/components/site/SiteShell";
import { HTML } from "@/lib/site/meetingTypes";

export const metadata: Metadata = {
  title: "Meeting Types",
  description: "20+ meeting types, each with tailored output. One intelligent layer.",
};

export default function Page() {
  return <SiteShell html={HTML} />;
}
