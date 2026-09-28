import React from 'react';
import Link from 'next/link';
import { StatusBadge } from './StatusBadge';

export interface AttentionItem {
  id: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  area: string;
  issue: string;
  actionLabel?: string;
  actionHref: string;
}

interface AttentionQueueProps {
  items: AttentionItem[];
  title?: string;
  subtitle?: string; // deprecated, ignored
  emptyMessage?: string;
  className?: string;
}

export function AttentionQueue({
  items,
  title = 'ATTENTION REQUIRED',
  emptyMessage = 'No operational exceptions currently detected.',
  className = '',
}: AttentionQueueProps) {
  return (
    <section aria-labelledby="attention-queue-heading" className={`mb-4 ${className}`}>
      <div className="flex items-baseline justify-between mb-1.5">
        <h2 id="attention-queue-heading" className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)] m-0">
          {title}
        </h2>
        <span className="text-[11px] text-[var(--text-muted)] font-mono font-medium">
          {items.length} {items.length === 1 ? 'ITEM' : 'ITEMS'}
        </span>
      </div>

      <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[3px] overflow-hidden">
        {items.length === 0 ? (
          <div className="p-3 text-center text-[12px] text-[var(--text-secondary)]">
            {emptyMessage}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[12.5px]">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-subtle)] text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                  <th className="py-1.5 px-3.5 w-24">Priority</th>
                  <th className="py-1.5 px-3.5 w-28">Area</th>
                  <th className="py-1.5 px-3.5">Issue</th>
                  <th className="py-1.5 px-3.5 text-right w-24">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-[var(--surface-subtle)] transition-colors h-[34px]">
                    <td className="py-1 px-3.5">
                      <StatusBadge status={item.priority} />
                    </td>
                    <td className="py-1 px-3.5 font-medium text-[var(--text-secondary)] text-[12px]">
                      {item.area}
                    </td>
                    <td className="py-1 px-3.5 font-normal text-[var(--text-primary)]">
                      {item.issue}
                    </td>
                    <td className="py-1 px-3.5 text-right">
                      <Link
                        href={item.actionHref}
                        className="inline-flex items-center px-2 py-0.5 rounded-[2px] border border-[var(--border)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-raised)] text-[11px] font-medium text-[var(--text-primary)] transition-colors"
                      >
                        {item.actionLabel ? item.actionLabel.replace(' →', '') : 'Review'} →
                      </Link>
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
