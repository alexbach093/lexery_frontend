import { redirect } from 'next/navigation';

import { SettingsScreen } from '@/components/ui/SettingsScreen';
import { getSettingsPath, getSettingsSectionFromSlug } from '@/lib/app-routes';

type SettingsSectionPageProps = {
  params: Promise<{
    section: string;
  }>;
};

export default async function SettingsSectionPage({ params }: SettingsSectionPageProps) {
  const resolvedParams = await params;
  const activeSection = getSettingsSectionFromSlug(resolvedParams.section);

  if (!activeSection) {
    redirect(getSettingsPath('general'));
  }

  return <SettingsScreen activeSection={activeSection} />;
}
