import React from 'react';
import type { OverviewActivity } from '@trionyx/types';

interface RecentActivityProps {
  activities: OverviewActivity[];
}

function formatTimestamp(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return (
      date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC',
      }) + ' UTC'
    );
  } catch {
    return isoString;
  }
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'LOGIN_SUCCESS':
      return (
        <div className="w-8 h-8 rounded-full bg-[var(--status-success-soft)] border border-[var(--status-success-border)] flex items-center justify-center text-[var(--status-success)] shrink-0">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
        </div>
      );
    case 'LOGOUT':
      return (
        <div className="w-8 h-8 rounded-full bg-[var(--surface-subtle)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] shrink-0">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </div>
      );
    case 'USER_BOOTSTRAPPED':
      return (
        <div className="w-8 h-8 rounded-full bg-[var(--status-warning-soft)] border border-[var(--status-warning-border)] flex items-center justify-center text-[var(--status-warning)] shrink-0">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="23" y1="11" x2="17" y2="11" />
          </svg>
        </div>
      );
    case 'ACCOUNT_LOCKED':
      return (
        <div className="w-8 h-8 rounded-full bg-[var(--status-danger-soft)] border border-[var(--status-danger-border)] flex items-center justify-center text-[var(--status-danger)] shrink-0">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
      );
    case 'LOGIN_FAILURE':
      return (
        <div className="w-8 h-8 rounded-full bg-[var(--status-warning-soft)] border border-[var(--status-warning-border)] flex items-center justify-center text-[var(--status-warning)] shrink-0">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
      );
    default:
      return (
        <div className="w-8 h-8 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] shrink-0">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 14 14" />
          </svg>
        </div>
      );
  }
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-[8px] p-5 sm:p-6 shadow-[0_1px_3px_rgba(23,23,20,0.03)] flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
        <div>
          <h2 className="text-[15px] sm:text-[16px] font-semibold text-[var(--text-primary)] m-0">
            Recent Activity
          </h2>
          <p className="text-[12px] text-[var(--text-secondary)] mt-0.5 m-0">
            Persisted security & system audit events
          </p>
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--background)] px-2 py-0.5 rounded border border-[var(--border)]">
          Audit Log
        </span>
      </div>

      {/* Content */}
      <div className="pt-4 flex-1">
        {activities.length === 0 ? (
          <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] mb-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <p className="text-[14px] font-semibold text-[var(--text-primary)] m-0">
              No recent activity.
            </p>
            <p className="text-[12.5px] text-[var(--text-secondary)] mt-1 m-0 max-w-sm">
              Persisted audit events will appear here as internal operations occur.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--border)] m-0 p-0 list-none">
            {activities.map((item) => (
              <li key={item.id} className="py-3 sm:py-3.5 first:pt-0 last:pb-0 flex items-start gap-3">
                {getActivityIcon(item.type)}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <p className="text-[13.5px] font-medium text-[var(--text-primary)] m-0">
                      {item.label}
                    </p>
                    <time className="text-[11px] font-mono text-[var(--text-muted)] shrink-0">
                      {formatTimestamp(item.createdAt)}
                    </time>
                  </div>
                  <p className="text-[12px] text-[var(--text-secondary)] mt-0.5 m-0 truncate">
                    Actor: <span className="text-[var(--text-primary)] font-medium">{item.actorName || 'System'}</span>
                    {item.actorEmail && item.actorEmail !== item.actorName && (
                      <span className="text-[var(--text-muted)] ml-1">({item.actorEmail})</span>
                    )}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
