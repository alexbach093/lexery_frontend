import { SettingsPage, SettingsSection } from '@/components/settings/SettingsPage';

export default function PersonalizationPage() {
  return (
    <SettingsPage
      title="Персоналізація"
      description="Тимчасовий розділ для персоналізованих відповідей, збережених значень за замовчуванням і продуктових параметрів."
    >
      <SettingsSection
        title="Незабаром"
        description="Цей розділ резервує місце для керування персоналізованою поведінкою."
      >
        <p className="text-quiet text-sm leading-6">
          Елементи персоналізації з&apos;являться тут на наступному етапі. Ця заглушка підтверджує,
          що маршрут, макет і навігація в сайдбарі підключені коректно.
        </p>
      </SettingsSection>
    </SettingsPage>
  );
}
