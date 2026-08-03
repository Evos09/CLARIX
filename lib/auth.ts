import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
export const hasDb = Boolean(process.env.DATABASE_URL);

export interface AuthContext {
  clerkUserId: string;
  clerkOrgId: string | null;
  email: string;
}

/** Returns the current Clerk auth context, or null if Clerk is not configured / not signed in. */
export async function getAuthContext(): Promise<AuthContext | null> {
  if (!hasClerk) return null;
  const { userId, orgId } = await auth();
  if (!userId) return null;
  const user = await currentUser();
  return {
    clerkUserId: userId,
    clerkOrgId: orgId ?? null,
    email: user?.emailAddresses[0]?.emailAddress ?? "",
  };
}

/** Resolves the CLARIX Organization + User rows for the signed-in user, if any. */
export async function getCurrentOrgUser() {
  if (!hasDb) return null;
  const ctx = await getAuthContext();
  if (!ctx) return null;
  return prisma.user.findUnique({
    where: { clerkId: ctx.clerkUserId },
    include: { org: true },
  });
}

const DEMO_ORG = "demo-org";
const DEMO_USER = "demo-user";

export const ANONYMOUS_ORG_CLERK_ID = "anonymous-org";
export const ANONYMOUS_USER_CLERK_ID = "anonymous-user";

export interface OrgUserContext {
  orgId: string;
  userId: string;
}

/** Returns the anonymous/public context for landing page users. */
export async function getOrCreateAnonymousContext(): Promise<OrgUserContext> {
  const org = await prisma.organization.upsert({
    where: { clerkOrgId: ANONYMOUS_ORG_CLERK_ID },
    update: {},
    create: { clerkOrgId: ANONYMOUS_ORG_CLERK_ID, name: "Anonymous Demo Workspace", plan: "FREE" },
  });
  const user = await prisma.user.upsert({
    where: { clerkId: ANONYMOUS_USER_CLERK_ID },
    update: {},
    create: { clerkId: ANONYMOUS_USER_CLERK_ID, email: "anonymous@clarix.local", role: "ADMIN", orgId: org.id },
  });
  return { orgId: org.id, userId: user.id };
}

/**
 * Returns the org + user to attribute work to, creating rows as needed.
 * - With Clerk: maps the signed-in user (auto-provisioning org/user on first use).
 * - Without Clerk (dev): uses a shared demo org/user so the pipeline is usable.
 * Returns null only when the database is not configured.
 */
export async function getOrCreateContext(): Promise<OrgUserContext | null> {
  if (!hasDb) return null;
  const ctx = await getAuthContext();

  if (ctx) {
    const clerkOrgId = ctx.clerkOrgId ?? `personal_${ctx.clerkUserId}`;
    const org = await prisma.organization.upsert({
      where: { clerkOrgId },
      update: {},
      create: { clerkOrgId, name: "My Organization", plan: "FREE" },
      include: { _count: { select: { users: true } } },
    });
    const user = await prisma.user.upsert({
      where: { clerkId: ctx.clerkUserId },
      update: { email: ctx.email },
      // The first user in a workspace owns it; anyone joining later is a MEMBER.
      // Only evaluated on create — existing users keep the role they already have.
      create: { clerkId: ctx.clerkUserId, email: ctx.email, role: org._count.users === 0 ? "ADMIN" : "MEMBER", orgId: org.id },
    });

    // Auto-claim demo meeting if it exists in cookies
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const demoMeetingId = cookieStore.get("clarix_demo_meeting_id")?.value;
      if (demoMeetingId) {
        const meeting = await prisma.meeting.findUnique({
          where: { id: demoMeetingId },
        });
        if (meeting) {
          const anonCtx = await getOrCreateAnonymousContext();
          if (meeting.userId === anonCtx.userId && meeting.orgId === anonCtx.orgId) {
            await prisma.$transaction([
              prisma.meeting.update({
                where: { id: demoMeetingId },
                data: {
                  userId: user.id,
                  orgId: org.id,
                },
              }),
              prisma.actionItem.updateMany({
                where: { meetingId: demoMeetingId },
                data: {
                  orgId: org.id,
                },
              }),
            ]);
          }
        }
      }
    } catch (e) {
      console.error("Auto-claim during context resolution failed:", e);
    }

    return { orgId: org.id, userId: user.id };
  }

  // If Clerk is enabled but we failed to get a user context, do NOT fall back to demo mode (production security)
  if (hasClerk) {
    return null;
  }

  // Clerk is NOT configured. In development that's the normal demo path below.
  // In production it means the Clerk env vars are missing or misnamed — and
  // falling through would drop every visitor into one shared ENTERPRISE
  // workspace, where they would all read and write each other's meetings.
  // Fail closed: a visibly broken deploy beats a silent cross-tenant leak.
  if (process.env.NODE_ENV === "production") {
    console.error(
      "[auth] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set in production — " +
        "refusing to fall back to the shared demo workspace.",
    );
    return null;
  }

  // Dev / demo mode
  const org = await prisma.organization.upsert({
    where: { clerkOrgId: DEMO_ORG },
    update: {},
    create: { clerkOrgId: DEMO_ORG, name: "Demo Workspace", plan: "ENTERPRISE" },
  });
  const user = await prisma.user.upsert({
    where: { clerkId: DEMO_USER },
    update: {},
    create: { clerkId: DEMO_USER, email: "demo@clarix.local", role: "ADMIN", orgId: org.id },
  });
  return { orgId: org.id, userId: user.id };
}

