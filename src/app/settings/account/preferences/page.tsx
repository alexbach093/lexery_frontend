import { SettingsLanguageSelect } from '@/components/settings/SettingsLanguageSelect';
import { SettingsActionButton, SettingsPage } from '@/components/settings/SettingsPage';

const LANGUAGE_OPTIONS = [
  { id: 'auto', label: 'Автоматично (визначати мову вводу)' },
  { id: 'uk', label: 'Українська' },
  { id: 'en', label: 'Англійська (English)' },
  { id: 'bn', label: 'Бенгальська (বাংলা)' },
  { id: 'cs', label: 'Чеська (Čeština)' },
  { id: 'da', label: 'Данська (Dansk)' },
  { id: 'nl', label: 'Нідерландська (Nederlands)' },
  { id: 'fi', label: 'Фінська (Suomi)' },
  { id: 'fr', label: 'Французька (Français)' },
];

function PreferencesIsland({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-subtlest bg-base rounded-xl border p-4 md:p-5">
      <h2 className="text-foreground text-base font-medium">{title}</h2>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

function PreferencesRow({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
      <div className="min-w-0 flex-1">
        <p className="text-foreground text-sm font-medium">{title}</p>
        {description ? (
          <div className="text-quiet mt-0 text-[13px] leading-6">{description}</div>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center justify-start gap-3 md:justify-end">
        {actions}
      </div>
    </div>
  );
}

export default function PreferencesPage() {
  return (
    <SettingsPage title="Параметри">
      <div className="space-y-5">
        <PreferencesIsland title="Зовнішній вигляд">
          <PreferencesRow
            title="Тема"
            actions={<SettingsActionButton>Світла</SettingsActionButton>}
          />
          <PreferencesRow
            title="Шрифт відповідей"
            description="Стиль шрифту для відповідей ШІ"
            actions={<SettingsActionButton>Inter</SettingsActionButton>}
          />
        </PreferencesIsland>

        <PreferencesIsland title="Мова">
          <PreferencesRow
            title="Мова"
            description="Мова, яка використовується в інтерфейсі"
            actions={<SettingsActionButton>Українська</SettingsActionButton>}
          />
          <PreferencesRow
            title="Бажана мова відповідей"
            description="Мова, яка використовується для відповідей ШІ"
            actions={
              <SettingsLanguageSelect
                options={LANGUAGE_OPTIONS}
                defaultValue="Українська"
                storageKey="lexery-response-language"
              />
            }
          />
        </PreferencesIsland>
      </div>
    </SettingsPage>
  );
}
