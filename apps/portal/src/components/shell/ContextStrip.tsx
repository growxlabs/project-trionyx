import React from 'react';
import type { SafeUser } from '@trionyx/types';
import { formatRoleLabel } from '@trionyx/types';

interface ContextStripProps {
  user: SafeUser;
  facility?: string;
  period?: string;
  shift?: string;
  scope?: string;
}

export function ContextStrip({
  user,
  facility = 'All Locations (Delhi Central + Hubs)',
  period,
  shift = 'Active (Day)',
  scope = 'Authorized Applicator Network',
}: ContextStripProps) {
  const currentDate =
    period ||
    new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
    }).format(new Date());

  const roleLabel = formatRoleLabel(user.role);

  return (
    <div className="hidden lg:flex items-center justify-between h-8 px-7 border-b border-[var(--border)] bg-[var(--surface-subtle)] text-[11px] font-mono text-[var(--text-secondary)] select-none">
      {/* Operational Scope Hierarchy (Plain English) */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[var(--text-muted)] uppercase">Facility:</span>
          <span className="font-semibold text-[var(--text-primary)]">{facility}</span>
        </div>
        <span className="text-[var(--border-strong)]">|</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[var(--text-muted)] uppercase">Period:</span>
          <span className="font-semibold text-[var(--text-primary)]">{currentDate}</span>
        </div>
        <span className="text-[var(--border-strong)]">|</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[var(--text-muted)] uppercase">Shift:</span>
          <span className="font-semibold text-[var(--text-primary)]">{shift}</span>
        </div>
        <span className="text-[var(--border-strong)]">|</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[var(--text-muted)] uppercase">Scope:</span>
          <span className="font-semibold text-[var(--text-primary)]">{scope}</span>
        </div>
      </div>

      {/* Operator Access Scope */}
      <div className="flex items-center gap-2">
        <span className="text-[var(--text-muted)] uppercase">Access:</span>
        <span className="px-1.5 py-0.2 rounded-[2px] bg-[var(--surface-raised)] border border-[var(--border)] font-semibold text-[var(--text-primary)] text-[10.5px]">
          {roleLabel}
        </span>
      </div>
    </div>
  );
}
