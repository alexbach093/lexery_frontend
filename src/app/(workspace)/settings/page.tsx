import { redirect } from 'next/navigation';

import { getSettingsPath } from '@/lib/app-routes';

export default function SettingsRootPage() {
  redirect(getSettingsPath('general'));
}
