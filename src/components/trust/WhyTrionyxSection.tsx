import React from 'react';
import Image from 'next/image';
import { SectionFrame } from '../frame';
import styles from './WhyTrionyxSection.module.css';

/**
 * WHY TRIONYX SECTION
 * 
 * 4 Distinct Editorial Trust Cards in 1 Row (Desktop) / 2x2 (Mobile):
 * - Card 1 (Experience): Dark dramatic anchor with 2006 starting line & automotive focus
 * - Card 2 (Product Range): Light card with translucent curved protection film visual & category tags
 * - Card 3 (Dealer Support): Clean white card with DEALER FIRST badge & guidance copy
 * - Card 4 (Built for India): Warm sand tile with INDIA badge & operating condition chips
 */
export function WhyTrionyxSection() {
  return (
    <SectionFrame id="why-trionyx" className={styles.section} aria-labelledby="why-trionyx-heading">
      <div className={styles.innerContainer}>
        {/* Centered Header */}
        <div className={styles.header}>
          <h2 id="why-trionyx-heading" className={styles.title}>
            Built on experience. Chosen for what comes with it.
          </h2>
        </div>

        {/* 4 Editorial Trust Cards Row */}
        <div className={styles.grid}>
          {/* ===================================================================== */}
          {/* CARD 01: EXPERIENCE / SINCE 2006 (Dark Anchor)                       */}
          {/* ===================================================================== */}
          <article className={`${styles.card} ${styles.cardExperience}`}>
            <div>
              <div className={styles.cardTop}>
                <span className={styles.topLabelOrange}>01 / EXPERIENCE</span>
                <span className={styles.topMetaDark}>EST. 2006</span>
              </div>

              <div className={styles.yearDisplay}>
                2006
                <span className={styles.yearSub}>OUR STARTING LINE.</span>
              </div>

              <h3 className={styles.cardTitleLight}>Since 2006</h3>
              <p className={styles.cardDescLight}>
                Nearly two decades of experience in the automotive products market. A foundation built on understanding the market and the people who keep it moving.
              </p>
            </div>

            <div className={styles.cardFooterDark}>
              <span>AUTOMOTIVE FOCUS</span>
              <span>THEN. NOW. NEXT.</span>
            </div>
          </article>

          {/* ===================================================================== */}
          {/* CARD 02: THE PORTFOLIO / PRODUCT RANGE (Materials Visual Card)        */}
          {/* ===================================================================== */}
          <article className={`${styles.card} ${styles.cardPortfolio}`}>
            <div className={styles.materialImageWrapper}>
              <Image
                src="/trionyx-materials.png"
                alt="Automotive protective film translucent material"
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                priority={false}
              />
            </div>
            <div className={styles.portfolioOverlay} />

            <div className={styles.portfolioContent}>
              <div>
                <div className={styles.cardTop}>
                  <span className={styles.topLabelMuted}>02 / THE PORTFOLIO</span>
                </div>

                <h3 className={styles.cardTitle}>Product Range</h3>
                <p className={styles.cardStatement}>Protection. Care. Possibility.</p>
                <p className={styles.cardDesc}>
                  A growing automotive portfolio across protection, care and related categories.
                </p>
              </div>

              <div className={styles.tagWrapper}>
                <ul className={styles.tagList} aria-label="Product categories">
                  <li>Films</li>
                  <li>Coatings</li>
                  <li>Surface protection</li>
                </ul>
              </div>
            </div>
          </article>

          {/* ===================================================================== */}
          {/* CARD 03: THE PARTNERSHIP / DEALER SUPPORT (Clean White Card)          */}
          {/* ===================================================================== */}
          <article className={`${styles.card} ${styles.cardSupport}`}>
            <div>
              <div className={styles.cardTop}>
                <span className={styles.topLabelMuted}>03 / THE PARTNERSHIP</span>
                <span className={styles.statusBadge}>DEALER FIRST</span>
              </div>

              <h3 className={styles.cardTitle}>Dealer Support</h3>
              <p className={styles.cardStatement}>More than supply. Support that stays.</p>
              <p className={styles.cardDesc}>
                Product availability, practical guidance and support built around long-term dealer relationships.
              </p>
            </div>

            <div className={styles.supportFooter}>
              <span>AVAILABILITY</span>
              <span>GUIDANCE</span>
              <span>PARTNERSHIP</span>
            </div>
          </article>

          {/* ===================================================================== */}
          {/* CARD 04: OUR MARKET / BUILT FOR INDIA (Warm Sand Tile)                */}
          {/* ===================================================================== */}
          <article className={`${styles.card} ${styles.cardMarket}`}>
            <div>
              <div className={styles.cardTop}>
                <span className={styles.topLabelMuted}>04 / OUR MARKET</span>
                <span className={styles.marketBadge}>INDIA</span>
              </div>

              <h3 className={styles.cardTitle}>Built for India</h3>
              <p className={styles.cardStatement}>For the roads we call home.</p>
              <p className={styles.cardDesc}>
                Products and distribution shaped around Indian automotive demand and everyday operating conditions.
              </p>
            </div>

            <div>
              <div className={styles.conditionsList}>
                <span>Summer heat</span>
                <span>Monsoon days</span>
                <span>Everyday roads</span>
              </div>
              <div className={styles.marketFooter}>
                LOCAL UNDERSTANDING
              </div>
            </div>
          </article>
        </div>
      </div>
    </SectionFrame>
  );
}
