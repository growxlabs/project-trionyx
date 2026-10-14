import React from 'react';
import type { DistributorOpportunity } from '@/data/distributorLocations';

export interface DistributorCardProps {
  opportunity: DistributorOpportunity;
  onEnquire: (opportunity: DistributorOpportunity) => void;
}

export function DistributorCard({ opportunity, onEnquire }: DistributorCardProps) {
  return (
    <article
      style={{ maxWidth: '300px', width: '100%' }}
      className="group relative w-full max-w-[300px] mx-auto rounded-xl border border-[var(--color-hairline)] bg-[var(--color-surface)] p-4 sm:p-4.5 transition-all duration-200 hover:border-[rgba(236,231,222,0.22)] hover:bg-[#1A1916]"
    >
      <div>
        <h3 className="text-[15px] sm:text-base font-semibold tracking-tight text-[var(--color-text)]">
          {opportunity.state}
        </h3>
        <p className="mt-0.5 text-xs text-[var(--color-text-muted)] font-mono">
          {opportunity.label}
        </p>
      </div>

      <div className="mt-3.5 pt-3 border-t border-[var(--color-hairline)] flex items-center justify-between">
        <button
          type="button"
          onClick={() => onEnquire(opportunity)}
          className="pill-button !min-h-[32px] !h-[32px] !py-0 !px-4 !text-xs font-medium"
        >
          Enquire
        </button>
      </div>
    </article>
  );
}
