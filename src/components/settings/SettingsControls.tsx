'use client';

import type { ReactNode } from 'react';

import { CloseAltIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

export function SettingsCloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Закрити налаштування"
      className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-[10px] border-none bg-transparent text-[#171717] transition-colors hover:bg-[#F4F4F6] active:bg-[#F4F4F6]"
    >
      <CloseAltIcon width={20} height={20} aria-hidden="true" />
    </button>
  );
}

export function SettingsTab({
  label,
  active,
  icon,
  onClick,
}: {
  label: string;
  active: boolean;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex min-h-10 w-[calc(100%-8px)] cursor-pointer items-center gap-2.5 self-center rounded-xl border-none px-3 text-left text-[#171717] transition-colors active:bg-[#F4F4F6]',
        active ? 'bg-[#F4F4F6]' : 'bg-transparent hover:bg-[#F4F4F6]'
      )}
    >
      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center">{icon}</span>
      <span className="font-sans text-[14px] leading-5 font-medium tracking-[0.14px]">{label}</span>
    </button>
  );
}

export function ActionButton({
  children,
  danger = false,
  onClick,
  disabled = false,
}: {
  children: ReactNode;
  danger?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex h-9 min-w-23 items-center justify-center rounded-full border px-3 font-sans text-[14px] leading-5 font-normal tracking-normal transition-colors',
        disabled
          ? 'cursor-default border-[#E4E4E4] bg-[#F4F4F6] text-[#AAAAAA]'
          : danger
            ? 'cursor-pointer border-[#F19A9A] bg-white text-[#F25555] hover:bg-[#FFF0F0]'
            : 'cursor-pointer border-[#D7D7D7] bg-white text-[#3A3A3A] hover:bg-[#F4F4F6]'
      )}
    >
      {children}
    </button>
  );
}

export function SelectLikeControl({
  children,
  active = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      className={cn(
        'inline-flex h-9 cursor-pointer items-center justify-center gap-1 rounded-lg border border-transparent px-2.75 font-sans text-[14px] leading-5 font-normal tracking-normal whitespace-nowrap text-[#171717] transition-colors duration-140 ease-in-out',
        active ? 'bg-[#F4F4F6]' : 'bg-transparent hover:bg-[#F4F4F6]'
      )}
    >
      {children}
    </button>
  );
}

export function ToggleControl({ checked, onClick }: { checked: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onClick}
      className={cn(
        'inline-flex h-5 w-8 cursor-pointer items-center rounded-full border-none p-0.5 transition-colors duration-150 ease-in-out',
        checked ? 'bg-[#1C1C1C]' : 'bg-[#F4F4F6]'
      )}
    >
      <span
        className={cn(
          'h-4 w-4 rounded-full bg-white transition-transform duration-150 ease-in-out',
          checked ? 'translate-x-3' : 'translate-x-0'
        )}
      />
    </button>
  );
}
