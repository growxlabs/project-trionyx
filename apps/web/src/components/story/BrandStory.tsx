'use client';

import { useRef, useState } from 'react';
import styles from './BrandStory.module.css';
import { SectionEyebrow } from '../ui/SectionEyebrow';

const chapters = [
  {
    number: '01',
    label: 'The road',
    title: 'Made for the',
    emphasis: 'roads we know.',
    body: 'India’s heat, dust and everyday driving conditions shape how Trionyx thinks about vehicle protection and care.',
    note: 'BUILT FOR INDIA',
    motif: 'road',
  },
  {
    number: '02',
    label: 'The thinking',
    title: 'Designed around',
    emphasis: 'the vehicle.',
    body: 'The aim is simple: products that consider how a vehicle looks, performs and endures over time.',
    note: 'ALWAYS EXCEED EXPECTATIONS',
    motif: 'thinking',
  },
  {
    number: '03',
    label: 'The materials',
    title: 'Protection has',
    emphasis: 'many forms.',
    body: 'From coatings and protective films to automotive care and accessories, the range continues to grow.',
    note: 'A GROWING PORTFOLIO',
    motif: 'materials',
  },
  {
    number: '04',
    label: 'The people',
    title: 'Beyond',
    emphasis: 'the product.',
    body: 'Installers and distributors carry the experience forward, supported by product availability and practical guidance.',
    note: 'PARTNERS IN THE PROCESS',
    motif: 'people',
  },
] as const;

export function BrandStory() {
  const [active, setActive] = useState(0);
  const chapterButtons = useRef<Array<HTMLButtonElement | null>>([]);

  return (
    <section id="trionyx-story" className={styles.section} aria-labelledby="story-heading">
      <div className={styles.intro}>
        <div>
          <SectionEyebrow>THE TRIONYX STORY</SectionEyebrow>
          <h2 id="story-heading">What drives us.</h2>
        </div>
        <p className={styles.introText}>Four perspectives on a more considered approach to automotive care.</p>
      </div>

      <div className={styles.gallery}>
        {chapters.map((chapter, index) => {
          const expanded = active === index;
          return (
            <article
              key={chapter.number}
              className={`${styles.card} ${styles[chapter.motif]} ${expanded ? styles.expanded : ''}`}
            >
              <div className={styles.art} aria-hidden="true"><span>{chapter.number}</span></div>
              <button
                type="button"
                className={styles.trigger}
                ref={(button) => { chapterButtons.current[index] = button; }}
                aria-label={`${expanded ? 'Showing' : 'Show'} chapter ${chapter.number}: ${chapter.label}`}
                aria-expanded={expanded}
                aria-controls={`story-chapter-${chapter.number}`}
                onClick={() => setActive(index)}
              >
                <span className={styles.number}>{chapter.number}<span className={styles.numberTotal}> / 04</span></span>
                <span className={styles.closedLabel}>{chapter.label}</span>
                <span className={styles.toggle} aria-hidden="true">{expanded ? '−' : '+'}</span>
              </button>

              <div
                id={`story-chapter-${chapter.number}`}
                className={styles.content}
                aria-hidden={!expanded}
                inert={!expanded}
              >
                <p className={styles.chapterLabel}>{chapter.label}</p>
                <div className={styles.copy}>
                  <span className={styles.rule} aria-hidden="true" />
                  <h3>{chapter.title}<em>{chapter.emphasis}</em></h3>
                  <p>{chapter.body}</p>
                </div>
                <div className={styles.note}>
                  <span>{chapter.note}</span>
                  <button
                    type="button"
                    className={styles.next}
                    onClick={() => {
                      const next = (index + 1) % chapters.length;
                      setActive(next);
                      chapterButtons.current[next]?.focus();
                    }}
                    aria-label={`Read next chapter: ${chapters[(index + 1) % chapters.length].label}`}
                  >
                    {index === chapters.length - 1 ? 'Back to the beginning' : 'Next chapter'} <span aria-hidden="true">→</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className={styles.footer}>
        <span>EST. 2006</span>
        <span>SELECT A CHAPTER TO EXPLORE</span>
        <span>ALWAYS EXCEED EXPECTATIONS</span>
      </div>
    </section>
  );
}
