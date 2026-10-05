'use client';

import React from 'react';
import Link from 'next/link';
import { defineRegistry } from '@json-render/react';
import { StatusBadge } from '../workspace/StatusBadge';
import { cn } from '@/lib/utils';
import { trixCatalog } from './trix-catalog';

const toneClasses: Record<string, string> = {
  neutral: 'border-[var(--border)] bg-[var(--surface-subtle)]/40',
  success: 'border-[var(--status-success-border,#BBF7D0)] bg-[var(--status-success-soft,#F0FDF4)]',
  warning: 'border-[var(--status-warning-border,#FDE68A)] bg-[var(--status-warning-soft,#FFFBEB)]',
  danger: 'border-[var(--status-danger-border,#FECACA)] bg-[var(--status-danger-soft,#FEF2F2)]',
  info: 'border-[var(--status-info-border,#BFDBFE)] bg-[var(--status-info-soft,#EFF6FF)]',
};

const severityClasses: Record<string, string> = {
  info: 'border-[var(--status-info-border,#BFDBFE)] bg-[var(--status-info-soft,#EFF6FF)] text-[var(--status-info,#1D4ED8)]',
  warning: 'border-[var(--status-warning-border,#FDE68A)] bg-[var(--status-warning-soft,#FFFBEB)] text-[var(--status-warning,#B45309)]',
  danger: 'border-[var(--status-danger-border,#FECACA)] bg-[var(--status-danger-soft,#FEF2F2)] text-[var(--status-danger,#B42318)]',
  success: 'border-[var(--status-success-border,#BBF7D0)] bg-[var(--status-success-soft,#F0FDF4)] text-[var(--status-success,#15803D)]',
};

