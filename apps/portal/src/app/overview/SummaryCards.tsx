import React from 'react';
import type { OverviewSummary } from '@trionyx/types';

interface SummaryCardsProps {
  summary: OverviewSummary;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const cards = [
    {
      id: 'active-dealers',
      title: 'Active Dealers',
      value: summary.activeDealers !== null ? summary.activeDealers.toLocaleString() : '—',
      status: summary.activeDealers !== null ? 'Live network count' : 'Available after Dealers module',
      icon: (
        <svg className="w-4 h-4 text-[var(--text-secondary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      id: 'orders',
      title: 'Orders',
      value: summary.orders !== null ? summary.orders.toLocaleString() : '—',
      status: summary.orders !== null ? 'Active pipeline orders' : 'Available after Orders module',
      icon: (
        <svg className="w-4 h-4 text-[var(--text-secondary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
    },
    {
      id: 'low-stock',
      title: 'Low Stock',
      value: summary.lowStock !== null ? summary.lowStock.toLocaleString() : '—',
      status: summary.lowStock !== null ? 'Items below reorder threshold' : 'Available after Inventory module',
      icon: (
        <svg className="w-4 h-4 text-[var(--text-secondary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
    },
    {
      id: 'pending-actions',
      title: 'Pending Actions',
      value: summary.pendingActions !== null ? summary.pendingActions.toLocaleString() : '—',
      status: summary.pendingActions !== null ? 'Require operator review' : 'Available after Workflow module',
      icon: (
        <svg className="w-4 h-4 text-[var(--text-secondary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
  ];

  return (
    <section aria-label="Operational Summary Metrics" className="mb-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {cards.map((card) => (
          <div
            key={card.id}
            className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[8px] p-4 sm:p-6 shadow-[0_1px_3px_rgba(23,23,20,0.03)] flex flex-col justify-between"
          >
            {/* Card Header */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] sm:text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-[0.06em]">
                {card.title}
              </span>
              <div className="p-1 rounded bg-[var(--background)] border border-[var(--border)]">
                {card.icon}
              </div>
            </div>

            {/* Metric Value */}
            <div className="my-3 sm:my-4">
              <span className="text-[28px] sm:text-[34px] font-semibold text-[var(--text-primary)] font-mono tracking-tight leading-none block">
                {card.value}
              </span>
            </div>

            {/* Status / Scope Note */}
            <div>
              <p className="text-[11.5px] sm:text-[12px] text-[var(--text-muted)] font-medium m-0 leading-tight">
                {card.status}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
