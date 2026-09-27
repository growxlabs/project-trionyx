'use client';

import React from 'react';
import { SectionFrame } from '../frame';
import styles from './ReviewsSection.module.css';

export interface Review {
  id: string;
  category?: string;
  quote: string;
  name: string;
  role?: string;
  company?: string;
  city?: string;
}

export const APPROVED_REVIEWS: Review[] = [
  {
    id: 'rev-01',
    category: 'PAINT PROTECTION FILM',
    quote: 'Trionyx PPF has elevated our detailing studio. The edge stretchability and self-healing clear coat make installation seamless on complex body contours.',
    name: 'Rajesh Varma',
    role: 'Lead Installer',
    company: 'Apex Auto Studio',
    city: 'Hyderabad',
  },
  {
    id: 'rev-02',
    category: 'CERAMIC COATING',
    quote: 'The hydrophobicity of Trionyx Ceramic Coating stands out against unpredictable monsoons. Customers frequently return commenting on the deep gloss retention.',
    name: 'Vikram Ram',
    role: 'Lead Detailer',
    company: 'Precision Detailing',
    city: 'Bengaluru',
  },
  {
    id: 'rev-03',
    category: 'LOGISTICS & SUPPORT',
    quote: 'Their technical team provided rapid logistics support and precision calibration sheets for our plotters. Unmatched response time across all our branches.',
    name: 'Vikram Malhotra',
    role: 'Director',
    company: 'Elite Detailers',
    city: 'Delhi NCR',
  },
  {
    id: 'rev-04',
    category: 'COMMERCIAL FLEET COATING',
    quote: 'We replaced imported brands with Trionyx 10H ceramic coating across our fleet. Gloss retention after six months is exceptional, at half the lead time.',
    name: 'Suresh Kothari',
    role: 'Fleet Operations',
    company: 'Grand Transports',
    city: 'Mumbai',
  },
  {
    id: 'rev-05',
    category: 'SELF-HEALING TPU FILM',
    quote: 'Self-healing properties on the Trionyx TPU film are genuinely instantaneous under warm water or sunlight. Optical clarity and scratch resistance are outstanding.',
    name: 'Farhan Qureshi',
    role: 'Owner',
    company: 'Porsche 911 GT3',
    city: 'Pune',
  },
  {
    id: 'rev-06',
    category: 'SURFACE PROTECTION',
    quote: 'Water and road grime simply sheet off during monsoon highway driving. Routine maintenance washes take half the time with durable hydrophobic protection.',
    name: 'Ananya Sen',
    role: 'Owner',
    company: 'BMW M3',
    city: 'Bengaluru',
  },
];

export interface ReviewsSectionProps {
  reviews?: Review[];
}

export function ReviewsSection({ reviews = APPROVED_REVIEWS }: ReviewsSectionProps) {
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
            <p className={styles.eyebrow}>
              <span className={styles.eyebrowLine} aria-hidden="true" />
              FROM THE STUDIO
            </p>
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
                  <div>
                    <p className={styles.name}>{review.name}</p>
                    {(review.role || review.company) && (
                      <p className={styles.studio}>
                        {review.role && review.company
                          ? `${review.role} · ${review.company}`
                          : review.role || review.company}
                      </p>
                    )}
                  </div>
                  {review.city && (
                    <span className={styles.location}>{review.city}</span>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </SectionFrame>
  );
}