export const { registry: trixRegistry } = defineRegistry(trixCatalog, {
  components: {
    CardContainer: ({ props, children, slots }) => (
      <section className="w-full max-w-2xl bg-[var(--surface-raised)] border border-[var(--border)] rounded-xl shadow-xs overflow-hidden my-3">
        <header className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border)] bg-[var(--surface-subtle)]/30">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="font-semibold text-base text-[var(--text-primary)] m-0">{props.title}</h3>
              {props.badge && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--surface-subtle)] text-[var(--text-secondary)] border border-[var(--border)]">
                  {props.badge}
                </span>
              )}
            </div>
            {props.subtitle && <p className="text-xs text-[var(--text-secondary)] mt-0.5 m-0">{props.subtitle}</p>}
          </div>
          {slots?.actions && <div className="flex items-center gap-2">{slots.actions}</div>}
        </header>
        <div className="p-5">{children}</div>
      </section>
    ),

    MetricGrid: ({ props, children }) => {
      const cols = props.columns ?? 2;
      return (
        <div
          className={cn(
            'grid gap-3 w-full my-2',
            cols === 3 ? 'grid-cols-1 sm:grid-cols-3' : cols === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'
          )}
        >
          {children}
        </div>
      );
    },

    MetricCard: ({ props }) => (
      <div className={cn('p-4 rounded-lg border flex flex-col justify-between transition-all', toneClasses[props.tone ?? 'neutral'])}>
        <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{props.label}</span>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tracking-tight text-[var(--text-primary)]">{props.value}</span>
          {props.subtext && <span className="text-xs text-[var(--text-secondary)]">{props.subtext}</span>}
        </div>
      </div>
    ),

    StatusPill: ({ props }) => (
      <StatusBadge status={props.status} tone={props.tone} label={props.label} />
    ),

    PropertyGrid: ({ props }) => (
      <dl className={cn('grid gap-x-6 gap-y-3.5 my-2', props.columns === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2')}>
        {props.items.map((item, idx) => (
          <div key={idx}>
            <dt className="text-xs text-[var(--text-muted)] font-medium mb-0.5">{item.label}</dt>
            <dd className="text-sm font-medium text-[var(--text-primary)] break-words m-0">{item.value}</dd>
          </div>
        ))}
      </dl>
    ),

    DataTable: ({ props }) => (
      <div className="w-full overflow-x-auto my-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)]">
              {props.columns.map((col) => (
                <th key={col.key} className="py-2.5 px-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider bg-transparent">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {props.rows.length === 0 ? (
              <tr>
                <td colSpan={props.columns.length} className="py-6 text-center text-sm text-[var(--text-muted)]">
                  {props.emptyText ?? 'No records match.'}
                </td>
              </tr>
            ) : (
              props.rows.map((row) => (
                <tr key={row.key} className="hover:bg-[var(--surface-subtle)]/60 transition-colors">
                  <td className="py-3 px-3 text-sm">
                    {row.href ? (
                      <Link href={row.href} className="font-medium text-[var(--text-primary)] hover:text-[var(--accent,#F26522)] hover:underline">
                        {row.title}
                      </Link>
                    ) : (
                      <span className="font-medium text-[var(--text-primary)]">{row.title}</span>
                    )}
                    {row.subtitle && <p className="text-xs text-[var(--text-secondary)] mt-0.5 m-0">{row.subtitle}</p>}
                    {row.detail && <p className="text-xs text-[var(--text-muted)] mt-0.5 m-0">{row.detail}</p>}
                  </td>
                  {row.status && (
                    <td className="py-3 px-3 text-right">
                      <StatusBadge status={row.status} />
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    ),

    Timeline: ({ props }) => (
      <div className="relative pl-6 space-y-5 my-2 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border)]">
        {props.items.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] m-0">{props.emptyText ?? 'No movements or changes recorded.'}</p>
        ) : (
          props.items.map((item) => (
            <div key={item.key} className="relative group">
              <span className="absolute -left-6 top-1.5 size-2.5 rounded-full border-2 border-[var(--surface-raised)] bg-[var(--accent,#F26522)]" />
              <div className="flex items-center justify-between gap-2">
                {item.href ? (
                  <Link href={item.href} className="text-sm font-medium text-[var(--text-primary)] hover:underline hover:text-[var(--accent,#F26522)]">
                    {item.title}
                  </Link>
                ) : (
                  <p className="text-sm font-medium text-[var(--text-primary)] m-0">{item.title}</p>
                )}
                {item.status && <StatusBadge status={item.status} size="sm" />}
              </div>
              {item.subtitle && <p className="text-xs text-[var(--text-secondary)] mt-0.5 m-0">{item.subtitle}</p>}
              {item.detail && <p className="text-xs text-[var(--text-muted)] mt-0.5 m-0">{item.detail}</p>}
              {item.timestamp && <p className="text-[11px] font-mono text-[var(--text-muted)] mt-1 m-0">{item.timestamp}</p>}
            </div>
          ))
        )}
      </div>
    ),

    Callout: ({ props }) => (
      <div className={cn('p-3.5 rounded-lg border flex items-start gap-3 my-2.5', severityClasses[props.severity ?? 'warning'])}>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm m-0">{props.title}</p>
            {props.href && (
              <Link href={props.href} className="text-xs font-medium underline hover:opacity-80">
                View
              </Link>
            )}
          </div>
          {props.description && <p className="text-xs opacity-90 mt-1 m-0 leading-relaxed">{props.description}</p>}
        </div>
      </div>
    ),

    QuickAction: ({ props }) => {
      const isPrimary = props.variant === 'primary' || !props.variant;
      const baseClass = isPrimary
        ? 'inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-md bg-[var(--accent,#F26522)] text-white hover:opacity-90 transition-opacity'
        : 'inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-md border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors';

      if (props.href) {
        return (
          <Link href={props.href} className={baseClass}>
            {props.label}
          </Link>
        );
      }
      return (
        <button type="button" className={baseClass}>
          {props.label}
        </button>
      );
    },

    CustomerQuote: ({ props }) => (
      <blockquote className="my-3 p-3.5 rounded-lg bg-[var(--surface-subtle)] border-l-4 border-[var(--accent,#F26522)] text-sm text-[var(--text-secondary)] italic leading-relaxed">
        {props.message}
        {props.truncated && '…'}
      </blockquote>
    ),
  },
  actions: {},
});
