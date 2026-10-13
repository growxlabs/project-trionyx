import styles from './BrandStory.module.css';

const chapters = [
  { title: 'Made for the', emphasis: 'roads we know.' },
  { title: 'Designed around', emphasis: 'the vehicle.' },
  { title: 'Protection has', emphasis: 'many forms.' },
  { title: 'Beyond', emphasis: 'the product.' },
] as const;

/** Four perspectives on the Trionyx approach, as an editorial grid of statements. */
export function BrandStory() {
  return (
    <section id="trionyx-story" className={styles.section} aria-labelledby="story-heading">
      <div className="site-container">
        <h2 id="story-heading" className={styles.heading}>
          What drives us.
        </h2>
        <div className={styles.chapters}>
          {chapters.map((chapter) => (
            <h3 key={chapter.title} className={styles.chapter}>
              {chapter.title} <span>{chapter.emphasis}</span>
            </h3>
          ))}
        </div>
      </div>
    </section>
  );
}
