import { TopNav } from "@/components/layout/TopNav";
import { PageHeader, Accent } from "@/components/layout/PageHeader";
import { SettingsTabs } from "@/components/settings/SettingsTabs";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopNav title="Settings" />
      <div className="px-4 pt-6 md:px-8">
        <PageHeader
          eyebrow="Settings"
          title={<>Your workspace, <Accent>tuned</Accent>.</>}
          description="Organization, integrations, automation, billing, and your account — all in one place."
        />
      </div>
      <SettingsTabs />
      {children}
    </>
  );
}
