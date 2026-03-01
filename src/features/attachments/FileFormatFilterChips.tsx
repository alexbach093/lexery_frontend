'use client';

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

  const gap = compact ? 6 : 8;

  if (options.length === 0) {
    return (
      <p style={{ margin: 0, fontSize: '13px', color: '#575757' }}>
        Додайте файли, щоб фільтрувати за форматом.
      </p>
    );
  }

  const columns = Math.min(5, options.length) || 1;
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, auto)`,
        alignItems: 'center',
        justifyContent: 'start',
        gap,
      }}
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
            style={{
              padding: compact ? '6px 10px' : '8px 12px',
              borderRadius: '6px',
              border: `1px solid ${active ? '#2A2A2A' : '#E0E0E0'}`,
              backgroundColor: active ? '#2A2A2A' : '#fff',
              color: active ? '#fff' : '#2A2A2A',
              fontSize: compact ? '12px' : '13px',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              whiteSpace: 'nowrap',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
