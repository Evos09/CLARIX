import type { Metadata } from "next";
import { SiteShell } from "@/components/site/SiteShell";
import { HTML } from "@/lib/site/blog";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Blog",
  description: "Product updates, tips, and thinking on AI for meetings.",
};

export default function Page() {
  notFound();
  // return <SiteShell html={HTML} />;
}
