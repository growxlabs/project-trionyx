'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { SectionFrame } from '../frame';
import styles from './ReviewsSection.module.css';

export type ReviewTheme = 'green' | 'cream' | 'orange' | 'lavender' | 'oxblood' | 'navy';
export type CardType = 'landscape-image' | 'square' | 'wide';

export interface Review {
  id: string;
  category?: string;
  quote: string;
  name: string;
  role?: string;
  company?: string;
  city?: string;
  image?: string;
  theme?: ReviewTheme;
  cardType?: CardType;
}

export const APPROVED_REVIEWS: Review[] = [
  {
    id: 'rev-01',
    category: 'GRAPHENE COATING',
    quote:
      'Trionyx Graphene Coating has elevated our detailing studio. The slick finish, heat dissipation, and water contact angle make application seamless on high-end vehicles.',
    name: 'Rajesh Varma',
    role: 'Lead Installer',
    company: 'Apex Auto Studio',
    city: 'Hyderabad',
    image: '/images/hero/graphene-protected-vehicle.png',
    theme: 'green',
    cardType: 'landscape-image',
  },
  {
    id: 'rev-02',
    category: 'CERAMIC COATING',
    quote:
      'The hydrophobicity of Trionyx Ceramic Coating stands out against unpredictable monsoons. Customers frequently return commenting on the deep gloss retention.',
    name: 'Vikram Ram',
    role: 'Lead Detailer',
    company: 'Precision Detailing',
    city: 'Bengaluru',
    theme: 'cream',
    cardType: 'square',
  },
  {
    id: 'rev-03',
    category: 'COMMERCIAL FLEET COATING',
    quote:
      'We replaced imported brands with Trionyx 10H ceramic coating across our fleet. Gloss retention after six months is exceptional, at half the lead time.',
    name: 'Suresh Kothari',
    role: 'Fleet Operations',
    company: 'Grand Transports',
    city: 'Mumbai',
    image: '/images/about/ceramic-coating-surface.jpg',
    theme: 'orange',
    cardType: 'landscape-image',
  },
  {
    id: 'rev-04',
    category: 'LOGISTICS & SUPPORT',
    quote:
      'Their technical team provided rapid logistics support and precision application guides. Unmatched response time across all our branches.',
    name: 'Vikram Malhotra',
    role: 'Director',
    company: 'Elite Detailers',
    city: 'Delhi NCR',
    theme: 'lavender',
    cardType: 'square',
  },
  {
    id: 'rev-05',
    category: 'BOROPHENE COATING',
    quote:
      'The advanced hardness and chemical resilience of Trionyx Borophene Coating provide outstanding protection against environmental contaminants.',
    name: 'Farhan Qureshi',
    role: 'Owner',
    company: 'Porsche 911 GT3',
    city: 'Pune',
    theme: 'oxblood',
    cardType: 'wide',
  },
  {
    id: 'rev-06',
    category: 'SURFACE PROTECTION',
    quote:
      'Water and road grime simply sheet off during monsoon highway driving. Routine maintenance washes take half the time with durable hydrophobic protection.',
    name: 'Ananya Sen',
    role: 'Owner',
    company: 'BMW M3',
    city: 'Bengaluru',
    theme: 'navy',
    cardType: 'wide',
  },
];

interface Keyframe {
  p: number;
  x: number;
  y: number;
  scale: number;
  rot: number;
  opacity: number;
  zIndex: number;
}

