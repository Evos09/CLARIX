import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext } from "@/lib/auth";
import { claudeText, parseJson, isClaudeConfigured } from "@/lib/claude";
import type { SeriesNote } from "@/lib/series";
import type { BaseOutput } from "@/lib/outputTypes";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Params = { params: Promise<{ id: string }> };

const Body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("generate") }),
  z.object({ action: z.literal("addNote"), text: z.string().min(1).max(1000) }),
  z.object({ action: z.literal("removeNote"), noteId: z.string() }),
]);

function readNotes(raw: unknown): SeriesNote[] {
  if (!Array.isArray(raw)) return [];
  return (raw as unknown[]).filter(
    (n): n is SeriesNote =>
      typeof n === "object" && n !== null && typeof (n as SeriesNote).id === "string" && typeof (n as SeriesNote).text === "string",
  );
}

export async function POST(req: Request, { params }: Params) {
  const { id } = await params;
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const series = await prisma.meetingSeries.findFirst({
    where: { id, orgId: ctx.orgId },
    include: {
      items: {
        include: {
          meeting: { select: { title: true, createdAt: true, structuredOutput: true } },
        },
      },
    },
  });
  if (!series) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const notes = readNotes(series.notes);

  if (parsed.data.action === "addNote") {
    const next: SeriesNote[] = [...notes, { id: randomUUID(), text: parsed.data.text.trim(), source: "user" }];
    await prisma.meetingSeries.update({ where: { id }, data: { notes: next as unknown as Prisma.InputJsonValue } });
    return NextResponse.json({ notes: next });
  }

  if (parsed.data.action === "removeNote") {
    const { noteId } = parsed.data;
    const next = notes.filter((n) => n.id !== noteId);
    await prisma.meetingSeries.update({ where: { id }, data: { notes: next as unknown as Prisma.InputJsonValue } });
    return NextResponse.json({ notes: next });
  }

  // action === "generate": AI compare/contrast across the series' meetings.
  if (!isClaudeConfigured()) {
    return NextResponse.json({ error: "AI not configured (ANTHROPIC_API_KEY)" }, { status: 503 });
  }
  const meetings = series.items
    .map((i) => i.meeting)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  if (meetings.length < 2) {
    return NextResponse.json({ error: "Add at least 2 meetings to compare." }, { status: 409 });
  }

  const digest = meetings
    .map((m, idx) => {
      const out = (m.structuredOutput as unknown as BaseOutput | null) ?? null;
      const actions = (out?.actionItems ?? [])
        .map((a) => `- ${a.task}${a.owner ? ` (${a.owner})` : ""}`)
        .join("\n");
      return `### Meeting ${idx + 1}: ${m.title} (${m.createdAt.toISOString().slice(0, 10)})
TLDR: ${out?.tldr ?? "(no summary)"}
Decisions:
${(out?.keyDecisions ?? []).map((d) => `- ${d}`).join("\n") || "- none"}
Action items:
${actions || "- none"}`;
    })
    .join("\n\n");

  const prompt = `You are analyzing a series of related meetings called "${series.name}". Compare and contrast them: what changed over time, what stayed the same, recurring themes, decisions that evolved or were reversed, action items that keep reappearing (possible blockers), and momentum (is the series progressing or stalling?).

${digest}

Return ONLY JSON:
{
  "comparison": "<markdown: 2-4 short sections with ### headings comparing/contrasting the meetings — e.g. What changed, What's consistent, Evolving decisions, Watch-outs. Be specific, cite meeting names/dates.>",
  "notes": ["<5-8 short, punchy takeaway notes a team member should remember from this series>"]
}`;

  let comparison: string;
  let aiNotes: string[];
  try {
    const raw = await claudeText({ prompt, maxTokens: 2000, temperature: 0.3 });
    const out = parseJson<{ comparison?: string; notes?: string[] }>(raw);
    comparison = typeof out.comparison === "string" ? out.comparison : "";
    aiNotes = Array.isArray(out.notes) ? out.notes.filter((n) => typeof n === "string") : [];
  } catch (err) {
    const message = err instanceof Error ? err.message : "Comparison failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // Replace previous AI notes, keep the user's own.
  const userNotes = notes.filter((n) => n.source === "user");
  const next: SeriesNote[] = [
    ...aiNotes.map((text) => ({ id: randomUUID(), text, source: "ai" as const })),
    ...userNotes,
  ];
  await prisma.meetingSeries.update({
    where: { id },
    data: { comparison, notes: next as unknown as Prisma.InputJsonValue, insightsAt: new Date() },
  });
  return NextResponse.json({ comparison, notes: next });
}
