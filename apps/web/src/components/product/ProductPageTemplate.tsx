'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { ProductWithRelations } from '@trionyx/types';
import styles from './ProductPageTemplate.module.css';

const APPLICATION_STEPS = ['Surface decontamination & prep', 'Precision levelling & wipe', 'Controlled curing'];

export interface ProductPageTemplateProps {
  product: ProductWithRelations;
}

export function ProductPageTemplate({ product }: ProductPageTemplateProps) {
  // Collect all images (media from DB, or clean fallback)
  const mediaImages = (product.media || [])
    .filter((m) => m.type === 'IMAGE')
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const fallbackImage = product.slug.includes('graphene')
    ? '/images/hero/graphene-protected-vehicle.png'
    : product.slug.includes('borophene')
      ? '/images/borophene/borophene-surface.jpg'
      : '/images/about/ceramic-coating-surface.jpg';

  const allImages =
    mediaImages.length > 0
      ? mediaImages.map((m) => ({
          src: m.storagePath,
          alt: m.altText || `${product.name} surface formulation`,
        }))
      : [
          {
            src: fallbackImage,
            alt: `${product.name} surface formulation`,
          },
        ];

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const activeImage = allImages[selectedImageIndex] || allImages[0];

  const enquireHref = `/contact?type=PRODUCT_ENQUIRY&product=${encodeURIComponent(product.name)}&code=${encodeURIComponent(product.productCode || '')}`;

  // Sort specifications
  const sortedSpecs = [...(product.specifications || [])].sort((a, b) => a.sortOrder - b.sortOrder);

  const description = product.description?.trim() || product.shortDescription?.trim();

  return (
    <article className={`site-container ${styles.page}`}>
      <Link href="/products" className={styles.back}>
        <span aria-hidden="true">←</span> All products
      </Link>

      <div className={styles.layout}>
        <div className={styles.gallery}>
          <div className={styles.mainImage}>
            {activeImage?.src ? (
              <Image src={activeImage.src} alt={activeImage.alt} fill priority sizes="(max-width: 56rem) 100vw, 50vw" className={styles.image} />
            ) : (
              <span className={styles.placeholder} aria-hidden="true" />
            )}
          </div>

          {allImages.length > 1 && (
            <div className={styles.thumbnails} role="group" aria-label="Product images">
              {allImages.map((img, idx) => (
                <button
                  key={img.src + idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  aria-pressed={idx === selectedImageIndex}
                  aria-label={`Show image ${idx + 1} of ${allImages.length}`}
                  className={styles.thumb}
                >
                  <Image src={img.src} alt="" fill sizes="80px" className={styles.image} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.info}>
          <h1 className={styles.title}>{product.name}</h1>
          {product.productCode && <p className={styles.ref}>Ref. {product.productCode}</p>}

          <Link href={enquireHref} className={`pill-button ${styles.enquire}`}>
            Enquire about this product
          </Link>

          {sortedSpecs.length > 0 && (
            <section className={styles.specs} aria-labelledby="specs-heading">
              <h2 id="specs-heading">Specifications</h2>
              <dl>
                {sortedSpecs.map((spec) => (
                  <div key={spec.id || spec.label}>
                    <dt>{spec.label}</dt>
                    <dd>{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {description && (
            <details className={styles.description}>
              <summary>
                About this formulation <span className={styles.icon} aria-hidden="true" />
              </summary>
              <p>{description}</p>
            </details>
          )}
        </div>
      </div>

      <section className={styles.application} aria-labelledby="application-heading">
        <h2 id="application-heading">Application.</h2>
        <div className={styles.steps}>
          {APPLICATION_STEPS.map((step) => (
            <h3 key={step}>{step}</h3>
          ))}
        </div>
      </section>
    </article>
  );
}
