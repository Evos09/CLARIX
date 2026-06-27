import type { Metadata } from "next";
import { SiteShell } from "@/components/site/SiteShell";
import { HTML } from "@/lib/site/landing";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { hasClerk } from "@/lib/auth";

export const metadata: Metadata = {
  title: { absolute: "CLARIX — Your AI Assistant for Every Meeting" },
  description: "The AI that handles every meeting you never have time to recap. Transcribe, summarize, and turn any meeting into action.",
};

export default async function Page() {
  if (hasClerk) {
    const { userId } = await auth();
    if (userId) {
      redirect("/dashboard");
    }
  }

  return <SiteShell html={HTML} />;
}
