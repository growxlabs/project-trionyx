import React from 'react';
import type { SafeUser } from '@trionyx/types';
import { UserMenu } from './UserMenu';

interface TopbarProps {
  user: SafeUser;
}

export function Topbar({ user }: TopbarProps) {
  return (
    <header className="hidden lg:flex items-center justify-between h-11 px-5 bg-[#22221E] sticky top-0 z-30 select-none">
      {/* Left: App Label + System Telemetry */}
      <div className="flex items-center gap-3 text-[11px] font-mono text-[#A9A59C]">
        <span className="font-bold text-[12px] tracking-[0.15em] text-[#F7F6F0] uppercase">TRIONYX</span>
        <span className="text-[rgba(255,255,255,0.12)]">|</span>
        <span className="inline-flex items-center gap-1.5 font-semibold text-[#F7F6F0]/90">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
          SYS.ONLINE
        </span>
        <span className="text-[rgba(255,255,255,0.15)]">/</span>
        <span>PROD · IST (UTC+05:30)</span>
      </div>

      {/* Center: Search (Recessed charcoal surface with subtle border) */}
      <div className="flex-1 max-w-[440px] mx-6">
        <div className="relative flex items-center">
          <svg
            className="w-3.5 h-3.5 absolute left-2.5 text-[#A9A59C] pointer-events-none"
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
            className="w-full h-[28px] pl-8 pr-12 text-[11.5px] bg-[#171714] border border-[rgba(255,255,255,0.08)] rounded-[3px] text-[#F7F6F0] placeholder-[#A9A59C]/70 focus:outline-none focus:border-[rgba(255,255,255,0.2)] transition-all font-sans"
            readOnly
          />
          <span className="absolute right-2 text-[10px] font-mono font-medium text-[#A9A59C] border border-[rgba(255,255,255,0.08)] px-1 py-0.5 rounded-[2px] bg-[#22221E]">
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