// Wispr Flow Layered Deck Positions (6 cards choreography across [0, 1])
const KEYFRAMES_MAP: Record<number, Keyframe[]> = {
  // Card 0 (Emerald Green): Starts dominant active center -> glides to bottom-left peek -> fades out
  0: [
    { p: 0.0, x: 0, y: -10, scale: 1.0, rot: 0, opacity: 1.0, zIndex: 12 },
    { p: 0.08, x: 0, y: -10, scale: 1.0, rot: 0, opacity: 1.0, zIndex: 12 },
    { p: 0.2, x: -330, y: 150, scale: 0.88, rot: -3.5, opacity: 0.88, zIndex: 5 },
    { p: 0.28, x: -520, y: 240, scale: 0.82, rot: -5.0, opacity: 0.0, zIndex: 1 },
    { p: 1.0, x: -520, y: 240, scale: 0.82, rot: -5.0, opacity: 0.0, zIndex: 1 },
  ],
  // Card 1 (Warm Cream): Starts peeking bottom-left -> glides into center -> shifts away
  1: [
    { p: 0.0, x: -330, y: 150, scale: 0.88, rot: -3.5, opacity: 0.88, zIndex: 5 },
    { p: 0.08, x: -330, y: 150, scale: 0.88, rot: -3.5, opacity: 0.88, zIndex: 5 },
    { p: 0.2, x: 0, y: -10, scale: 1.0, rot: 0, opacity: 1.0, zIndex: 12 },
    { p: 0.28, x: 0, y: -10, scale: 1.0, rot: 0, opacity: 1.0, zIndex: 12 },
    { p: 0.4, x: -330, y: 150, scale: 0.88, rot: -3.5, opacity: 0.85, zIndex: 5 },
    { p: 0.48, x: -520, y: 240, scale: 0.82, rot: -5.0, opacity: 0.0, zIndex: 1 },
    { p: 1.0, x: -520, y: 240, scale: 0.82, rot: -5.0, opacity: 0.0, zIndex: 1 },
  ],
  // Card 2 (Warm Orange): Starts peeking top-right -> glides into center -> shifts away
  2: [
    { p: 0.0, x: 340, y: -130, scale: 0.88, rot: 3.0, opacity: 0.88, zIndex: 5 },
    { p: 0.22, x: 340, y: -130, scale: 0.88, rot: 3.0, opacity: 0.88, zIndex: 5 },
    { p: 0.38, x: 0, y: -10, scale: 1.0, rot: 0, opacity: 1.0, zIndex: 12 },
    { p: 0.46, x: 0, y: -10, scale: 1.0, rot: 0, opacity: 1.0, zIndex: 12 },
    { p: 0.58, x: -330, y: 150, scale: 0.88, rot: -3.5, opacity: 0.85, zIndex: 5 },
    { p: 0.66, x: -520, y: 240, scale: 0.82, rot: -5.0, opacity: 0.0, zIndex: 1 },
    { p: 1.0, x: -520, y: 240, scale: 0.82, rot: -5.0, opacity: 0.0, zIndex: 1 },
  ],
  // Card 3 (Soft Lavender): Waiting -> enters top-right -> glides into center -> shifts away
  3: [
    { p: 0.0, x: 480, y: -180, scale: 0.82, rot: 4.5, opacity: 0.0, zIndex: 1 },
    { p: 0.26, x: 480, y: -180, scale: 0.82, rot: 4.5, opacity: 0.0, zIndex: 1 },
    { p: 0.38, x: 340, y: -130, scale: 0.88, rot: 3.0, opacity: 0.88, zIndex: 5 },
    { p: 0.56, x: 0, y: -10, scale: 1.0, rot: 0, opacity: 1.0, zIndex: 12 },
    { p: 0.64, x: 0, y: -10, scale: 1.0, rot: 0, opacity: 1.0, zIndex: 12 },
    { p: 0.76, x: -330, y: 150, scale: 0.88, rot: -3.5, opacity: 0.85, zIndex: 5 },
    { p: 0.84, x: -520, y: 240, scale: 0.82, rot: -5.0, opacity: 0.0, zIndex: 1 },
    { p: 1.0, x: -520, y: 240, scale: 0.82, rot: -5.0, opacity: 0.0, zIndex: 1 },
  ],
  // Card 4 (Deep Oxblood): Waiting -> enters top-right -> glides into center -> shifts to bottom-left
  4: [
    { p: 0.0, x: 480, y: -180, scale: 0.82, rot: 4.5, opacity: 0.0, zIndex: 1 },
    { p: 0.44, x: 480, y: -180, scale: 0.82, rot: 4.5, opacity: 0.0, zIndex: 1 },
    { p: 0.56, x: 340, y: -130, scale: 0.88, rot: 3.0, opacity: 0.88, zIndex: 5 },
    { p: 0.74, x: 0, y: -10, scale: 1.0, rot: 0, opacity: 1.0, zIndex: 12 },
    { p: 0.82, x: 0, y: -10, scale: 1.0, rot: 0, opacity: 1.0, zIndex: 12 },
    { p: 0.92, x: -330, y: 150, scale: 0.88, rot: -3.5, opacity: 0.85, zIndex: 5 },
    { p: 1.0, x: -330, y: 150, scale: 0.88, rot: -3.5, opacity: 0.85, zIndex: 5 },
  ],
  // Card 5 (Deep Navy): Waiting -> enters top-right -> settles dominant in center through completion
  5: [
    { p: 0.0, x: 480, y: -180, scale: 0.82, rot: 4.5, opacity: 0.0, zIndex: 1 },
    { p: 0.62, x: 480, y: -180, scale: 0.82, rot: 4.5, opacity: 0.0, zIndex: 1 },
    { p: 0.74, x: 340, y: -130, scale: 0.88, rot: 3.0, opacity: 0.88, zIndex: 5 },
    { p: 0.9, x: 0, y: -10, scale: 1.0, rot: 0, opacity: 1.0, zIndex: 12 },
    { p: 1.0, x: 0, y: -10, scale: 1.0, rot: 0, opacity: 1.0, zIndex: 12 },
  ],
};

