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
  subtitle?: string;
  emptyMessage?: string;
  className?: string;
}

export function AttentionQueue({
  items,
  title = 'Attention Required',
  emptyMessage = 'No operational exceptions currently detected.',
  className = '',
}: AttentionQueueProps) {
  return (
    <section aria-labelledby="attention-queue-heading" className={`mb-4 ${className}`}>
      <div className="flex items-baseline justify-between mb-2">
        <h2 id="attention-queue-heading" className="text-[14px] font-semibold text-[var(--text-primary)] m-0">
          {title}
        </h2>
        <span className="text-[12px] text-[var(--text-secondary)] font-normal">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[4px] overflow-hidden">
        {items.length === 0 ? (
          <div className="p-3 text-center text-[13px] text-[var(--text-secondary)]">
            {emptyMessage}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-[var(--border)]/60 bg-[var(--surface-subtle)] text-[12px] font-semibold text-[var(--text-secondary)]">
                  <th className="py-2 px-3.5 w-24">Priority</th>
                  <th className="py-2 px-3.5 w-28">Area</th>
                  <th className="py-2 px-3.5">Issue</th>
                  <th className="py-2 px-3.5 text-right w-24">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-[var(--surface-subtle)] transition-colors h-[38px]">
                    <td className="py-1.5 px-3.5">
                      <StatusBadge status={item.priority} />
                    </td>
                    <td className="py-1.5 px-3.5 font-medium text-[var(--text-secondary)] text-[13px]">
                      {item.area}
                    </td>
                    <td className="py-1.5 px-3.5 font-normal text-[var(--text-primary)]">
                      {item.issue}
                    </td>
                    <td className="py-1.5 px-3.5 text-right">
                      <Link
                        href={item.actionHref}
                        className="inline-flex items-center px-2 py-0.5 rounded-[2px] border border-[var(--border)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-raised)] text-[12px] font-medium text-[var(--text-primary)] transition-colors"
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
