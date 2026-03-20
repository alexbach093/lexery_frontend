'use client';

import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import type { SettingRow } from '@/types';

export function SettingRowItem({
  row,
  control,
  isLast,
}: {
  row: SettingRow;
  control: ReactNode;
  isLast: boolean;
}) {
  const hasDescription = Boolean(row.description);

  return (
    <div
      className={cn(
        'grid grid-cols-[minmax(0,1fr)_auto] gap-4',
        hasDescription ? 'min-h-20 items-start py-3' : 'min-h-13.5 items-center py-2',
        !isLast && 'border-b border-[#ECECEC]'
      )}
    >
      <div className="min-w-0">
        <div className="font-sans text-[14px] leading-5 font-normal tracking-normal text-[#171717]">
          {row.label}
        </div>
        {row.description && (
          <div className="mt-1 max-w-97.5 font-sans text-[12px] leading-4.25 font-normal tracking-normal text-[#8C8C8C]">
            {row.description}
          </div>
        )}
      </div>

      <div
        className={cn(
          'flex shrink-0 justify-end',
          hasDescription ? 'items-start pt-0.5' : 'items-center pt-0'
        )}
      >
        {control}
      </div>
    </div>
  );
}
