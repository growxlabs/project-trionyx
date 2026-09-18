import Image from 'next/image';
import { SectionFrame } from '../frame';
import styles from './WhyTrionyxSection.module.css';

export function WhyTrionyxSection() {
  return (
    <SectionFrame id="why-trionyx" className={styles.section} aria-labelledby="why-trionyx-heading">
      <div className={styles.headingRow}>
        <div>
          <p className={styles.eyebrow}>THE TRIONYX DIFFERENCE</p>
          <h2 id="why-trionyx-heading">Built on experience.<br /><span>Chosen for what comes with it.</span></h2>
        </div>
        <p className={styles.intro}>The right products are only the beginning. Experience, guidance and lasting dealer relationships make the difference.</p>
      </div>

      <div className={styles.grid}>
        <article className={`${styles.card} ${styles.heritage}`}>
          <div className={styles.cardTop}><span>01 / EXPERIENCE</span><span>EST. 2006</span></div>
          <div className={styles.year}>2006<span>Our starting line.</span></div>
          <div className={styles.cardBottom}>
            <h3>Experience that<br />moves you forward.</h3>
            <p>Two decades in automotive products. A foundation built on understanding the market and the people who keep it moving.</p>
          </div>
          <div className={styles.heritageFooter}><span>AUTOMOTIVE FOCUS</span><span>THEN. NOW. NEXT.</span></div>
        </article>

        <article className={`${styles.card} ${styles.products}`}>
          <div className={styles.materialImage}>
            <Image src="/trionyx-materials.png" alt="Curved translucent protection film and orange and charcoal automotive surfaces" fill sizes="(max-width: 760px) 100vw, 55vw" />
          </div>
          <div className={styles.productContent}>
            <div className={styles.cardTop}><span>02 / THE PORTFOLIO</span></div>
            <h3>Protection.<br />Care. Possibility.</h3>
            <p>A growing automotive portfolio, with a clear focus on the details that matter.</p>
            <ul className={styles.tags} aria-label="Product categories"><li>Films</li><li>Coatings</li><li>Surface protection</li></ul>
          </div>
        </article>

        <article className={`${styles.card} ${styles.support}`}>
          <div className={styles.cardTop}><span>03 / THE PARTNERSHIP</span><span className={styles.status}>DEALER FIRST</span></div>
          <h3>More than supply.<br />Support that stays.</h3>
          <p>Product availability, practical guidance and support built around long-term dealer relationships.</p>
          <div className={styles.supportSteps}>
            <div><span>01</span><strong>Choose</strong><small>Product guidance</small></div>
            <div><span>02</span><strong>Source</strong><small>Availability support</small></div>
            <div><span>03</span><strong>Grow</strong><small>Lasting relationships</small></div>
          </div>
        </article>

        <article className={`${styles.card} ${styles.india}`}>
          <div className={styles.cardTop}><span>04 / OUR MARKET</span><span>INDIA</span></div>
          <div className={styles.indiaContent}>
            <div><h3>For the roads<br />we call home.</h3><p>Products and distribution shaped around Indian automotive demand and everyday operating conditions.</p></div>
            <div className={styles.conditions}><span>Summer heat</span><span>Monsoon days</span><span>Everyday roads</span></div>
          </div>
          <div className={styles.indiaFooter}>LOCAL UNDERSTANDING. LONG-TERM COMMITMENT.</div>
        </article>
      </div>
    </SectionFrame>
  );
}
