import React from 'react';
import type { SafeUser } from '@trionyx/types';
import { formatRoleLabel } from '@trionyx/types';

interface ContextStripProps {
  user: SafeUser;
}

export function ContextStrip({ user }: ContextStripProps) {
  const currentDate = new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(new Date());

  const roleLabel = formatRoleLabel(user.role);

  return (
    <div className="hidden lg:flex items-center justify-between h-8 px-5 border-b border-[var(--border)] bg-[var(--surface-subtle)] text-[11px] font-mono text-[var(--text-secondary)] select-none">
      {/* Left: Operational Scope Hierarchy */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[var(--text-muted)] uppercase text-[10px]">Facility:</span>
          <span className="font-semibold text-[var(--text-primary)]">Delhi Central + Hubs</span>
        </div>
        <span className="text-[var(--border-strong)]">|</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[var(--text-muted)] uppercase text-[10px]">Period:</span>
          <span className="font-semibold text-[var(--text-primary)]">{currentDate}</span>
        </div>
        <span className="text-[var(--border-strong)]">|</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[var(--text-muted)] uppercase text-[10px]">Shift:</span>
          <span className="font-semibold text-[var(--text-primary)]">Active (Day)</span>
        </div>
        <span className="text-[var(--border-strong)]">|</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[var(--text-muted)] uppercase text-[10px]">Scope:</span>
          <span className="font-semibold text-[var(--text-primary)]">Authorized Studios</span>
        </div>
      </div>

      {/* Right: Operator Access Level */}
      <div className="flex items-center gap-2">
        <span className="text-[var(--text-muted)] uppercase text-[10px]">Access:</span>
        <span className="px-1.5 py-0.5 rounded-[2px] bg-[var(--surface-raised)] border border-[var(--border)] font-semibold text-[var(--text-primary)] text-[10.5px]">
          {roleLabel}
        </span>
      </div>
    </div>
  );
}
