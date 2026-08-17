import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext, noContext } from "@/lib/auth";
import { newWebhookSecret, sign } from "@/lib/push/webhook";

export const dynamic = "force-dynamic";

// GET: list this user's webhook endpoints (secret included so the owner can copy it).
export async function GET() {
  const ctx = await getOrCreateContext();
  if (!ctx) return noContext();
  const hooks = await prisma.webhookEndpoint.findMany({
    where: { userId: ctx.userId },
    orderBy: { createdAt: "asc" },
    select: { id: true, url: true, label: true, enabled: true, secret: true, lastFiredAt: true, lastStatus: true },
  });
  return NextResponse.json({ hooks });
}

const CreateBody = z.object({
  url: z.string().url().refine((u) => u.startsWith("https://"), "URL must be https://"),
  label: z.string().max(80).optional(),
});

// POST: create a new endpoint.
export async function POST(req: Request) {
  const ctx = await getOrCreateContext();
  if (!ctx) return noContext();
  const parsed = CreateBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const hook = await prisma.webhookEndpoint.create({
    data: {
      userId: ctx.userId,
      url: parsed.data.url,
      label: parsed.data.label?.trim() || null,
      secret: newWebhookSecret(),
    },
    select: { id: true, url: true, label: true, enabled: true, secret: true, lastFiredAt: true, lastStatus: true },
  });
  return NextResponse.json({ hook });
}

const PatchBody = z.object({
  id: z.string(),
  action: z.enum(["toggle", "test"]),
});

// PATCH: enable/disable, or send a test ping.
export async function PATCH(req: Request) {
  const ctx = await getOrCreateContext();
  if (!ctx) return noContext();
  const parsed = PatchBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const hook = await prisma.webhookEndpoint.findFirst({ where: { id: parsed.data.id, userId: ctx.userId } });
  if (!hook) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (parsed.data.action === "toggle") {
    const updated = await prisma.webhookEndpoint.update({
      where: { id: hook.id },
      data: { enabled: !hook.enabled },
      select: { id: true, enabled: true },
    });
    return NextResponse.json({ hook: updated });
  }

  // test: deliver a sample ping and report the resulting status.
  const body = JSON.stringify({
    event: "ping",
    message: "Test delivery from CLARIX",
    firedAt: new Date().toISOString(),
  });
  let status = 0;
  let ok = false;
  try {
    const res = await fetch(hook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "CLARIX-Webhook/1.0",
        "X-Clarix-Event": "ping",
        "X-Clarix-Signature": sign(hook.secret, body),
      },
      body,
      signal: AbortSignal.timeout(10_000),
    });
    status = res.status;
    ok = res.ok;
  } catch {
    status = 0;
  }
  await prisma.webhookEndpoint
    .update({ where: { id: hook.id }, data: { lastFiredAt: new Date(), lastStatus: status } })
    .catch(() => {});
  return NextResponse.json({ ok, status });
}

// DELETE: remove an endpoint.
export async function DELETE(req: Request) {
  const ctx = await getOrCreateContext();
  if (!ctx) return noContext();
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.webhookEndpoint.deleteMany({ where: { id, userId: ctx.userId } });
  return NextResponse.json({ deleted: true });
}
