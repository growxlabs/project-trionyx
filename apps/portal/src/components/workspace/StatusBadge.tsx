import React from 'react';

export type BadgeTone = 'success' | 'danger' | 'warning' | 'info' | 'neutral';

export type OperationalStatus =
  | 'ACTIVE'
  | 'AVAILABLE'
  | 'HEALTHY'
  | 'RESOLVED'
  | 'VALID'
  | 'NORMAL'
  | 'AUDITED'
  | 'PENDING'
  | 'LOW'
  | 'UNASSIGNED'
  | 'IN_PROGRESS'
  | 'REVIEW'
  | 'LIMITED'
  | 'HIGH'
  | 'MEDIUM'
  | 'OUT_OF_STOCK'
  | 'OUT'
  | 'SUSPENDED'
  | 'VOIDED'
  | 'FAILED'
  | 'EXPIRED'
  | 'INACTIVE'
  | 'CRITICAL'
  | 'CRITICAL LOW'
  | 'CRITICAL_LOW'
  | 'CLOSED'
  | 'DRAFT'
  | 'PRIVATE'
  | 'PUBLIC'
  | 'ARCHIVED'
  | string;

export interface StatusBadgeProps {
  status: OperationalStatus;
  tone?: BadgeTone;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function StatusBadge({
  status,
  tone,
  label,
  size = 'sm',
  className = '',
}: StatusBadgeProps) {
  const norm = String(status).toUpperCase().trim();
  const raw = norm.replace(/_/g, ' ');
  const displayLabel = label || (raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase());

  let computedTone: BadgeTone = tone || 'neutral';

  if (!tone) {
    if (['ACTIVE', 'AVAILABLE', 'HEALTHY', 'RESOLVED', 'VALID', 'NORMAL', 'AUDITED', 'STABLE'].includes(norm)) {
      computedTone = 'success';
    } else if (
      [
        'PENDING',
        'LOW',
        'UNASSIGNED',
        'IN_PROGRESS',
        'REVIEW',
        'LIMITED',
        'MEDIUM',
        'WARN',
        'REQUIRES TRIAGE',
        'REQUIRES_TRIAGE',
        'NO HUB',
      ].includes(norm)
    ) {
      computedTone = 'warning';
    } else if (
      [
        'OUT_OF_STOCK',
        'OUT',
        'SUSPENDED',
        'VOIDED',
        'FAILED',
        'EXPIRED',
        'INACTIVE',
        'HIGH',
        'CRITICAL',
        'CRITICAL LOW',
        'CRITICAL_LOW',
      ].includes(norm)
    ) {
      computedTone = 'danger';
    } else if (['PUBLIC', 'INFO', 'DISPATCH', 'CONTACTED', 'CONVERTED'].includes(norm)) {
      computedTone = 'info';
    } else {
      computedTone = 'neutral';
    }
  }

  return (
    <span
      className={`unified-pill-badge rounded-full size-${size} tone-${computedTone} ${className}`}
    >
      {displayLabel}
    </span>
  );
}

