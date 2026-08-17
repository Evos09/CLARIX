import { NextResponse } from "next/server";
import { z } from "zod";
import { format as fmtDate } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext, noContext } from "@/lib/auth";
import { getOrgPlan } from "@/lib/plan";
import { getMeetingType } from "@/lib/meetingTypes";
import { isResendConfigured, sendHtml } from "@/lib/email";
import { meetingEmailHtml } from "@/lib/emailTemplates";
import type { BaseOutput } from "@/lib/outputTypes";

type Params = { params: Promise<{ id: string }> };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const Body = z.object({
  recipients: z.array(z.string()).min(1).max(20),
  type: z.enum(["SUMMARY", "ACTION_ITEMS", "FULL_REPORT"]),
});

export async function POST(req: Request, { params }: Params) {
  const { id } = await params;
  const ctx = await getOrCreateContext();
  if (!ctx) return noContext();

  const plan = await getOrgPlan(ctx.orgId);
  if (plan.id === "FREE") return NextResponse.json({ error: "Upgrade to send meeting emails." }, { status: 403 });
  if (!isResendConfigured()) return NextResponse.json({ error: "Email not configured (RESEND_API_KEY)" }, { status: 503 });

  const meeting = await prisma.meeting.findFirst({ where: { id, orgId: ctx.orgId } });
  if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const output = (meeting.structuredOutput as unknown as BaseOutput | null) ?? null;
  if (!output) return NextResponse.json({ error: "No analysis to send yet." }, { status: 409 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const recipients = parsed.data.recipients.map((r) => r.trim()).filter(Boolean);
  if (recipients.some((r) => !EMAIL_RE.test(r))) {
    return NextResponse.json({ error: "One or more email addresses are invalid." }, { status: 400 });
  }

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { subject, html } = meetingEmailHtml({
    type: parsed.data.type,
    title: meeting.title,
    typeLabel: getMeetingType(meeting.meetingType).label,
    date: fmtDate(meeting.createdAt, "MMM d, yyyy"),
    output,
    url: `${base}/meetings/${id}`,
  });

  try {
    const { id: messageId } = await sendHtml({ to: recipients, subject, html });
    await prisma.emailSend.create({
      data: { meetingId: id, userId: ctx.userId, recipients, subject, type: parsed.data.type },
    });
    return NextResponse.json({ sent: true, messageId });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Send failed" }, { status: 500 });
  }
}
