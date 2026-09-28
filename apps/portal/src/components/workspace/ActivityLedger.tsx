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
    <section aria-labelledby="activity-ledger-heading" className={`mb-6 ${className}`}>
      <div className="flex items-baseline justify-between mb-2">
        <h2 id="activity-ledger-heading" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)] m-0">
          {title}
        </h2>
        <span className="text-[11.5px] text-[var(--text-muted)] font-mono font-medium">
          {activities.length}
        </span>
      </div>

      <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px] overflow-hidden">
        {activities.length === 0 ? (
          <div className="p-5 text-center text-[13px] text-[var(--text-secondary)]">
            No operational events logged for this session yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-subtle)] text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                  <th className="py-2 px-4 w-20">Time</th>
                  <th className="py-2 px-4 w-44">Event</th>
                  <th className="py-2 px-4">Record</th>
                  <th className="py-2 px-4 text-right w-36">Actor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {activities.map((item) => (
                  <tr key={item.id} className="hover:bg-[var(--surface-subtle)] transition-colors">
                    <td className="py-2 px-4 font-mono text-[12px] text-[var(--text-muted)] whitespace-nowrap">
                      {item.time}
                    </td>
                    <td className="py-2 px-4 font-medium text-[var(--text-primary)]">
                      {item.event}
                    </td>
                    <td className="py-2 px-4 text-[var(--text-secondary)]">
                      {item.recordHref ? (
                        <Link href={item.recordHref} className="text-[var(--text-primary)] hover:text-[var(--accent)] hover:underline">
                          {item.record}
                        </Link>
                      ) : (
                        item.record || '—'
                      )}
                    </td>
                    <td className="py-2 px-4 text-right font-medium text-[var(--text-secondary)] text-[12px] whitespace-nowrap">
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
