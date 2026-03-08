import { SettingsPage, SettingsSection } from '@/components/settings/SettingsPage';

export default function ShortcutsPage() {
  return (
    <SettingsPage
      title="Скорочення"
      description="Тимчасовий розділ для налаштування клавіатурних скорочень і довідки по командах."
    >
      <SettingsSection
        title="Клавіатурні скорочення"
        description="Прив'язки скорочень можна буде налаштовувати тут пізніше."
      >
        <p className="text-quiet text-sm leading-6">
          Ця сторінка-заглушка підтверджує наявність окремого маршруту для скорочень і зберігає
          оболонку налаштувань у стилі Perplexity для майбутньої реалізації.
        </p>
      </SettingsSection>
    </SettingsPage>
  );
}
