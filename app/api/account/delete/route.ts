import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext, getCurrentOrgUser, hasClerk } from "@/lib/auth";
import { getSupabaseAdmin, AUDIO_BUCKET, isSupabaseConfigured } from "@/lib/supabase";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export const runtime = "nodejs";
export const maxDuration = 120;

/** Best-effort: revoke Google OAuth grants so tokens die with the account. */
async function revokeGoogleTokens(userId: string) {
  try {
    const { decryptToken } = await import("@/lib/crypto");
    const conns = [
      await prisma.emailConnection.findUnique({ where: { userId } }),
      await prisma.calendarConnection.findUnique({ where: { userId } }),
    ];
    for (const c of conns) {
      const token = c && "refreshToken" in c ? c.refreshToken : null;
      if (!token) continue;
      await fetch(
        `https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(decryptToken(token))}`,
        { method: "POST" },
      ).catch(() => {});
    }
  } catch {
    /* best-effort — rows are deleted by cascade regardless */
  }
}

/** Best-effort: remove the meetings' audio files from Supabase Storage. */
async function deleteAudioFiles(paths: string[]) {
  if (!isSupabaseConfigured() || paths.length === 0) return;
  const sb = getSupabaseAdmin();
  for (let i = 0; i < paths.length; i += 100) {
    await sb.storage.from(AUDIO_BUCKET).remove(paths.slice(i, i + 100)).then(
      () => {},
      () => {},
    );
  }
}

/** Best-effort: cancel any active Stripe subscriptions for the org. */
async function cancelStripe(stripeId: string | null) {
  if (!stripeId || !isStripeConfigured()) return;
  try {
    const subs = await getStripe().subscriptions.list({ customer: stripeId, status: "active" });
    for (const s of subs.data) {
      await getStripe().subscriptions.cancel(s.id).catch(() => {});
    }
  } catch {
    /* best-effort */
  }
}

export async function DELETE() {
  const authCtx = await getAuthContext();
  const me = await getCurrentOrgUser();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const memberCount = await prisma.user.count({ where: { orgId: me.orgId } });
  const soleMember = memberCount <= 1;

  // Collect audio paths before the rows cascade away.
  const meetings = await prisma.meeting.findMany({
    where: soleMember ? { orgId: me.orgId } : { userId: me.id },
    select: { storagePath: true },
  });
  const paths = meetings.map((m) => m.storagePath).filter((p): p is string => Boolean(p));

  await revokeGoogleTokens(me.id);
  await deleteAudioFiles(paths);

  if (soleMember) {
    await cancelStripe(me.org.stripeId);
    // Cascades: users, meetings (+chunks, action items, comments, chat,
    // analytics, bots, exports), templates, global chat sessions.
    await prisma.organization.delete({ where: { id: me.orgId } });
  } else {
    // Multi-member workspace: remove only this user and their meetings.
    await prisma.user.delete({ where: { id: me.id } });
  }

  // Delete the Clerk identity last so the request stays authenticated above.
  if (hasClerk && authCtx) {
    try {
      const clerk = await clerkClient();
      await clerk.users.deleteUser(authCtx.clerkUserId);
    } catch (e) {
      console.error("Clerk user deletion failed (DB data already removed):", e);
    }
  }

  // Compliance log — ids only, no PII.
  console.log(
    `[account-deletion] org=${me.orgId} user=${me.id} soleMember=${soleMember} audioFiles=${paths.length} at=${new Date().toISOString()}`,
  );

  return NextResponse.json({ deleted: true, scope: soleMember ? "organization" : "user" });
}
