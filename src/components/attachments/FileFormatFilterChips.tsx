'use client';

import { cn } from '@/lib/utils';

export function FileFormatFilterChips({
  options,
  selectedFormats,
  onChange,
  compact,
}: {
  options: { id: string; label: string }[];
  selectedFormats: Set<string>;
  onChange: (set: Set<string>) => void;
  compact?: boolean;
}) {
  // Toggle the selection state of a specific format
  const toggle = (id: string) => {
    onChange(
      (() => {
        const next = new Set(selectedFormats);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      })()
    );
  };

  // Empty state handling
  if (options.length === 0) {
    return (
      <p className="m-0 text-[13px] text-[#575757]">Додайте файли, щоб фільтрувати за форматом.</p>
    );
  }

  // Determine the number of columns (max 5)
  const columns = Math.min(5, options.length) || 1;

  // Map columns count to specific Tailwind arbitrary grid classes
  const gridColsClasses = [
    'grid-cols-[auto]', // fallback
    'grid-cols-[auto]', // 1
    'grid-cols-[repeat(2,auto)]', // 2
    'grid-cols-[repeat(3,auto)]', // 3
    'grid-cols-[repeat(4,auto)]', // 4
    'grid-cols-[repeat(5,auto)]', // 5
  ];

  return (
    <div
      className={cn(
        'grid items-center justify-start',
        compact ? 'gap-1.5' : 'gap-2',
        gridColsClasses[columns]
      )}
      role="group"
      aria-label="Фільтр за форматом файлу"
    >
      {options.map((opt) => {
        const active = selectedFormats.has(opt.id);
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => toggle(opt.id)}
            aria-pressed={active}
            className={cn(
              'cursor-pointer rounded-md border font-sans font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none',
              compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-[13px]',
              active
                ? 'border-[#2A2A2A] bg-[#2A2A2A] text-white'
                : 'border-[#E0E0E0] bg-white text-[#2A2A2A] hover:bg-gray-50'
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
