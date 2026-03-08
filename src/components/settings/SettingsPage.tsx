type SettingsPageProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
};

type SettingsSectionProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

type SettingsInfoRowProps = {
  label: string;
  value: React.ReactNode;
};

type SettingsActionButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export function SettingsPage({ title, description, children }: SettingsPageProps) {
  return (
    <div className="flex flex-col gap-8">
      <header className="border-subtlest border-b pb-4">
        <h1 className="text-foreground text-xl font-medium">{title}</h1>
        {description ? (
          <p className="text-quiet mt-2 max-w-2xl text-sm leading-6">{description}</p>
        ) : null}
      </header>
      {children}
    </div>
  );
}

export function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="border-subtlest border-b pb-3">
        <h2 className="text-foreground text-base font-medium">{title}</h2>
        {description ? <p className="text-quiet mt-1 text-sm">{description}</p> : null}
      </div>
      <div className="border-subtlest bg-base rounded-xl border p-4 md:p-5">{children}</div>
    </section>
  );
}

export function SettingsInfoRow({ label, value }: SettingsInfoRowProps) {
  return (
    <div className="border-subtlest flex flex-col gap-1 border-b py-3 first:pt-0 last:border-b-0 last:pb-0 md:flex-row md:items-center md:justify-between md:gap-6">
      <span className="text-foreground text-sm font-medium">{label}</span>
      <span className="text-quiet text-sm">{value}</span>
    </div>
  );
}

export function SettingsActionButton({
  children,
  className = '',
  type = 'button',
  ...props
}: SettingsActionButtonProps) {
  return (
    <button
      type={type}
      className={[
        'border-subtlest bg-base text-foreground ease-outExpo hover:bg-subtle active:ease-outExpo inline-flex h-8 cursor-pointer items-center justify-center rounded-md border px-3 text-sm font-medium transition duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:scale-[0.97] active:duration-150',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}
