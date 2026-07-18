import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Meetings a user may put in a series: own org's or shared with them.
async function accessibleMeetingIds(orgId: string, userId: string, ids: string[]): Promise<string[]> {
  if (!ids.length) return [];
  const rows = await prisma.meeting.findMany({
    where: {
      id: { in: ids },
      OR: [{ orgId }, { collaborators: { some: { userId } } }],
    },
    select: { id: true },
  });
  return rows.map((r) => r.id);
}

const CreateBody = z.object({
  name: z.string().min(1).max(120),
  meetingIds: z.array(z.string()).max(200).default([]),
});

// POST: create a custom series from any hand-picked meetings.
export async function POST(req: Request) {
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const parsed = CreateBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const okIds = await accessibleMeetingIds(ctx.orgId, ctx.userId, parsed.data.meetingIds);
  const series = await prisma.meetingSeries.create({
    data: {
      orgId: ctx.orgId,
      name: parsed.data.name.trim(),
      createdBy: ctx.userId,
      items: { create: okIds.map((meetingId) => ({ meetingId })) },
    },
    select: { id: true, name: true },
  });
  return NextResponse.json({ series }, { status: 201 });
}

const PatchBody = z.object({
  id: z.string(),
  add: z.array(z.string()).max(200).optional(),
  remove: z.array(z.string()).max(200).optional(),
  name: z.string().min(1).max(120).optional(),
});

// PATCH: rename a custom series and/or add/remove meetings.
export async function PATCH(req: Request) {
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const parsed = PatchBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const series = await prisma.meetingSeries.findFirst({ where: { id: parsed.data.id, orgId: ctx.orgId } });
  if (!series) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (parsed.data.name) {
    await prisma.meetingSeries.update({ where: { id: series.id }, data: { name: parsed.data.name.trim() } });
  }
  if (parsed.data.add?.length) {
    const okIds = await accessibleMeetingIds(ctx.orgId, ctx.userId, parsed.data.add);
    await prisma.meetingSeriesItem.createMany({
      data: okIds.map((meetingId) => ({ seriesId: series.id, meetingId })),
      skipDuplicates: true,
    });
  }
  if (parsed.data.remove?.length) {
    await prisma.meetingSeriesItem.deleteMany({
      where: { seriesId: series.id, meetingId: { in: parsed.data.remove } },
    });
  }
  return NextResponse.json({ ok: true });
}

// DELETE ?id=<customSeriesId> deletes a custom series (meetings untouched).
// DELETE ?slug=<autoSlug> hides an auto-detected series for this org.
export async function DELETE(req: Request) {
  const ctx = await getOrCreateContext();
  if (!ctx) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const slug = url.searchParams.get("slug");

  if (id) {
    await prisma.meetingSeries.deleteMany({ where: { id, orgId: ctx.orgId } });
    return NextResponse.json({ deleted: true });
  }
  if (slug) {
    await prisma.dismissedSeries.upsert({
      where: { orgId_slug: { orgId: ctx.orgId, slug } },
      create: { orgId: ctx.orgId, slug },
      update: {},
    });
    return NextResponse.json({ deleted: true });
  }
  return NextResponse.json({ error: "Missing id or slug" }, { status: 400 });
}
