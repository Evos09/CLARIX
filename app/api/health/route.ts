import { NextResponse } from "next/server";
import { isClaudeConfigured } from "@/lib/claude";
import { isSupabaseConfigured } from "@/lib/supabase";
import { isAssemblyConfigured } from "@/lib/assemblyai";
import { isStripeConfigured } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "clarix",
    integrations: {
      anthropic: isClaudeConfigured(),
      supabase: isSupabaseConfigured(),
      assemblyai: isAssemblyConfigured(),
      stripe: isStripeConfigured(),
      clerk: Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY),
    },
  });
}
