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
    src: '/images/about/ppf-installation.jpg',
    alt: 'Automotive protective film precision installation in workshop',
    label: '01 / 04 · SINCE 2006',
  },
  {
    src: '/trionyx-materials.png',
    alt: 'Curved translucent protection film and automotive orange material layers',
    label: '02 / 04 · THE PORTFOLIO',
  },
  {
    src: '/images/about/installation.jpg',
    alt: 'Certified automotive installer partner workshop studio',
    label: '03 / 04 · DEALER SUPPORT',
  },
  {
    src: '/images/about/ceramic-coating-surface.jpg',
    alt: 'Automotive ceramic coating water sheeting under demanding road conditions',
    label: '04 / 04 · BUILT FOR INDIA',
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
            <div className={styles.visualVignette} />
          </div>

          {/* Floating Phase Pill Indicator */}
          <div className={styles.stickyStatusPill}>
            <span className={styles.stickyStatusDot} />
            <span className={styles.stickyStatusText}>
              {visualPhases[activeCardIndex]?.label || visualPhases[0].label}
            </span>
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
              <h3>Experience that<br />moves you forward.</h3>
              <p>Two decades in automotive products. A foundation built on understanding the market and the people who keep it moving.</p>
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

          {/* ----------------------------------------------------------------------- */}
          {/* CARD 03: The Partnership / Dealer Support (Clean White Editorial)      */}
          {/* ----------------------------------------------------------------------- */}
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

            <div className={styles.proofSteps}>
              <div>
                <span>01</span>
                <strong>Choose</strong>
                <small>Product guidance</small>
              </div>
              <div>
                <span>02</span>
                <strong>Source</strong>
                <small>Availability support</small>
              </div>
              <div>
                <span>03</span>
                <strong>Grow</strong>
                <small>Lasting relationships</small>
              </div>
            </div>
          </article>

          {/* ----------------------------------------------------------------------- */}
          {/* CARD 04: Our Market / Built For India (Warm Neutral Sand Tile)         */}
          {/* ----------------------------------------------------------------------- */}
          <article
            ref={(el) => { cardRefs.current[3] = el; }}
            className={`${styles.card} ${styles.cardMarket}`}
          >
            <div className={styles.cardTop}>
              <span>04 / OUR MARKET</span>
              <span>INDIA</span>
            </div>

            <div className={styles.marketContent}>
              <div>
                <h3>For the roads<br />we call home.</h3>
                <p>Products and distribution shaped around Indian automotive demand and everyday operating conditions.</p>
              </div>

              <div className={styles.conditionList}>
                <span>Summer heat</span>
                <span>Monsoon days</span>
                <span>Everyday roads</span>
              </div>
            </div>

            <div className={styles.cardMarketFooter}>
              LOCAL UNDERSTANDING. LONG-TERM COMMITMENT.
            </div>
          </article>
        </div>
      </div>
    </SectionFrame>
  );
}
