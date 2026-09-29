import React from 'react';

export interface SummaryMetric {
  label: string;
  value: string | number | null;
  detail?: string;
  tone?: 'default' | 'alert' | 'warning' | 'positive';
  actionHref?: string;
  actionLabel?: string;
}

interface OperationalSummaryStripProps {
  metrics: SummaryMetric[];
  title?: string;
  className?: string;
}

export function OperationalSummaryStrip({
  metrics,
  title,
  className = '',
}: OperationalSummaryStripProps) {
  return (
    <section aria-label={title || 'Operating metrics'} className={`mb-4 ${className}`}>
      {title && (
        <h2 className="text-[14px] font-semibold text-[var(--text-primary)] mb-1.5 m-0">
          {title}
        </h2>
      )}
      <div className="bg-[var(--context-strip-bg)] border border-[var(--context-strip-border)] rounded-[3px] grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[var(--context-strip-divider)]">
        {metrics.map((m, idx) => {
          const val = m.value === null || m.value === undefined ? '—' : m.value;
          const isZero = val === 0 || val === '0';

          let toneClass = 'text-[var(--text-primary)]';
          if (m.tone === 'alert' && !isZero) {
            toneClass = 'text-[var(--status-danger)]';
          } else if (m.tone === 'warning' && !isZero) {
            toneClass = 'text-[var(--status-warning)]';
          } else if (m.tone === 'positive') {
            toneClass = 'text-[var(--status-success)]';
          }

          return (
            <div key={idx} className="px-3.5 py-2.5 flex items-baseline justify-between gap-3">
              <span className="text-[12px] font-medium text-[var(--context-strip-text-secondary)] truncate">
                {m.label}
              </span>
              <div className="flex items-baseline gap-1.5 shrink-0">
                <span className={`text-[20px] font-semibold font-sans tabular-nums tracking-tight leading-none ${toneClass}`}>
                  {val}
                </span>
                {m.detail && (
                  <span className="text-[12px] text-[var(--context-strip-text-secondary)] font-normal">
                    {m.detail}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
