'use client';

export interface AiSuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (text: string) => void;
}

/** Suggestion pills (e.g. "Детальніше", "Коротше") shown after assistant message. */
export function AiSuggestions({ suggestions, onSuggestionClick }: AiSuggestionsProps) {
  if (!suggestions?.length) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginTop: '12px',
      }}
      role="group"
      aria-label="Пропозиції для подальших запитань"
    >
      {suggestions.map((text) => (
        <button
          key={text}
          type="button"
          onClick={() => onSuggestionClick(text)}
          style={{
            padding: '6px 12px',
            borderRadius: '16px',
            border: '1px solid #E0E0E0',
            backgroundColor: '#fff',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            color: '#2A2A2A',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease, border-color 0.15s ease',
          }}
          className="hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:outline-none"
        >
          {text}
        </button>
      ))}
    </div>
  );
}
