import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext, noContext } from "@/lib/auth";
import { getAccessibleMeeting } from "@/lib/meetingAccess";
import { getOrgPlan } from "@/lib/plan";
import { isResendConfigured, sendHtml } from "@/lib/email";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** List the people a meeting is shared with (owner or any collaborator may view). */
export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const ctx = await getOrCreateContext();
  if (!ctx) return noContext();

  const meeting = await getAccessibleMeeting(id, ctx);
  if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const collaborators = await prisma.meetingCollaborator.findMany({
    where: { meetingId: id },
    orderBy: { createdAt: "asc" },
  });
  const users = await prisma.user.findMany({
    where: { id: { in: collaborators.map((c) => c.userId) } },
    select: { id: true, email: true, name: true },
  });
  const byId = new Map(users.map((u) => [u.id, u]));

  return NextResponse.json({
    isOwner: meeting.orgId === ctx.orgId,
    collaborators: collaborators.map((c) => ({
      userId: c.userId,
      role: c.role,
      email: byId.get(c.userId)?.email ?? "",
      name: byId.get(c.userId)?.name ?? null,
    })),
  });
}

const AddBody = z.object({
  email: z.string().email(),
  role: z.enum(["VIEWER", "EDITOR"]).default("EDITOR"),
});

/** Share a meeting with another CLARIX user by email. Owner-only, paid plans. */
export async function POST(req: Request, { params }: Params) {
  const { id } = await params;
  const ctx = await getOrCreateContext();
  if (!ctx) return noContext();

  // Only the owning org can share a meeting.
  const meeting = await prisma.meeting.findFirst({ where: { id, orgId: ctx.orgId } });
  if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Sharing is a paid-plan feature.
  const plan = await getOrgPlan(ctx.orgId);
  if (plan.id === "FREE") {
    return NextResponse.json(
      { error: "Sharing meetings is available on paid plans. Upgrade to invite teammates." },
      { status: 403 },
    );
  }

  const parsed = AddBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  const email = parsed.data.email.trim().toLowerCase();

  // The invitee must already have a CLARIX account.
  const target = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true },
  });
  if (!target) {
    return NextResponse.json(
      { error: "No CLARIX account uses that email. They need to sign up first." },
      { status: 404 },
    );
  }
  if (target.id === ctx.userId) {
    return NextResponse.json({ error: "That's you — you already have access." }, { status: 400 });
  }

  const collab = await prisma.meetingCollaborator.upsert({
    where: { meetingId_userId: { meetingId: id, userId: target.id } },
    update: { role: parsed.data.role },
    create: { meetingId: id, userId: target.id, role: parsed.data.role, invitedBy: ctx.userId },
  });

  // Best-effort: let the invitee know by email. Never fail the share on this.
  try {
    if (isResendConfigured()) {
      const sharer = await prisma.user.findUnique({ where: { id: ctx.userId }, select: { name: true, email: true } });
      const who = sharer?.name || sharer?.email || "A teammate";
      const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.clarixmeetings.com";
      const link = `${base}/meetings/${id}`;
      const canEditCopy = parsed.data.role === "EDITOR" ? "view and edit" : "view";
      await sendHtml({
        to: [email],
        subject: `${who} shared a meeting with you on CLARIX`,
        html: `<div style="font-family:Inter,Arial,sans-serif;color:#0b0b14;max-width:560px">
      <h2 style="margin:0 0 4px">CLAR<span style="color:#6d28d9">IX</span></h2>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.6">${esc(who)} shared the meeting <strong>${esc(meeting.title)}</strong> with you. You can ${canEditCopy} the transcript, summary, and action items.</p>
      <p style="margin:0 0 20px"><a href="${link}" style="background:#6d28d9;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-size:14px;display:inline-block">Open the meeting →</a></p>
      <p style="margin:0;font-size:12px;color:#6e6e66">If you didn't expect this, you can ignore this email.</p>
    </div>`,
      });
    }
  } catch {
    // notification is best-effort
  }

  return NextResponse.json({ success: true, collaborator: { userId: collab.userId, role: collab.role, email } });
}

/** Remove a collaborator from a meeting. Owner-only. */
export async function DELETE(req: Request, { params }: Params) {
  const { id } = await params;
  const ctx = await getOrCreateContext();
  if (!ctx) return noContext();

  const meeting = await prisma.meeting.findFirst({ where: { id, orgId: ctx.orgId } });
  if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const userId = new URL(req.url).searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  await prisma.meetingCollaborator.deleteMany({ where: { meetingId: id, userId } });
  return NextResponse.json({ removed: true });
}
