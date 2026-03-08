import { DeleteAccountInline } from '@/components/settings/DeleteAccountInline';
import { SettingsEditableRow } from '@/components/settings/SettingsEditableRow';
import {
  SettingsActionButton,
  SettingsInfoRow,
  SettingsPage,
} from '@/components/settings/SettingsPage';

function AccountIsland({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-subtlest bg-base rounded-xl border p-4 md:p-5">
      <h2 className="text-foreground text-base font-medium">{title}</h2>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

function AccountActionRow({
  title,
  description,
  actions,
  titleSuffix,
}: {
  title: string;
  description?: React.ReactNode;
  actions: React.ReactNode;
  titleSuffix?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-foreground text-sm font-medium">{title}</p>
          {titleSuffix}
        </div>
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

export default function AccountDetailsPage() {
  return (
    <SettingsPage title="Акаунт">
      <div className="space-y-5">
        <div className="border-subtlest bg-base rounded-xl border p-4 md:p-5">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-quiet text-foreground flex h-16 w-16 items-center justify-center rounded-full text-lg font-semibold">
                AL
              </div>
              <div className="space-y-0">
                <p className="text-foreground text-sm font-medium">Аватар</p>
                <p className="text-quiet text-sm">Тимчасове зображення поточного акаунта.</p>
              </div>
            </div>
            <SettingsActionButton>Змінити аватар</SettingsActionButton>
          </div>

          <div className="mt-6">
            <SettingsEditableRow label="Ім&#39;я" defaultValue="Alex Lexery" />
            <SettingsInfoRow label="Ім&#39;я користувача" value="@alex_lexery" />
            <SettingsInfoRow label="Електронна пошта" value="alex@example.com" />
          </div>
        </div>

        <AccountIsland title="Ваша підписка">
          <AccountActionRow
            title="У вас підписка LEXERY"
            titleSuffix={
              <span className="bg-quiet font-semimedium text-foreground inline-flex h-6 items-center rounded-full px-2 text-xs">
                Plus
              </span>
            }
            description={
              <>
                Перегляньте можливості Plus.{' '}
                <a href="#" className="text-foreground underline underline-offset-2">
                  Дізнатися більше
                </a>
              </>
            }
            actions={
              <>
                <SettingsActionButton>Оновити план</SettingsActionButton>
              </>
            }
          />
        </AccountIsland>

        <AccountIsland title="Система">
          <AccountActionRow
            title="Підтримка"
            actions={<SettingsActionButton>Зв&#39;язатися</SettingsActionButton>}
          />

          <AccountActionRow
            title="Ви ввійшли як alex_lexery"
            actions={<SettingsActionButton>Вийти</SettingsActionButton>}
          />

          <AccountActionRow
            title="Вийти з усіх сесій"
            description="Пристрої або браузери, де ви ввійшли"
            actions={<SettingsActionButton>Вийти з усіх сесій</SettingsActionButton>}
          />

          <DeleteAccountInline />
        </AccountIsland>
      </div>
    </SettingsPage>
  );
}
