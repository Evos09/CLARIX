import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext } from "@/lib/auth";
import { getOrgPlan, storageLimitBytes } from "@/lib/plan";
import { getAudioSignedUrl } from "@/lib/transcription";
import { isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const { searchParams } = new URL(req.url);
  const sort = searchParams.get("sort") ?? "newest";
  const search = searchParams.get("search")?.toLowerCase() ?? "";

  const order =
    sort === "oldest" ? { createdAt: "asc" as const }
    : sort === "longest" ? { duration: "desc" as const }
    : sort === "shortest" ? { duration: "asc" as const }
    : { createdAt: "desc" as const };

  const rows = await prisma.meeting.findMany({
    where: {
      orgId: ctx.orgId,
      OR: [{ storagePath: { not: null } }, { audioUrl: { not: null } }],
    },
    orderBy: order,
    select: {
      id: true, title: true, audioFilename: true, audioSize: true, duration: true,
      status: true, createdAt: true, meetingType: true, storagePath: true,
    },
  });

  const filtered = search
    ? rows.filter((r) => r.title.toLowerCase().includes(search) || (r.audioFilename ?? "").toLowerCase().includes(search))
    : rows;

  const items = await Promise.all(
    filtered.map(async (r) => ({
      id: r.id,
      title: r.title,
      audioFilename: r.audioFilename,
      audioSize: r.audioSize,
      duration: r.duration,
      status: r.status,
      createdAt: r.createdAt,
      meetingType: r.meetingType,
      playbackUrl: r.storagePath && isSupabaseConfigured() ? await getAudioSignedUrl(r.storagePath).catch(() => null) : null,
    })),
  );

  const plan = await getOrgPlan(ctx.orgId);
  const used = rows.reduce((sum, r) => sum + (r.audioSize ?? 0), 0);
  return NextResponse.json({ items, storage: { used, limit: storageLimitBytes(plan), plan: plan.id } });
}
