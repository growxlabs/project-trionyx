import React from 'react';

export type SummaryTone = 'default' | 'positive' | 'warning' | 'danger' | 'info' | 'accent';

export type SummarySegment =
  | { text: string }
  | { value: string | number; tone?: SummaryTone };

const toneClass: Record<SummaryTone, string> = {
  default: 'text-[var(--text-primary)]',
  positive: 'text-[var(--status-success)]',
  warning: 'text-[var(--status-warning)]',
  danger: 'text-[var(--status-danger)]',
  info: 'text-[var(--status-info)]',
  accent: 'text-[var(--accent)]',
};

interface OperationalSummaryProps {
  segments: SummarySegment[];
  as?: 'h1' | 'h2' | 'p';
  className?: string;
}

/**
 * Plain-language operational summary. Renders a sentence where the numbers are
 * emphasised in a tone colour. Rendered as the page heading by default.
 */
export function OperationalSummary({
  segments,
  as: Component = 'h1',
  className = '',
}: OperationalSummaryProps) {
  return (
    <Component
      className={`max-w-[1080px] text-[36px] font-semibold leading-[1.25] text-[var(--text-secondary)] mt-0 mb-6 ${className}`}
    >
      {segments.map((seg, i) =>
        'value' in seg ? (
          <span key={i} className={`font-bold tabular-nums ${toneClass[seg.tone ?? 'default']}`}>
            {seg.value}
          </span>
        ) : (
          <React.Fragment key={i}>{seg.text}</React.Fragment>
        )
      )}
    </Component>
  );
}