function interpolateKeyframes(kfs: Keyframe[], p: number): Keyframe {
  if (p <= kfs[0].p) return kfs[0];
  if (p >= kfs[kfs.length - 1].p) return kfs[kfs.length - 1];

  for (let i = 0; i < kfs.length - 1; i++) {
    const kA = kfs[i];
    const kB = kfs[i + 1];
    if (p >= kA.p && p <= kB.p) {
      const span = kB.p - kA.p;
      const t = span > 0 ? (p - kA.p) / span : 0;
      const easeT = t * t * (3 - 2 * t); // Smoothstep easing
      return {
        p,
        x: kA.x + (kB.x - kA.x) * easeT,
        y: kA.y + (kB.y - kA.y) * easeT,
        scale: kA.scale + (kB.scale - kA.scale) * easeT,
        rot: kA.rot + (kB.rot - kA.rot) * easeT,
        opacity: kA.opacity + (kB.opacity - kA.opacity) * easeT,
        zIndex: t > 0.5 ? kB.zIndex : kA.zIndex,
      };
    }
  }
  return kfs[0];
}

export interface ReviewsSectionProps {
  reviews?: Review[];
}

export function ReviewsSection({ reviews = APPROVED_REVIEWS }: ReviewsSectionProps) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let isTicking = false;

    function applyDeckTransform() {
      if (!section) return;

      const isMobile = window.innerWidth < 768;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (isMobile || prefersReducedMotion) {
        cardsRef.current.forEach((card) => {
          if (!card) return;
          card.style.transform = '';
          card.style.opacity = '';
          card.style.zIndex = '';
          card.style.pointerEvents = '';
        });
        isTicking = false;
        return;
      }

      const rect = section.getBoundingClientRect();
      const scrollableDistance = section.offsetHeight - window.innerHeight;
      if (scrollableDistance <= 0) {
        isTicking = false;
        return;
      }

      const rawProgress = -rect.top / scrollableDistance;
      const progress = Math.max(0, Math.min(1, rawProgress));

      // Responsive peek scale factor for narrower screens (768px - 1200px)
      const peekRatio =
        window.innerWidth < 1200
          ? Math.max(0.65, (window.innerWidth - 768) / (1200 - 768))
          : 1.0;

      cardsRef.current.forEach((card, index) => {
        if (!card) return;
        const kfs = KEYFRAMES_MAP[index];
        if (!kfs) return;

        const state = interpolateKeyframes(kfs, progress);
        const posX = state.x * peekRatio;

        card.style.transform = `translate3d(${posX.toFixed(1)}px, ${state.y.toFixed(1)}px, 0) scale(${state.scale.toFixed(3)}) rotate(${state.rot.toFixed(2)}deg)`;
        card.style.opacity = state.opacity.toFixed(3);
        card.style.zIndex = String(state.zIndex);
        card.style.pointerEvents = state.opacity > 0.35 ? 'auto' : 'none';
      });

      isTicking = false;
    }

    function onScroll() {
      if (!isTicking) {
        isTicking = true;
        window.requestAnimationFrame(applyDeckTransform);
      }
    }

    function onResize() {
      applyDeckTransform();
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    // Initial positioning on mount
    applyDeckTransform();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [reviews]);

  if (reviews.length === 0) return null;

  return (
    <SectionFrame
      id="reviews"
      className={styles.section}
      hasBottomBorder={false}
      aria-labelledby="reviews-heading"
      role="region"
      aria-label="Customer Reviews"
    >
      <div ref={sectionRef} className={styles.sectionTrack}>
        <div className={styles.stickyViewport}>
          {/* Editorial Sticky Header */}
          <div className={styles.headerContainer}>
            <div className={styles.headerInner}>
              <header className={styles.header}>
                <div className={styles.headerLeft}>
                  <span className={styles.eyebrow}>FROM THE STUDIO</span>
                  <h2 id="reviews-heading" className={styles.title}>
                    Experience, <em>in their words.</em>
                  </h2>
                </div>
              </header>
            </div>
          </div>

          {/* Wispr Flow Style Floating Presentation Stage */}
          <div
            className={styles.stage}
            role="region"
            aria-label="Customer reviews floating card deck"
          >
            {reviews.map((review, index) => {
              const theme = review.theme || 'cream';
              const cardType = review.cardType || (review.image ? 'landscape-image' : 'square');
              const isSplit = cardType === 'landscape-image' && review.image;

              return (
                <article
                  key={review.id}
                  ref={(el) => {
                    cardsRef.current[index] = el;
                  }}
                  className={`${styles.card} ${styles[`theme_${theme}`]} ${styles[`type_${cardType.replace('-', '_')}`]}`}
                  data-card-index={index}
                >
                  {isSplit ? (
                    <div className={styles.splitGrid}>
                      <div className={styles.imagePane}>
                        <Image
                          src={review.image!}
                          alt={review.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 360px"
                          className={styles.photo}
                        />
                      </div>
                      <div className={styles.copyPane}>
                        {review.category && (
                          <span className={styles.cardEyebrow}>{review.category}</span>
                        )}
                        <blockquote className={styles.quote}>
                          &ldquo;{review.quote}&rdquo;
                        </blockquote>
                        <div className={styles.author}>
                          <p className={styles.authorName}>{review.name}</p>
                          <p className={styles.authorRole}>
                            {review.role && review.company
                              ? `${review.role} · ${review.company}`
                              : review.role || review.company}
                            {review.city && (
                              <span className={styles.roleCity}> · {review.city}</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.quoteBox}>
                      {review.category && (
                        <span className={styles.cardEyebrow}>{review.category}</span>
                      )}
                      <blockquote className={styles.quote}>
                        &ldquo;{review.quote}&rdquo;
                      </blockquote>
                      <div className={styles.author}>
                        <p className={styles.authorName}>{review.name}</p>
                        <p className={styles.authorRole}>
                          {review.role && review.company
                            ? `${review.role} · ${review.company}`
                            : review.role || review.company}
                          {review.city && (
                            <span className={styles.roleCity}> · {review.city}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </SectionFrame>
  );
}
