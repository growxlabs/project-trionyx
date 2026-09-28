import React from 'react';
import type { SafeUser } from '@trionyx/types';
import { formatRoleLabel } from '@trionyx/types';
import { UserMenu } from './UserMenu';

interface TopbarProps {
  user: SafeUser;
}

export function Topbar({ user }: TopbarProps) {
  const roleLabel = formatRoleLabel(user.role);


  return (
    <header className="hidden lg:flex items-center justify-between h-16 px-8 border-b border-[var(--border)] bg-[var(--surface-raised)] sticky top-0 z-30 select-none">
      {/* Shell Title */}
      <div className="flex items-center gap-3">
        <span className="text-[12px] font-bold tracking-[0.16em] uppercase text-[var(--text-secondary)]">
          TRIONYX OPERATIONS
        </span>
      </div>

      {/* Operator Area */}
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
            {roleLabel}
          </div>
          <div className="text-[13px] font-medium text-[var(--text-primary)]">
            {user.name}
          </div>
        </div>

        {/* User Dropdown Menu */}
        <UserMenu user={user} />
      </div>
    </header>
  );
}
