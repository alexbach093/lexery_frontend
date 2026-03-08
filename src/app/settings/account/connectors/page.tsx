import { SettingsPage, SettingsSection } from '@/components/settings/SettingsPage';

export default function ConnectorsPage() {
  return (
    <SettingsPage
      title="Конектори"
      description="Тимчасовий розділ для майбутніх інтеграцій і підключених сервісів."
    >
      <SettingsSection
        title="Конекторів поки немає"
        description="Цей порожній стан є частиною перевірки плану реалізації."
      >
        <p className="text-quiet text-sm leading-6">
          Поки що жоден конектор не налаштований. Коли з&apos;являться інтеграції, вони будуть
          відображатися тут разом зі статусом підключення та діями керування.
        </p>
      </SettingsSection>
    </SettingsPage>
  );
}
