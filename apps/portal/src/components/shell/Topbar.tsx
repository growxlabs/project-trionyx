import React from 'react';
import type { SafeUser } from '@trionyx/types';
import { UserMenu } from './UserMenu';

interface TopbarProps {
  user: SafeUser;
}

export function Topbar({ user }: TopbarProps) {
  return (
    <header className="hidden lg:flex items-center justify-between h-11 px-7 border-b border-[var(--border)] bg-[var(--surface-raised)] sticky top-0 z-30 select-none">
      {/* Live System Telemetry */}
      <div className="flex items-center gap-2.5 text-[11px] font-mono text-[var(--text-muted)]">
        <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--text-secondary)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-success)] inline-block shadow-[0_0_6px_var(--status-success)]"></span>
          SYS.ONLINE
        </span>
        <span className="text-[var(--border-strong)]">/</span>
        <span>PROD · IST (UTC+05:30)</span>
      </div>

      {/* Primary Account Control */}
      <div className="flex items-center gap-3">
        <UserMenu user={user} />
      </div>
    </header>
  );
}
