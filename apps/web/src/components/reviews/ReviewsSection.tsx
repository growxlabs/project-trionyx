'use client';

import React from 'react';
import { SectionFrame } from '../frame';
import styles from './ReviewsSection.module.css';
import { SectionEyebrow } from '../ui/SectionEyebrow';

export interface Review {
  id: string;
  category?: string;
  quote: string;
  name: string;
  role?: string;
  company?: string;
  city?: string;
}

// Populate only with testimonials verified and approved by Trionyx.
export const APPROVED_REVIEWS: Review[] = [];

export interface ReviewsSectionProps {
  reviews?: Review[];
}

export function ReviewsSection({ reviews = APPROVED_REVIEWS }: ReviewsSectionProps) {
  if (reviews.length === 0) return null;
  // Seamless loop by duplicating items for continuous transform from 0% to -50%
  const reelItems = [...reviews, ...reviews];

  return (
    <SectionFrame
      id="reviews"
      className={styles.section}
      aria-labelledby="reviews-heading"
      role="region"
      aria-label="Customer Reviews"
    >
      <div className={styles.inner}>
        {/* Editorial Section Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <SectionEyebrow>FROM THE STUDIO</SectionEyebrow>
            <h2 id="reviews-heading" className={styles.title}>
              Experience, <em>in their words.</em>
            </h2>
          </div>

          <div className={styles.headerRight}>
            <p className={styles.intro}>
              Perspectives from the studios and vehicle owners who work with Trionyx surface protection.
            </p>
          </div>
        </header>

        {/* Smooth Ambient Auto-Wrapping Reel */}
        <div
          className={styles.reelViewport}
          tabIndex={0}
          role="region"
          aria-roledescription="marquee"
          aria-label="Continuous client reviews reel. Hover or focus to pause."
        >
          <div className={styles.reelTrack}>
            {reelItems.map((review, i) => (
              <figure
                className={styles.frame}
                key={`${review.id}-frame-${i}`}
                aria-hidden={i >= reviews.length}
              >
                {review.category && (
                  <p className={styles.category}>{review.category}</p>
                )}
                <div className={styles.quoteBlock}>
                  <blockquote className={styles.quote}>
                    &ldquo;{review.quote}&rdquo;
                  </blockquote>
                </div>
                <figcaption className={styles.attribution}>
                  <div className={styles.authorDetails}>
                    <p className={styles.name}>{review.name}</p>
                    {(review.role || review.company) && (
                      <p className={styles.studio}>
                        {review.role && review.company
                          ? `${review.role} · ${review.company}`
                          : review.role || review.company}
                      </p>
                    )}
                    {review.city && <span className={styles.location}>{review.city}</span>}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </SectionFrame>
  );
}
