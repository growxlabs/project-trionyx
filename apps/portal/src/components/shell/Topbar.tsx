import React from 'react';
import type { SafeUser } from '@trionyx/types';
import { formatRoleLabel } from '@trionyx/types';
import { UserMenu } from './UserMenu';

interface TopbarProps {
  user: SafeUser;
}

export function Topbar({ user }: TopbarProps) {
  const roleLabel = formatRoleLabel(user.role);

  const roleBadgeStyles: Record<string, string> = {
    DISTRIBUTOR: 'bg-[var(--status-info-soft)] text-[var(--status-info)] border-[var(--status-info-border)]',
    MANAGING_DIRECTOR: 'bg-[var(--status-warning-soft)] text-[var(--status-warning)] border-[var(--status-warning-border)]',
    ADMIN: 'bg-[var(--status-info-soft)] text-[var(--status-info)] border-[var(--status-info-border)]',
    STAFF: 'bg-[var(--surface-subtle)] text-[var(--text-secondary)] border-[var(--border)]',
  };

  const badgeClass =
    roleBadgeStyles[user.role] || 'bg-[var(--surface-subtle)] text-[var(--text-primary)] border-[var(--border)]';

  return (
    <header className="hidden lg:flex items-center justify-between h-16 px-8 border-b border-[var(--border)] bg-[var(--surface-raised)] sticky top-0 z-30 select-none">
      {/* Page Context */}
      <div className="flex items-center gap-3">
        <h1 className="text-[18px] font-semibold text-[var(--text-primary)] tracking-[-0.02em] m-0">
          Overview
        </h1>
        <div className="h-4 w-[1px] bg-[var(--border)]" />
        <span className="text-[12px] font-medium text-[var(--text-secondary)]">
          Internal Operations
        </span>
      </div>

      {/* Operator Status & Actions */}
      <div className="flex items-center gap-4">
        {/* Role Badge */}
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-[4px] border text-[11px] font-semibold uppercase tracking-wider ${badgeClass}`}
        >
          {roleLabel}
        </span>

        {/* User Dropdown Menu */}
        <UserMenu user={user} />
      </div>
    </header>
  );
}
