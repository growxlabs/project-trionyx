import Link from 'next/link';
import { MeshGradientCanvas } from './MeshGradientCanvas';
import styles from './HeroSection.module.css';

export interface HeroContentProps {
  /** Each entry is set on its own line and never wraps. */
  lines?: readonly [string, string];
}

export const HeroSection = ({ lines = ['Engineered for the road.', 'Designed around your vehicle.'] }: HeroContentProps) => {
  return (
    <section id="hero" className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.media} aria-hidden="true">
        <MeshGradientCanvas />
        <div className={styles.vignette} />
        <div className={styles.grid} />
      </div>

      <div className="site-container">
        <h1 id="hero-title" className={styles.headline}>
          <span>{lines[0]}</span> <span>{lines[1]}</span>
        </h1>
        <div className={styles.actions}>
          <Link href="/contact" className="pill-button">
            Contact
          </Link>
          <Link href="/dealer-access" className="pill-button pill-button-ghost">
            Distributor
          </Link>
        </div>
      </div>

      {/* Abstract symbols at the foot of the hero, aligned with the headline */}
      <div className={`site-container ${styles.marks}`} aria-hidden="true">
        <svg className={styles.symbol} viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="21" />
          <circle className={styles.targetRing} cx="24" cy="24" r="13" strokeDasharray="5 4" />
          <circle cx="24" cy="24" r="4" fill="currentColor" stroke="none" />
          <path d="M24 3v6M24 39v6M3 24h6M39 24h6" />
        </svg>
        <svg className={styles.symbol} viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="21" />
          <path className={styles.arrow} d="M24 13v21M16 26l8 8 8-8" />
        </svg>
        <svg className={styles.symbol} viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="21" />
          <path d="M15 15h18M24 15v19" />
        </svg>
      </div>
    </section>
  );
};
