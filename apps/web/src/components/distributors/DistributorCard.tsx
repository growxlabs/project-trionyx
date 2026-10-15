import type { DistributorOpportunity } from '@/data/distributorLocations';
import styles from './Distributors.module.css';

export interface DistributorCardProps {
  opportunity: DistributorOpportunity;
  onEnquire: (opportunity: DistributorOpportunity) => void;
}

export function DistributorCard({ opportunity, onEnquire }: DistributorCardProps) {
  return (
    <article className={styles.row}>
      <h3>{opportunity.state}</h3>
      <span className={styles.label}>{opportunity.label}</span>
      <button type="button" onClick={() => onEnquire(opportunity)} className="pill-button pill-button-ghost">
        Enquire
      </button>
    </article>
  );
}
