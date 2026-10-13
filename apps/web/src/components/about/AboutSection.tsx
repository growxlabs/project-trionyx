import styles from './AboutSection.module.css';

/** Opening statement about Trionyx, set large. */
export function AboutSection() {
  return (
    <section id="about" className={styles.section} aria-labelledby="about-title">
      <div className="site-container">
        <h2 id="about-title" className={styles.statement}>
          Since 2006, Trionyx has worked across the automotive products market,{' '}
          <span>building two decades of experience in vehicle protection and care.</span>
        </h2>
        <a className="text-link" href="#trionyx-story">
          What drives us <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  );
}
