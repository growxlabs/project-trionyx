import React from 'react';
import type { AttentionItem } from '@trionyx/types';

interface AttentionNeededProps {
  items: AttentionItem[];
}

export function AttentionNeeded({ items }: AttentionNeededProps) {
  return (
    <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[8px] p-5 sm:p-6 shadow-[0_1px_3px_rgba(23,23,20,0.03)] flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
        <div>
          <h2 className="text-[15px] sm:text-[16px] font-semibold text-[var(--text-primary)] m-0">
            Attention Needed
          </h2>
          <p className="text-[12px] text-[var(--text-secondary)] mt-0.5 m-0">
            Priority inventory and operational alerts
          </p>
        </div>
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${
            items.length > 0
              ? 'bg-[var(--status-danger-soft)] text-[var(--status-danger)] border-[var(--status-danger-border)]'
              : 'bg-[var(--status-success-soft)] text-[var(--status-success)] border-[var(--status-success-border)]'
          }`}
        >
          {items.length > 0 ? `${items.length} Action${items.length > 1 ? 's' : ''}` : 'Clear'}
        </span>
      </div>

      {/* Content */}
      <div className="pt-4 flex-1">
        {items.length === 0 ? (
          <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-[var(--status-success-soft)] border border-[var(--status-success-border)] flex items-center justify-center text-[var(--status-success)] mb-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-[14px] font-semibold text-[var(--text-primary)] m-0">
              Nothing requires attention right now.
            </p>
            <p className="text-[12.5px] text-[var(--text-secondary)] mt-1 m-0 max-w-sm">
              All inventory channels are running normally without outstanding alerts.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--border)] m-0 p-0 list-none">
            {items.map((item) => (
              <li key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[13.5px] font-medium text-[var(--text-primary)] m-0">
                    {item.label}
                  </p>
                  <p className="text-[11.5px] text-[var(--status-danger)] font-medium mt-0.5 m-0 uppercase tracking-wide">
                    {item.type === 'OUT_OF_STOCK' ? 'Out of Stock' : item.type.replace(/_/g, ' ')}
                  </p>
                </div>
                {item.href && (
                  <a
                    href={item.href}
                    className="text-[12.5px] font-semibold text-[var(--accent-text)] hover:underline shrink-0"
                  >
                    View
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
