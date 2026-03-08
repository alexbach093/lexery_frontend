import { SettingsPage, SettingsSection } from '@/components/settings/SettingsPage';

export default function NotificationsPage() {
  return (
    <SettingsPage
      title="Сповіщення"
      description="Тимчасовий розділ для параметрів email-, продуктових і активнісних сповіщень."
    >
      <SettingsSection
        title="Надсилання сповіщень"
        description="Поки що це статичний контент, доки не будуть реалізовані справжні налаштування сповіщень."
      >
        <p className="text-quiet text-sm leading-6">
          Перемикачі сповіщень і канали доставки буде додано на наступному етапі. Поточна сторінка
          навмисно лишається заглушкою в межах поточного обсягу реалізації.
        </p>
      </SettingsSection>
    </SettingsPage>
  );
}
