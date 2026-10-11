import Image from 'next/image';
import { SectionFrame } from '../frame';
import styles from './WhyTrionyxSection.module.css';
import { SectionEyebrow } from '../ui/SectionEyebrow';

const reasons = [
  { label: 'OUR PRODUCTS', title: 'Protection & care', description: 'Protection films, advanced coatings and care products for your vehicle’s surfaces.' },
  { label: 'OUR PARTNERS', title: 'Dealer support', description: 'Product guidance and availability support to help dealers serve their customers.' },
  { label: 'OUR FOCUS', title: 'Built for India', description: 'A portfolio shaped by Indian roads, everyday driving and local automotive needs.' },
];

export function WhyTrionyxSection() {
  return (
    <SectionFrame id="why-trionyx" className={styles.section} aria-labelledby="why-trionyx-heading">
      <div className={styles.inner}>
        <header className={styles.header}>
          <SectionEyebrow>WHY TRIONYX</SectionEyebrow>
          <h2 id="why-trionyx-heading">Built on experience.<br /><em>Focused on your vehicle.</em></h2>
        </header>

        <div className={styles.layout}>
          <article className={styles.foundation} aria-labelledby="foundation-heading">
            <div className={styles.foundationCopy}>
              <span className={styles.foundationLabel}>OUR FOUNDATION</span>
              <h3 id="foundation-heading"><span className={styles.since}>Since</span><span className={styles.year}>2006</span></h3>
              <p>Experience in automotive protection and care, built since 2006.</p>
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
