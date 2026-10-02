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
  subtitle?: string;
  className?: string;
}

export function ActivityLedger({
  activities,
  title = "Today's Operations",
  className = '',
}: ActivityLedgerProps) {
  return (
    <section aria-labelledby="activity-ledger-heading" className={`mb-4 ${className}`}>
      <div className="flex items-baseline justify-between mb-2">
        <h2 id="activity-ledger-heading" className="text-[14px] font-semibold text-[var(--text-primary)] m-0">
          {title}
        </h2>
        <span className="text-[12px] text-[var(--text-secondary)] font-normal">
          {activities.length} {activities.length === 1 ? 'event' : 'events'}
        </span>
      </div>

      <div className="overflow-hidden">
        {activities.length === 0 ? (
          <div className="p-3 text-center text-[13px] text-[var(--text-secondary)]">
            No operational events logged for this session yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-[var(--border)]/60 text-[12px] font-semibold text-[var(--text-secondary)]">
                  <th className="py-2 px-3.5 w-24">Time</th>
                  <th className="py-2 px-3.5 w-48">Event</th>
                  <th className="py-2 px-3.5">Record</th>
                  <th className="py-2 px-3.5 text-right w-32">Actor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {activities.map((item) => (
                  <tr key={item.id} className="hover:bg-[var(--surface-subtle)] transition-colors h-[36px]">
                    <td className="py-1.5 px-3.5 font-mono text-[12px] tabular-nums text-[var(--text-secondary)] whitespace-nowrap">
                      {item.time}
                    </td>
                    <td className="py-1.5 px-3.5 font-medium text-[var(--text-primary)] text-[13px]">
                      {item.event}
                    </td>
                    <td className="py-1.5 px-3.5 text-[var(--text-secondary)]">
                      {item.recordHref ? (
                        <Link href={item.recordHref} className="font-mono text-[12px] text-[var(--text-primary)] hover:text-[var(--accent)] hover:underline">
                          {item.record}
                        </Link>
                      ) : (
                        <span className="font-mono text-[12px] text-[var(--text-secondary)]">{item.record || '—'}</span>
                      )}
                    </td>
                    <td className="py-1.5 px-3.5 text-right font-normal text-[var(--text-secondary)] text-[12px] whitespace-nowrap">
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
