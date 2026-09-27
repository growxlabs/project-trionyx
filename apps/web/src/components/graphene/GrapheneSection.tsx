'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SectionFrame } from '../frame';
import styles from './GrapheneSection.module.css';
import { SectionEyebrow } from '../ui/SectionEyebrow';

interface ProductCardItem {
  id: string;
  number: string;
  category: string;
  name: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  href: string;
}

const PRODUCTS: ProductCardItem[] = [
  {
    id: 'graphene',
    number: '01',
    category: 'ADVANCED PROTECTION',
    name: 'Graphene',
    description:
      'Helps reduce water spots and release heat from your vehicle’s surface with high-tensile carbon matrix protection.',
    imageSrc: '/images/graphene/mountain-bridge-cars.png',
    imageAlt: 'Vehicles with graphene surface protection driving on mountain road',
    href: '/products#graphene',
  },
  {
    id: 'ceramic',
    number: '02',
    category: 'SURFACE PROTECTION',
    name: 'Ceramic',
    description:
      'High-gloss 9H ceramic matrix providing durable hydrophobic clearcoat defense against unpredictable weather.',
    imageSrc: '/images/about/ceramic-coating-surface.jpg',
    imageAlt: 'Hydrophobic ceramic coated vehicle hood showing dense water beading',
    href: '/products#ceramic',
  },
  {
    id: 'borophene',
    number: '03',
    category: 'ULTRA-HIGH DURABILITY',
    name: 'Borophene',
    description:
      'Extreme chemical resistance and crystalline structural resilience engineered for demanding operating environments.',
    imageSrc: '/images/borophene/borophene-surface.jpg',
    imageAlt: 'High-performance automotive body panel with crystalline borophene protective coating',
    href: '/products#borophene',
  },
];

export function GrapheneSection() {
  return (
    <SectionFrame
      id="graphene"
      className={styles.section}
      aria-labelledby="products-suite-heading"
    >
      <div className={styles.inner}>
        {/* Section Header */}
        <header className={styles.header}>
          <SectionEyebrow>SURFACE PROTECTION SUITE</SectionEyebrow>
          <h2 id="products-suite-heading" className={styles.heading}>
            Engineered protection, <em>across three matrices.</em>
          </h2>
          <p className={styles.subheading}>
            Three advanced protective formulas, each engineered around specific environmental demands.
          </p>
        </header>

        {/* Explee-Style Pinned Stacking Card Deck */}
        <div className={styles.stack}>
          {PRODUCTS.map((product, index) => {
            // Incremental sticky top offsets creates the visible layered tab effect
            const stickyTop = `calc(96px + ${index * 20}px)`;
            const zIndex = index + 1;

            return (
              <div
                key={product.id}
                className={styles.stickyWrap}
                style={{
                  top: stickyTop,
                  zIndex,
                }}
              >
                <article className={styles.card}>
                  {/* Left Column: Editorial Information */}
                  <div className={styles.cardContent}>
                    <div>
                      <p className={styles.cardKicker}>
                        <span className={styles.cardKickerLine} aria-hidden="true" />
                        {product.number} / {product.category}
                      </p>
                    </div>

                    <div className={styles.cardBody}>
                      <h3 className={styles.cardTitle}>{product.name}</h3>
                      <p className={styles.cardDescription}>{product.description}</p>
                      <Link href={product.href} className={styles.cardLink}>
                        Explore {product.name} <span aria-hidden="true">→</span>
                      </Link>
                    </div>

                    <div aria-hidden="true" />
                  </div>

                  {/* Right Column: Automotive Visual */}
                  <div className={styles.cardVisual}>
                    <Image
                      src={product.imageSrc}
                      alt={product.imageAlt}
                      fill
                      sizes="(max-width: 879px) 100vw, 55vw"
                      className={styles.cardImage}
                    />
                    <div className={styles.cardOverlay} aria-hidden="true" />
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      </div>
    </SectionFrame>
  );
}
