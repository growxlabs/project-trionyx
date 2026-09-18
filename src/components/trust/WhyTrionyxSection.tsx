'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { SectionFrame } from '../frame';
import styles from './WhyTrionyxSection.module.css';

interface VisualPhase {
  src: string;
  alt: string;
  label: string;
}

const visualPhases: VisualPhase[] = [
  {
    src: '/images/about/experience-workbench.png',
    alt: 'Illustrative automotive application workbench with film samples and experienced technician hands',
    label: '01 / 04 · SINCE 2006',
  },
  {
    src: '/trionyx-materials.png',
    alt: 'Curved translucent protection film and automotive orange material layers',
    label: '02 / 04 · THE PORTFOLIO',
  },
  {
    src: '/images/about/dealer-distribution.png',
    alt: 'Illustrative automotive distribution team checking inventory and outbound product boxes',
    label: '03 / 04 · DEALER SUPPORT',
  },
  {
    src: '/images/about/india-road.png',
    alt: 'Illustrative vehicle on a rain-damp Kerala road with palms and local roadside buildings',
    label: '04 / 04 · INDIA',
  },
];

export function WhyTrionyxSection() {
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    // Only run intersection observer on desktop viewports
    if (typeof window === 'undefined' || window.innerWidth <= 1024) return;

    const observers: IntersectionObserver[] = [];

    cardRefs.current.forEach((el, index) => {
      if (!el) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveCardIndex(index);
            }
          });
        },
        {
          root: null,
          rootMargin: '-30% 0px -40% 0px',
          threshold: 0.2,
        }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);

  return (
    <SectionFrame id="why-trionyx" className={styles.section} aria-labelledby="why-trionyx-heading">
      {/* Section Header Row */}
      <div className={styles.headingRow}>
        <div className={styles.eyebrowContainer}>
          <span className={styles.eyebrowDot} aria-hidden="true" />
          <p className={styles.eyebrow}>WHY TRIONYX</p>
        </div>
        <h2 id="why-trionyx-heading">
          Built on experience.<br />
          <span>Proven through the product.</span>
        </h2>
      </div>

      {/* Mobile-Only Hero Automotive Visual (Directly after Heading) */}
      <div className={styles.mobileVisual}>
        <Image
          src="/trionyx-materials.png"
          alt="Curved translucent protection film and orange automotive surfaces"
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority={false}
        />
      </div>

      {/* Main Two-Column Sticky Scroll Storytelling Container */}
      <div className={styles.storyContainer}>
        {/* ========================================================================= */}
        {/* LEFT COLUMN: STICKY AUTOMOTIVE VISUAL (Pins during desktop scroll)       */}
        {/* ========================================================================= */}
        <div className={styles.stickyVisualColumn} aria-hidden="true">
          <div className={styles.visualImageWrapper}>
            {visualPhases.map((phase, idx) => (
              <div
                key={phase.label}
                className={`${styles.visualLayer} ${
                  activeCardIndex === idx ? styles.visualLayerActive : ''
                }`}
              >
                <Image
                  src={phase.src}
                  alt={phase.alt}
                  fill
                  sizes="(min-width: 1025px) 45vw, 100vw"
                  priority={idx === 0}
                />
              </div>
            ))}
          </div>
          <div className={styles.cardTop} style={{ position: 'relative', zIndex: 2, alignSelf: 'flex-start', padding: '10px 14px', borderRadius: 6, background: '#F7F6F0', color: '#171714' }}>
            {visualPhases[activeCardIndex].label}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: 4 SCROLLING TRUST CARDS STACKED VERTICALLY                  */}
        {/* ========================================================================= */}
        <div className={styles.scrollingCardsColumn}>
          {/* ----------------------------------------------------------------------- */}
          {/* CARD 01: Experience (Dark & Dramatic)                                  */}
          {/* ----------------------------------------------------------------------- */}
          <article
            ref={(el) => { cardRefs.current[0] = el; }}
            className={`${styles.card} ${styles.cardExperience}`}
          >
            <div className={styles.cardTop}>
              <span>01 / EXPERIENCE</span>
              <span>EST. 2006</span>
            </div>

            <div className={styles.yearDisplay}>
              2006
              <span>Our starting line.</span>
            </div>

            <div className={styles.experienceBody}>
              <h3>Since 2006</h3>
              <p>Nearly two decades in the automotive products market.</p>
            </div>

            <div className={styles.cardExperienceFooter}>
              <span>AUTOMOTIVE FOCUS</span>
              <span>THEN. NOW. NEXT.</span>
            </div>
          </article>

          {/* ----------------------------------------------------------------------- */}
          {/* CARD 02: Portfolio (Light + Product Material Visual)                   */}
          {/* ----------------------------------------------------------------------- */}
          <article
            ref={(el) => { cardRefs.current[1] = el; }}
            className={`${styles.card} ${styles.cardPortfolio}`}
          >
            <div className={styles.cardPortfolioImage}>
              <Image
                src="/trionyx-materials.png"
                alt="Automotive protective film translucent material"
                fill
                sizes="(max-width: 1024px) 100vw, 35vw"
                priority={false}
              />
            </div>

            <div className={styles.cardPortfolioContent}>
              <div>
                <div className={styles.cardTop}>
                  <span>02 / THE PORTFOLIO</span>
                </div>
                <h3>Protection.<br />Care. Possibility.</h3>
                <p>A growing automotive portfolio focused on the details that matter.</p>
              </div>

              <ul className={styles.tagList} aria-label="Product categories">
                <li>Films</li>
                <li>Coatings</li>
                <li>Surface protection</li>
              </ul>
            </div>
          </article>

          <article
            ref={(el) => { cardRefs.current[2] = el; }}
            className={`${styles.card} ${styles.cardPartnership}`}
          >
            <div>
              <div className={styles.cardTop}>
                <span>03 / THE PARTNERSHIP</span>
                <span className={styles.statusPill}>DEALER FIRST</span>
              </div>
              <h3>More than supply.<br />Support that stays.</h3>
              <p>Product availability, practical guidance and support built around long-term dealer relationships.</p>
            </div>
          </article>

          {/* ----------------------------------------------------------------------- */}
          {/* CARD 04: Our Market / Built For India (Warm Neutral Sand Tile)         */}
          {/* ----------------------------------------------------------------------- */}
          <article
            ref={(el) => { cardRefs.current[3] = el; }}
            className={`${styles.card} ${styles.cardMarket}`}
          >
            <div>
              <div className={styles.cardTop}>
                <span>04 / OUR MARKET</span>
                <span>INDIA</span>
              </div>

              <h3>For the roads<br />we call home.</h3>
              <p>Products and distribution shaped around Indian automotive demand and everyday operating conditions.</p>
            </div>
          </article>
        </div>
      </div>
    </SectionFrame>
  );
}
