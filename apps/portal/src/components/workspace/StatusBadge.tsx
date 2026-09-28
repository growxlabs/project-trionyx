import React from 'react';

export type OperationalStatus =
  | 'ACTIVE'
  | 'AVAILABLE'
  | 'HEALTHY'
  | 'RESOLVED'
  | 'PENDING'
  | 'LOW'
  | 'UNASSIGNED'
  | 'IN_PROGRESS'
  | 'REVIEW'
  | 'LIMITED'
  | 'HIGH'
  | 'MEDIUM'
  | 'OUT_OF_STOCK'
  | 'SUSPENDED'
  | 'VOIDED'
  | 'FAILED'
  | 'EXPIRED'
  | 'INACTIVE'
  | 'CLOSED'
  | 'DRAFT'
  | 'PRIVATE'
  | 'PUBLIC'
  | string;

interface StatusBadgeProps {
  status: OperationalStatus;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function StatusBadge({
  status,
  label,
  size = 'sm',
  className = '',
}: StatusBadgeProps) {
  const norm = String(status).toUpperCase().trim();
  const displayLabel = label || norm.replace(/_/g, ' ');

  let style = 'bg-[var(--surface-subtle)] text-[var(--text-secondary)] border-[var(--border)]';

  // Green / Healthy / Active
  if (['ACTIVE', 'AVAILABLE', 'HEALTHY', 'RESOLVED', 'PUBLIC', 'VALID'].includes(norm)) {
    style = 'bg-[var(--status-success-soft)] text-[var(--status-success)] border-[var(--status-success-border)]';
  }
  // Amber / Pending / Low / Unassigned / In Progress / Medium priority
  else if (['PENDING', 'LOW', 'UNASSIGNED', 'IN_PROGRESS', 'REVIEW', 'LIMITED', 'MEDIUM', 'WARN'].includes(norm)) {
    style = 'bg-[var(--status-warning-soft)] text-[var(--status-warning)] border-[var(--status-warning-border)]';
  }
  // Red / Out of Stock / Inactive / Suspended / High priority / Failed
  else if (['OUT_OF_STOCK', 'OUT', 'SUSPENDED', 'VOIDED', 'FAILED', 'EXPIRED', 'INACTIVE', 'HIGH', 'CRITICAL'].includes(norm)) {
    style = 'bg-[var(--status-danger-soft)] text-[var(--status-danger)] border-[var(--status-danger-border)]';
  }
  // Neutral / Closed / Private / Draft
  else if (['CLOSED', 'PRIVATE', 'DRAFT', 'ARCHIVED'].includes(norm)) {
    style = 'bg-[var(--surface-subtle)] text-[var(--text-muted)] border-[var(--border)]';
  }

  const sizeClass = size === 'sm' 
    ? 'text-[10px] px-2 py-0.5' 
    : 'text-[11px] px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center font-semibold uppercase tracking-[0.1em] rounded-[3px] border ${sizeClass} ${style} ${className}`}
    >
      {displayLabel}
    </span>
  );
}
