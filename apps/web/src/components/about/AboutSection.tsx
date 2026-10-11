import React from 'react';
import Image from 'next/image';
import { SectionFrame } from '../frame';
import { ArrowRightIcon } from '../ui/Icons';
import styles from './AboutSection.module.css';

export interface AboutSectionProps {
  onCtaClick?: () => void;
}

/**
 * TRIONYX ABOUT SECTION
 *
 * Premium floating editorial section in Deep Petrol Green (#075B50) sitting
 * on top of the permanent warm Trionyx page canvas (#FFFFEB).
 *
 * - Canvas rhythm: warm page canvas → floating deep petrol green About section → warm page canvas
 * - Layout: ~46% imagery / 54% content on desktop, stacked on mobile (images first, text second)
 * - Eyebrow: #F26522
 * - Heading: #F7F6F0
 * - Body copy: #DAD8CF
 * - Metadata line: #F7F6F0 with subtle 1px border rgba(247, 246, 240, 0.18)
 * - CTA Button: transparent with warm-light border, hovering to #F7F6F0 / #075B50
 */
export const AboutSection: React.FC<AboutSectionProps> = ({ onCtaClick }) => {
  return (
    <SectionFrame
      id="about"
      hasBottomBorder
      className={styles.outerSection}
    >
      <div className={styles.panel}>
        {/* Imagery Column (Left on desktop/tablet, stacked first on mobile) */}
        <div className={styles.imageryCol}>
          <div className={styles.imageComposition}>
            {/* Primary Base Image: Precision workshop installation & coating activity */}
            <div className={styles.baseImageWrapper}>
              <Image
                src="/images/about/ppf-installation.jpg"
                alt="Automotive protective film and ceramic coating installation workshop"
                fill
                sizes="(max-width: 768px) 80vw, 40vw"
                className={styles.baseImage}
                priority={false}
              />
            </div>

            {/* Overlapping Secondary Accent Image: Premium vehicle finish & surface reflection */}
            <div className={styles.accentImageWrapper}>
              <Image
                src="/images/about/ceramic-coating-surface.jpg"
                alt="Hydrophobic ceramic coating and clearcoat finish on automotive surface"
                fill
                sizes="(max-width: 768px) 55vw, 25vw"
                className={styles.accentImage}
                priority={false}
              />
            </div>
          </div>
        </div>

        {/* Content Column (Right on desktop/tablet, stacked second on mobile) */}
        <div className={styles.contentCol}>
          {/* Eyebrow */}
          <span className={styles.eyebrow}>ABOUT TRIONYX</span>

          {/* Heading */}
          <h2 className={styles.heading}>
            Two decades in the automotive industry.
          </h2>

          {/* Body Copy */}
          <div className={styles.bodyCopy}>
            <p>
              Founded in 2006, Trionyx has spent nearly two decades working across the automotive products market, building experience around vehicle protection, care and related product categories.
            </p>
            <p>
              Today, Trionyx is expanding its product portfolio and strengthening its presence through installers and distributors across India, carrying forward the experience built since its early years in the industry.
            </p>
          </div>

          {/* Small Metadata Line */}
          <div className={styles.metadataLine}>
            <span className={styles.metadataText}>
              EST. 2006 &nbsp;·&nbsp; 20 YEARS
            </span>
          </div>

          {/* Single Action CTA */}
          <div className={styles.ctaWrapper}>
            <button
              type="button"
              onClick={onCtaClick}
              className={styles.ctaButton}
            >
              <span>About Trionyx</span>
              <ArrowRightIcon size={16} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </SectionFrame>
  );
};
