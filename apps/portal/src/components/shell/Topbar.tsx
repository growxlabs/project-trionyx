import React from 'react';
import type { SafeUser } from '@trionyx/types';
import { UserMenu } from './UserMenu';

interface TopbarProps {
  user: SafeUser;
}

export function Topbar({ user }: TopbarProps) {
  return (
    <header className="hidden lg:flex items-center justify-between h-11 px-5 bg-[#161616] border-b border-[rgba(255,255,255,0.08)] sticky top-0 z-30 select-none">
      {/* Left: System Telemetry */}
      <div className="flex items-center gap-2.5 text-[11px] font-mono text-[rgba(255,255,255,0.45)]">
        <span className="inline-flex items-center gap-1.5 font-semibold text-[rgba(255,255,255,0.7)]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
          SYS.ONLINE
        </span>
        <span className="text-[rgba(255,255,255,0.2)]">/</span>
        <span>PROD · IST (UTC+05:30)</span>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-[440px] mx-6">
        <div className="relative flex items-center">
          <svg
            className="w-3.5 h-3.5 absolute left-2.5 text-[rgba(255,255,255,0.35)] pointer-events-none"
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
            className="w-full h-[28px] pl-8 pr-12 text-[11.5px] bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-[3px] text-[rgba(255,255,255,0.8)] placeholder-[rgba(255,255,255,0.3)] focus:outline-none focus:border-[rgba(255,255,255,0.25)] transition-all font-sans"
            readOnly
          />
          <span className="absolute right-2 text-[10px] font-mono font-medium text-[rgba(255,255,255,0.3)] border border-[rgba(255,255,255,0.12)] px-1 py-0.5 rounded-[2px]">
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
