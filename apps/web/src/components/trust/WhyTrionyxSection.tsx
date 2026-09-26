import React from 'react';
import Image from 'next/image';
import { SectionFrame } from '../frame';
import styles from './WhyTrionyxSection.module.css';

/**
 * WHY TRIONYX SECTION
 * 
 * Clean 4-Card Trust Section (No indexing 01-04, no pills/chips, no redundant descriptions):
 * - Card 1 (Since 2006): Dark anchor tile with prominent 2006 year display
 * - Card 2 (Product Range): Light tile with curved translucent material visual
 * - Card 3 (Dealer Support): Clean white tile with direct headline & copy
 * - Card 4 (Built for India): Warm sand tile with direct headline & copy
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

        {/* 4 Trust Cards Row */}
        <div className={styles.grid}>
          {/* ===================================================================== */}
          {/* CARD 01: SINCE 2006 (Dark Anchor)                                    */}
          {/* ===================================================================== */}
          <article className={`${styles.card} ${styles.cardExperience}`}>
            <div className={styles.yearDisplay}>2006</div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitleLight}>Since 2006</h3>
              <p className={styles.cardDescLight}>
                Nearly two decades of experience in the automotive products market.
              </p>
            </div>
          </article>

          {/* ===================================================================== */}
          {/* CARD 02: PRODUCT RANGE (Materials Visual Card)                       */}
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
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>Product Range</h3>
                <p className={styles.cardDesc}>
                  A growing portfolio across automotive protection, care and related categories.
                </p>
              </div>
            </div>
          </article>

          {/* ===================================================================== */}
          {/* CARD 03: DEALER SUPPORT (Clean White Card)                           */}
          {/* ===================================================================== */}
          <article className={`${styles.card} ${styles.cardSupport}`}>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>Dealer Support</h3>
              <p className={styles.cardDesc}>
                Product availability, practical guidance and support built around long-term dealer relationships.
              </p>
            </div>
          </article>

          {/* ===================================================================== */}
          {/* CARD 04: BUILT FOR INDIA (Warm Sand Tile)                            */}
          {/* ===================================================================== */}
          <article className={`${styles.card} ${styles.cardMarket}`}>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>Built for India</h3>
              <p className={styles.cardDesc}>
                Products and distribution shaped around Indian automotive demand and everyday operating conditions.
              </p>
            </div>
          </article>
        </div>
      </div>
    </SectionFrame>
  );
}
