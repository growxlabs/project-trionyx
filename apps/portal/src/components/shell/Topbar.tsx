import React from 'react';
import type { SafeUser } from '@trionyx/types';
import { UserMenu } from './UserMenu';

interface TopbarProps {
  user: SafeUser;
}

export function Topbar({ user }: TopbarProps) {
  return (
    <header className="hidden lg:flex items-center justify-between h-11 px-7 border-b border-[var(--border)] bg-[var(--surface-raised)] sticky top-0 z-30 select-none">
      {/* 1. Left: Workspace / App Label + Environment Telemetry */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="font-bold text-[11.5px] uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
          TRIONYX OPERATIONS
        </span>

        <span className="text-[var(--border-strong)] text-[12px]">/</span>

        {/* Environment / System Telemetry */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--text-muted)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-success)] inline-block shadow-[0_0_6px_var(--status-success)]"></span>
          <span className="font-semibold text-[var(--text-secondary)]">SYS.ONLINE</span>
          <span className="text-[var(--border-strong)]">·</span>
          <span>PROD (UTC+05:30)</span>
        </div>
      </div>

      {/* 2. Center: Enterprise Global Search Command Bar */}
      <div className="flex-1 max-w-[440px] mx-6">
        <div className="relative flex items-center">
          <svg
            className="w-3.5 h-3.5 absolute left-2.5 text-[var(--text-muted)] pointer-events-none"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search documents, serials, studios, formulas... (Ctrl + K)"
            className="w-full h-[28px] pl-8 pr-12 text-[11.5px] bg-[var(--surface-subtle)] border border-[var(--border)] rounded-[3px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--surface-raised)] transition-all font-sans"
            readOnly
          />
          <span className="absolute right-2 text-[10px] font-mono font-medium text-[var(--text-muted)] border border-[var(--border)] px-1 py-0.2 rounded-[2px] bg-[var(--surface-raised)]">
            ⌘K
          </span>
        </div>
      </div>

      {/* 3. Right: Primary User Account Control */}
      <div className="flex items-center gap-3 shrink-0">
        <UserMenu user={user} />
      </div>
    </header>
  );
}
