import { SettingsSection } from '@/types';

export const SECTIONS: SettingsSection[] = [
  {
    id: 'general',
    label: 'Загальні',
    rows: [
      { id: 'theme', label: 'Тема', kind: 'theme' },
      { id: 'language', label: 'Мова', kind: 'value', value: 'Українська' },
      {
        id: 'memory',
        label: 'Збереження пам’яті',
        description: 'Дозволяє Lexery зберігати і використовувати чати для кращих відповідей',
        kind: 'toggle',
      },
      {
        id: 'delete-chats',
        label: 'Видалити всі чати',
        kind: 'action',
        actionLabel: 'Видалити',
        danger: true,
      },
      {
        id: 'logout',
        label: 'Вийти з акаунту',
        kind: 'action',
        actionLabel: 'Вийти',
      },
    ],
  },
  {
    id: 'info',
    label: 'Інформація',
    rows: [
      {
        id: 'shared',
        label: 'Поширені чати',
        description: 'Перегляд чатів, які були відкриті для інших користувачів',
        kind: 'action',
        actionLabel: 'Переглянути',
        disabled: true,
      },
      {
        id: 'delete-account',
        label: 'Видалити обліковий запис',
        description: 'Незворотне видалення профілю, історії та локальних прив’язок',
        kind: 'action',
        actionLabel: 'Видалити',
        danger: true,
      },
    ],
  },
  {
    id: 'security',
    label: 'Безпека',
    rows: [
      {
        id: 'mfa',
        label: 'Мультифакторна автентифікація',
        description: 'Додає другий рівень перевірки для входу в Lexery',
        kind: 'action',
        actionLabel: 'Підключити',
        disabled: true,
      },
      {
        id: 'signout-all',
        label: 'Вийти з усіх пристроїв',
        description: 'Завершує всі інші активні сесії цього акаунту',
        kind: 'action',
        actionLabel: 'Вийти',
        danger: true,
      },
    ],
  },
];
