export type SettingsNavItem = {
  id: string;
  label: string;
  href: string;
  description?: string;
};

export type SettingsSection = {
  id: string;
  label: string;
  items: SettingsNavItem[];
};

export const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    id: 'main',
    label: 'Основне',
    items: [
      {
        id: 'details',
        label: 'Акаунт',
        href: '/settings/account/details',
        description: 'Дані профілю та аватар.',
      },
      {
        id: 'preferences',
        label: 'Параметри',
        href: '/settings/account/preferences',
        description: 'Візуальні та мовні параметри.',
      },
    ],
  },
];
