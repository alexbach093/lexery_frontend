import {
  SettingsActionButton,
  SettingsPage,
  SettingsSection,
} from '@/components/settings/SettingsPage';

export default function SubscriptionPage() {
  return (
    <SettingsPage
      title="Підписка"
      description="Тимчасовий розділ для майбутніх керувань преміум-планом, оплатою та поновленням."
    >
      <SettingsSection
        title="План"
        description="Дані про преміум-план наразі показані як статичний макет."
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-foreground text-sm font-medium">Поточний план</p>
            <p className="text-quiet mt-1 text-sm">
              Тимчасовий безкоштовний план. Варіанти оновлення будуть підключені пізніше.
            </p>
          </div>
          <SettingsActionButton>Оновити</SettingsActionButton>
        </div>
      </SettingsSection>
    </SettingsPage>
  );
}
