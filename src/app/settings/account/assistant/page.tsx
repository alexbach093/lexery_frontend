import { SettingsPage, SettingsSection } from '@/components/settings/SettingsPage';

export default function AssistantPage() {
  return (
    <SettingsPage
      title="Асистент"
      description="Тимчасовий розділ для тону, поведінки асистента та типових параметрів відповідей."
    >
      <SettingsSection
        title="Поведінка асистента"
        description="Поки що це лише UI-макет, доки параметри асистента не будуть підключені до реальних даних."
      >
        <p className="text-quiet text-sm leading-6">
          Тут будуть розміщені налаштування асистента. Наразі ця сторінка слугує повноцінною
          візуальною заглушкою в новій структурі маршруту `/settings`.
        </p>
      </SettingsSection>
    </SettingsPage>
  );
}
