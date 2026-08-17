import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext, noContext } from "@/lib/auth";
import { getOrgPlan } from "@/lib/plan";
import { decryptToken, encryptToken } from "@/lib/crypto";
import { pushToSalesforce, refreshSalesforce } from "@/lib/crm/salesforce";
import { pushToHubSpot, refreshHubSpot } from "@/lib/crm/hubspot";
import type { BaseOutput } from "@/lib/outputTypes";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const ctx = await getOrCreateContext();
  if (!ctx) return noContext();
  const syncs = await prisma.cRMSync.findMany({ where: { meetingId: id }, orderBy: { syncedAt: "desc" } });
  return NextResponse.json(syncs);
}

export async function POST(_req: Request, { params }: Params) {
  const { id } = await params;
  const ctx = await getOrCreateContext();
  if (!ctx) return noContext();
  const plan = await getOrgPlan(ctx.orgId);
  if (plan.id === "FREE") return NextResponse.json({ error: "Upgrade to push to your CRM." }, { status: 403 });

  const conn = await prisma.cRMConnection.findUnique({ where: { userId: ctx.userId } });
  if (!conn) return NextResponse.json({ error: "Connect a CRM in Settings first." }, { status: 409 });
  const meeting = await prisma.meeting.findFirst({ where: { id, orgId: ctx.orgId } });
  if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const output = (meeting.structuredOutput as unknown as BaseOutput | null) ?? null;
  if (!output) return NextResponse.json({ error: "No analysis to push yet." }, { status: 409 });

  let accessToken = decryptToken(conn.accessToken);
  let instanceUrl = conn.instanceUrl ?? "";

  try {
    if (conn.expiresAt < new Date() && conn.refreshToken) {
      if (conn.provider === "SALESFORCE") {
        const t = await refreshSalesforce(decryptToken(conn.refreshToken));
        accessToken = t.accessToken; instanceUrl = t.instanceUrl;
        await prisma.cRMConnection.update({ where: { userId: ctx.userId }, data: { accessToken: encryptToken(t.accessToken), instanceUrl: t.instanceUrl, expiresAt: t.expiresAt } });
      } else {
        const t = await refreshHubSpot(decryptToken(conn.refreshToken));
        accessToken = t.accessToken;
        await prisma.cRMConnection.update({ where: { userId: ctx.userId }, data: { accessToken: encryptToken(t.accessToken), expiresAt: t.expiresAt } });
      }
    }

    let externalId = "";
    let recordType = "NOTE";
    if (conn.provider === "SALESFORCE") {
      const r = await pushToSalesforce(accessToken, instanceUrl, meeting.title, output);
      externalId = r.activityId; recordType = "ACTIVITY";
    } else {
      const r = await pushToHubSpot(accessToken, meeting.title, output);
      externalId = r.noteId; recordType = "NOTE";
    }
    await prisma.cRMSync.create({ data: { meetingId: id, userId: ctx.userId, provider: conn.provider, externalId, recordType } });
    return NextResponse.json({ success: true, provider: conn.provider, externalId });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "CRM push failed" }, { status: 500 });
  }
}
