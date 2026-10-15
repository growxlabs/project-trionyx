'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { DISTRIBUTOR_OPPORTUNITIES, type DistributorOpportunity } from '@/data/distributorLocations';
import { DistributorCard } from './DistributorCard';
import { DistributorEnquiryModal } from './DistributorEnquiryModal';
import { PageIntro } from '../ui/PageIntro';
import styles from './Distributors.module.css';

export function DistributorsView() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  // Open the enquiry straight away when the URL names a state (?state=, ?location= or ?enquire=).
  const [activeOpportunity, setActiveOpportunity] = useState<DistributorOpportunity | null>(() => {
    const requested = (searchParams.get('state') || searchParams.get('location') || searchParams.get('enquire'))?.toLowerCase();
    if (!requested) return null;
    return (
      DISTRIBUTOR_OPPORTUNITIES.find((opp) => opp.state.toLowerCase().includes(requested) || opp.id.toLowerCase() === requested) ?? null
    );
  });

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
      <div className="site-container">
        <PageIntro title="Distributors." />

        <div className={styles.toolbar}>
          <div className={styles.search}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <label htmlFor="distributor-search" className="visually-hidden">
              Search locations
            </label>
            <input
              id="distributor-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search locations"
            />
          </div>
          <span className={styles.count} aria-live="polite">
            {filteredOpportunities.length} {filteredOpportunities.length === 1 ? 'location' : 'locations'}
          </span>
        </div>

        <section aria-label="Available locations" className={styles.list}>
          {filteredOpportunities.length === 0 ? (
            <div className={styles.empty}>
              <h2>No locations match &ldquo;{searchQuery}&rdquo;.</h2>
              <button type="button" className="text-link" onClick={() => setSearchQuery('')}>
                Clear search
              </button>
            </div>
          ) : (
            filteredOpportunities.map((opportunity) => (
              <DistributorCard key={opportunity.id} opportunity={opportunity} onEnquire={(opp) => setActiveOpportunity(opp)} />
            ))
          )}
        </section>
      </div>

      <DistributorEnquiryModal
        key={activeOpportunity?.id ?? 'closed'}
        opportunity={activeOpportunity}
        isOpen={Boolean(activeOpportunity)}
        onClose={() => setActiveOpportunity(null)}
      />
    </>
  );
}
