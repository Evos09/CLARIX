import { NextResponse } from "next/server";
import { isClaudeConfigured } from "@/lib/claude";
import { isSupabaseConfigured } from "@/lib/supabase";
import { isAssemblyConfigured } from "@/lib/assemblyai";
import { isStripeConfigured } from "@/lib/stripe";
import { isEmbeddingsConfigured } from "@/lib/embeddings";

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
      // Semantic memory search. False means the vector index is dormant and
      // cross-meeting recall silently falls back to keyword matching, so this
      // is worth being able to check without touching any secret.
      embeddings: isEmbeddingsConfigured(),
    },
  });
}
