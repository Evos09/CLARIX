import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isResendConfigured, sendHtml } from "@/lib/email";
import { buildActionItemDigest, digestDue } from "@/lib/digest";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Shared secret check — Bearer header, x-cron-secret header, or ?secret=. */
function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  // Header only. A ?secret= query fallback used to be accepted, but query
  // strings land in access logs, proxy logs, and Referer headers, so the
  // secret leaks everywhere the URL is recorded. LAUNCH.md already documents
  // the Authorization header, which is what the schedulers use.
  return (
    req.headers.get("authorization") === `Bearer ${secret}` ||
    req.headers.get("x-cron-secret") === secret
  );
}

async function run(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isResendConfigured()) return NextResponse.json({ error: "Email not configured (RESEND_API_KEY)" }, { status: 503 });

  const settings = await prisma.emailDigestSettings.findMany({
    where: { enabled: true },
    include: { user: { select: { email: true, name: true, orgId: true } } },
  });

  const now = new Date();
  let sent = 0;
  let skipped = 0;

  for (const s of settings) {
    if (!digestDue(s.frequency, s.lastSentAt, now)) {
      skipped++;
      continue;
    }
    const digest = await buildActionItemDigest(s.user.orgId, s.user.name ?? undefined);
    if (!digest || !s.user.email) {
      skipped++;
      continue;
    }
    try {
      await sendHtml({ to: [s.user.email], subject: `CLARIX · ${digest.subject}`, html: digest.html });
      await prisma.emailDigestSettings.update({ where: { id: s.id }, data: { lastSentAt: now } });
      sent++;
    } catch {
      skipped++;
    }
  }

  return NextResponse.json({ ok: true, evaluated: settings.length, sent, skipped });
}

export async function POST(req: Request) {
  return run(req);
}
export async function GET(req: Request) {
  return run(req);
}
