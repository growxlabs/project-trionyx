import React from 'react';
import Link from 'next/link';

export interface ActivityEntry {
  id: string;
  time: string; // e.g. '09:42'
  event: string;
  record?: string;
  recordHref?: string;
  actor: string;
}

interface ActivityLedgerProps {
  activities: ActivityEntry[];
  title?: string;
  subtitle?: string; // deprecated, ignored
  className?: string;
}

export function ActivityLedger({
  activities,
  title = "TODAY'S OPERATIONS",
  className = '',
}: ActivityLedgerProps) {
  return (
    <section aria-labelledby="activity-ledger-heading" className={`mb-4 ${className}`}>
      <div className="flex items-baseline justify-between mb-1.5">
        <h2 id="activity-ledger-heading" className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)] m-0">
          {title}
        </h2>
        <span className="text-[11px] text-[var(--text-muted)] font-mono font-medium">
          {activities.length} EVENTS
        </span>
      </div>

      <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[3px] overflow-hidden">
        {activities.length === 0 ? (
          <div className="p-3 text-center text-[12px] text-[var(--text-secondary)]">
            No operational events logged for this session yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[12.5px]">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-subtle)] text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                  <th className="py-1.5 px-3.5 w-20">Time</th>
                  <th className="py-1.5 px-3.5 w-48">Event</th>
                  <th className="py-1.5 px-3.5">Record</th>
                  <th className="py-1.5 px-3.5 text-right w-32">Actor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {activities.map((item) => (
                  <tr key={item.id} className="hover:bg-[var(--surface-subtle)] transition-colors h-[32px]">
                    <td className="py-1 px-3.5 font-mono text-[11px] tabular-nums text-[var(--text-muted)] whitespace-nowrap">
                      {item.time}
                    </td>
                    <td className="py-1 px-3.5 font-medium text-[var(--text-primary)] text-[12px]">
                      {item.event}
                    </td>
                    <td className="py-1 px-3.5 text-[var(--text-secondary)]">
                      {item.recordHref ? (
                        <Link href={item.recordHref} className="font-mono text-[11.5px] text-[var(--text-primary)] hover:text-[var(--accent)] hover:underline">
                          {item.record}
                        </Link>
                      ) : (
                        <span className="font-mono text-[11.5px] text-[var(--text-secondary)]">{item.record || '—'}</span>
                      )}
                    </td>
                    <td className="py-1 px-3.5 text-right font-medium text-[var(--text-muted)] text-[11px] whitespace-nowrap">
                      {item.actor}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
