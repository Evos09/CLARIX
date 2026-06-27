import { SettingsClient } from "@/components/settings/SettingsClient";
import { IntegrationsClient } from "@/components/settings/IntegrationsClient";
import { IntegrationsHub } from "@/components/settings/IntegrationsHub";
import { CRMConnectionCard } from "@/components/settings/CRMConnectionCard";
import { DesktopAppCard } from "@/components/settings/DesktopAppCard";
import { DigestCard } from "@/components/settings/DigestCard";
import { AutoJoinCard } from "@/components/settings/AutoJoinCard";
import { prisma } from "@/lib/prisma";
import { getOrCreateContext, hasDb } from "@/lib/auth";

export const metadata = { title: "Workspace Settings" };
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
    <main className="flex-1 p-4 md:p-6">
      <SettingsClient initialName={name} />
      <h2 className="mb-3 mt-8 text-lg font-semibold">Integrations</h2>
      <IntegrationsClient />
      <h2 className="mb-3 mt-8 text-lg font-semibold">Push integrations</h2>
      <IntegrationsHub />
      <div className="mt-4"><CRMConnectionCard /></div>
      <h2 className="mb-3 mt-8 text-lg font-semibold">Automation</h2>
      <div className="space-y-4">
        <AutoJoinCard />
        <DigestCard />
      </div>
      <div className="mt-4"><DesktopAppCard /></div>
    </main>
  );
}
