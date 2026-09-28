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
    <section aria-label={title || 'Operating metrics'} className={`mb-8 ${className}`}>
      {title && (
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)] mb-2.5">
          {title}
        </h2>
      )}
      <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px] grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[var(--border)]">
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
            <div key={idx} className="p-4 sm:p-5 flex flex-col justify-between">
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)] block truncate">
                {m.label}
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className={`text-[26px] sm:text-[30px] font-semibold tracking-[-0.03em] leading-none ${toneClass}`}>
                  {val}
                </span>
                {m.detail && (
                  <span className="text-[12px] text-[var(--text-secondary)] font-normal">
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
