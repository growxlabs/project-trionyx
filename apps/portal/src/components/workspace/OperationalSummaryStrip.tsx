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
    <section aria-label={title || 'Operating metrics'} className={className}>
      {title && (
        <h2 className="mb-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)] m-0">
          {title}
        </h2>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 overflow-hidden rounded-[4px] border border-[var(--border)] bg-[var(--surface-raised)] divide-y divide-[var(--border)] md:divide-y-0 md:divide-x">
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
            <div key={idx} className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                {m.label}
              </span>
              <div className="flex shrink-0 items-baseline gap-1.5">
                <span className={`text-[22px] font-semibold leading-none tabular-nums tracking-tight ${toneClass}`}>
                  {val}
                </span>
                {m.detail && (
                  <span className="text-[12px] font-normal text-[var(--text-secondary)]">
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
