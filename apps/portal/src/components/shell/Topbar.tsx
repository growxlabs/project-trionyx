import React from 'react';
import type { SafeUser } from '@trionyx/types';
import { UserMenu } from './UserMenu';

interface TopbarProps {
  user: SafeUser;
}

export function Topbar({ user }: TopbarProps) {
  return (
    <header className="hidden lg:flex items-center justify-between h-11 px-5 bg-[var(--surface-raised)] border-b border-[var(--border)] sticky top-0 z-30 select-none transition-colors duration-150">
      {/* Left: App Label */}
      <div className="flex items-center gap-3 text-[11px] font-mono text-[var(--text-secondary)]">
        <span className="font-bold text-[12px] tracking-[0.14em] text-[var(--text-primary)] uppercase">TRIONYX</span>
      </div>

      {/* Center: Search (Recessed plate with subtle border) */}
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
            placeholder="Search serials, studios, formulas..."
            className="header-search-input w-full h-[28px] pl-8 pr-12 text-[11.5px] bg-[var(--surface-subtle)] border border-[var(--border)] rounded-[3px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors font-sans"
          />
          <span className="absolute right-2 text-[10px] font-mono font-medium text-[var(--text-muted)] border border-[var(--border)] px-1 py-0.5 rounded-[2px] bg-[var(--surface-raised)] pointer-events-none">
            Ctrl+K
          </span>
        </div>
      </div>

      {/* Right: User Menu */}
      <div className="flex items-center gap-3 shrink-0">
        <UserMenu user={user} />
      </div>
    </header>
  );
}
