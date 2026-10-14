'use client';

import { useState } from 'react';
import { Stepper } from '../ui/Stepper';
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
    role: 'Master Detailer',
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

export interface ReviewsSectionProps {
  reviews?: Review[];
}

/** One large centred quote at a time, cycled by the stepper. */
export function ReviewsSection({ reviews = APPROVED_REVIEWS }: ReviewsSectionProps) {
  const [active, setActive] = useState(0);
  const panelIds = reviews.map((review) => `review-${review.id}`);

  return (
    <section id="reviews" className={styles.section} aria-labelledby="reviews-heading">
      <div className="site-container">
        <h2 id="reviews-heading" className="visually-hidden">
          Reviews
        </h2>

        <div className={styles.panels}>
          {reviews.map((review, i) => (
            <figure
              key={review.id}
              id={panelIds[i]}
              role="tabpanel"
              aria-label={`Review ${i + 1} of ${reviews.length}`}
              hidden={i !== active}
              className={styles.panel}
            >
              <blockquote>
                <p>{review.quote}</p>
              </blockquote>
              <figcaption>
                <span>{review.name}</span>
                <span className={styles.meta}>{[review.role, review.company, review.city].filter(Boolean).join(', ')}</span>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className={styles.foot}>
          <Stepper count={reviews.length} active={active} onChange={setActive} label="Choose a review" controls={panelIds} autoplay={6000} />
        </div>
      </div>
    </section>
  );
}
