import Image from 'next/image';
import { SectionFrame } from '../frame';
import styles from './WhyTrionyxSection.module.css';

const reasons = [
  { label: 'THE PORTFOLIO', title: 'Product Range', description: 'A growing portfolio across automotive protection, care and related categories.' },
  { label: 'THE PARTNERSHIP', title: 'Dealer Support', description: 'Product availability, practical guidance and support built around long-term dealer relationships.' },
  { label: 'THE PERSPECTIVE', title: 'Built for India', description: 'Products and distribution shaped around Indian automotive demand and everyday operating conditions.' },
];

export function WhyTrionyxSection() {
  return (
    <SectionFrame id="why-trionyx" className={styles.section} aria-labelledby="why-trionyx-heading">
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}><span aria-hidden="true" /> WHY TRIONYX</p>
          <h2 id="why-trionyx-heading">Built on experience.<br /><em>Chosen for what comes with it.</em></h2>
        </header>

        <div className={styles.layout}>
          <article className={styles.foundation} aria-labelledby="foundation-heading">
            <div className={styles.foundationCopy}>
              <span className={styles.foundationLabel}>OUR FOUNDATION</span>
              <h3 id="foundation-heading"><span className={styles.since}>Since</span><span className={styles.year}>2006</span></h3>
              <p>Nearly two decades of experience in the automotive products market.</p>
            </div>
            <div className={styles.material} aria-hidden="true">
              <Image src="/trionyx-materials.png" alt="" fill sizes="(max-width: 760px) 100vw, 40vw" className={styles.image} />
            </div>
          </article>

          <div className={styles.reasons}>
            {reasons.map((reason) => (
              <article key={reason.title} className={styles.reason}>
                <p className={styles.label}>{reason.label}</p>
                <div className={styles.reasonBody}>
                  <h3>{reason.title}</h3>
                  <p>{reason.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </SectionFrame>
  );
}
