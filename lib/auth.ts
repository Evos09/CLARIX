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

export interface OrgUserContext {
  orgId: string;
  userId: string;
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
    });
    const user = await prisma.user.upsert({
      where: { clerkId: ctx.clerkUserId },
      update: { email: ctx.email },
      create: { clerkId: ctx.clerkUserId, email: ctx.email, role: "ADMIN", orgId: org.id },
    });
    return { orgId: org.id, userId: user.id };
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
