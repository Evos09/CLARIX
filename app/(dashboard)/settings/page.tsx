import { TopNav } from "@/components/layout/TopNav";
import { SettingsClient } from "@/components/settings/SettingsClient";
import { IntegrationsClient } from "@/components/settings/IntegrationsClient";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext, hasDb } from "@/lib/auth";

export const metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  let name = "My Organization";
  if (hasDb) {
    const ctx = await getOrCreateContext();
    if (ctx) {
      const org = await prisma.organization.findUnique({ where: { id: ctx.orgId } });
      if (org) name = org.name;
    }
  }
  return (
    <>
      <TopNav title="Settings" />
      <main className="flex-1 p-4 md:p-6">
        <SettingsClient initialName={name} />
        <h2 className="mb-3 mt-8 text-lg font-semibold">Integrations</h2>
        <IntegrationsClient />
      </main>
    </>
  );
}
