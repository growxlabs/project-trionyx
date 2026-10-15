'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { DISTRIBUTOR_OPPORTUNITIES, type DistributorOpportunity } from '@/data/distributorLocations';
import { DistributorCard } from './DistributorCard';
import { DistributorEnquiryModal } from './DistributorEnquiryModal';

export function DistributorsView() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeOpportunity, setActiveOpportunity] = useState<DistributorOpportunity | null>(null);

  // Auto-open modal if URL query specifies the state
  useEffect(() => {
    const requested = searchParams.get('state') || searchParams.get('location') || searchParams.get('enquire');
    if (requested) {
      const match = DISTRIBUTOR_OPPORTUNITIES.find(
        (opp) =>
          opp.state.toLowerCase().includes(requested.toLowerCase()) ||
          opp.id.toLowerCase() === requested.toLowerCase()
      );
      if (match) {
        setActiveOpportunity(match);
      }
    }
  }, [searchParams]);

  const filteredOpportunities = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return DISTRIBUTOR_OPPORTUNITIES;
    return DISTRIBUTOR_OPPORTUNITIES.filter(
      (opp) =>
        opp.state.toLowerCase().includes(query) ||
        opp.label.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <>
      {/* Header section with exact heading & subtext */}
      <section className="pt-16 pb-8 sm:pt-24 sm:pb-10 text-center">
        <div className="site-container max-w-3xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[var(--color-text)]">
            Distributors
          </h1>
          <p className="mt-3 text-base sm:text-lg text-[var(--color-text-muted)] leading-relaxed max-w-xl mx-auto">
            Explore available locations and enquire about becoming a Trionyx distributor.
          </p>

          {/* Compact search input matching card width */}
          <div className="mt-6 w-full max-w-[300px] mx-auto relative" style={{ maxWidth: '300px' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search locations..."
              className="w-full h-10 rounded-full border border-[var(--color-hairline)] bg-[rgba(236,231,222,0.05)] pl-9 pr-3 text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] transition-colors hover:border-[rgba(236,231,222,0.22)] focus:outline-none focus:border-[var(--color-text)] focus:bg-[rgba(236,231,222,0.07)]"
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--color-text-muted)]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Single Opportunity Card Section */}
      <section className="pb-20 sm:pb-28">
        <div className="w-full max-w-[300px] mx-auto px-4" style={{ maxWidth: '300px' }}>
          {filteredOpportunities.length === 0 ? (
            <div className="text-center py-8 rounded-xl border border-[var(--color-hairline)] bg-[var(--color-surface)] p-5">
              <p className="text-xs text-[var(--color-text)]">
                No locations found matching &ldquo;{searchQuery}&rdquo;
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="pill-button !min-h-[30px] !h-[30px] !py-0 !px-3 !text-xs mt-3 inline-flex"
              >
                Clear search
              </button>
            </div>
          ) : (
            filteredOpportunities.map((opportunity) => (
              <DistributorCard
                key={opportunity.id}
                opportunity={opportunity}
                onEnquire={(opp) => setActiveOpportunity(opp)}
              />
            ))
          )}
        </div>
      </section>

      {/* Enquiry Modal */}
      <DistributorEnquiryModal
        opportunity={activeOpportunity}
        isOpen={Boolean(activeOpportunity)}
        onClose={() => setActiveOpportunity(null)}
      />
    </>
  );
}
