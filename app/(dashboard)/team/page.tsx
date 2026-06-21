import { TopNav } from "@/components/layout/TopNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext, hasDb, hasClerk } from "@/lib/auth";

export const metadata = { title: "Team" };
export const dynamic = "force-dynamic";

const ROLE: Record<string, string> = {
  ADMIN: "bg-teal-100 text-teal-700 ring-teal-600/20",
  MEMBER: "bg-blue-100 text-blue-700 ring-blue-600/20",
  VIEWER: "bg-gray-100 text-gray-600 ring-gray-500/20",
};

export default async function TeamPage() {
  let members: { id: string; email: string; name: string | null; role: string }[] = [];
  if (hasDb) {
    const ctx = await getOrCreateContext();
    if (ctx) {
      members = await prisma.user.findMany({
        where: { orgId: ctx.orgId },
        select: { id: true, email: true, name: true, role: true },
        orderBy: { role: "asc" },
      });
    }
  }

  return (
    <>
      <TopNav title="Team" />
      <main className="flex-1 p-4 md:p-6">
        {members.length === 0 ? (
          <EmptyState icon="Users" title="No members yet" description="Members appear here once they join your organization." />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Members</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border p-0">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="grid size-9 place-items-center rounded-full bg-navy text-xs font-semibold text-teal">
                      {(m.name || m.email).slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{m.name || m.email}</p>
                      <p className="text-xs text-muted-foreground">{m.email}</p>
                    </div>
                  </div>
                  <Badge className={ROLE[m.role] ?? ROLE.MEMBER}>{m.role}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        <p className="mt-4 text-sm text-muted-foreground">
          {hasClerk
            ? "Invite teammates and manage SSO from your Clerk organization."
            : "Connect Clerk to enable invites, roles, and SSO."}
        </p>
      </main>
    </>
  );
}
