import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateContext } from "@/lib/auth";
import { isClaudeConfigured, claudeText, parseJson } from "@/lib/claude";
import { coachingPrompt } from "@/lib/coaching";

const lastCall = new Map<string, number>();
const Body = z.object({
  transcript: z.string().min(1).max(20000),
  meetingType: z.string().default("GENERAL"),
  shownSuggestions: z.array(z.string()).default([]),
});

export async function POST(req: Request) {
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  if (!isClaudeConfigured()) return NextResponse.json({ suggestions: [] });

  const now = Date.now();
  const prev = lastCall.get(ctx.userId) ?? 0;
  if (now - prev < 60000) return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  lastCall.set(ctx.userId, now);

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  try {
    const raw = await claudeText({
      prompt: coachingPrompt(parsed.data.transcript, parsed.data.meetingType, parsed.data.shownSuggestions),
      maxTokens: 200,
      temperature: 0.5,
    });
    const suggestions = parseJson<string[]>(raw);
    return NextResponse.json({ suggestions: Array.isArray(suggestions) ? suggestions.slice(0, 3) : [] });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
