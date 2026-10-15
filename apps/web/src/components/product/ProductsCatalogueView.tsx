'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './catalogue.module.css';
import type { ProductWithRelations, ProductCategory } from '@trionyx/types';

export interface ProductsCatalogueViewProps {
  products: ProductWithRelations[];
  categories: ProductCategory[];
}

// Catalogue summaries stay brief; full specifications remain on the product page.
const cardSummaries: Record<string, string> = {
  'borophene-coating': 'Chemical and heat-resistant surface protection.',
  'trionyx-hydro-top-coat': 'Water-repellent gloss top coat · 30 ml',
  'graphene-coating': '10H graphene ceramic protection · 50 ml',
  'ceramic-coating': '9H ceramic gloss protection · 50 ml',
};

function getProductImage(product: ProductWithRelations): { src: string; alt: string } | null {
  const media = product.media?.find((m) => m.type === 'IMAGE');
  if (media?.storagePath) {
    return {
      src: media.storagePath,
      alt: media.altText || `${product.name} surface formulation`,
    };
  }

  // Fallback visual
  const fallback = product.slug.includes('graphene')
    ? '/images/hero/graphene-protected-vehicle.png'
    : product.slug.includes('borophene')
      ? '/images/borophene/borophene-surface.jpg'
      : product.slug.includes('ceramic')
        ? '/images/about/ceramic-coating-surface.jpg'
        : null;

  if (fallback) {
    return {
      src: fallback,
      alt: `${product.name} surface formulation`,
    };
  }

  return null;
}

export function ProductsCatalogueView({ products, categories }: ProductsCatalogueViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter products by selected category
  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.categoryId === selectedCategory);

  // Available categories that have products
  const activeCategories = categories.filter((c) =>
    products.some((p) => p.categoryId === c.id)
  );

  return (
    <div>
      <div className={styles.toolbar}>
        <div className={styles.filters} role="group" aria-label="Filter products by category">
          {[{ id: 'all', name: 'All products' }, ...activeCategories].map((category) => (
            <button key={category.id} type="button" aria-pressed={selectedCategory === category.id}
              onClick={() => setSelectedCategory(category.id)} className={styles.filter}>
              {category.name.replace(/ Matrix Coatings| Quartz Coatings| Coatings/g, '').replace('Maintenance & Top Coats', 'Top coats')}
            </button>
          ))}
        </div>
        <span className={styles.count} aria-live="polite">{filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}</span>
      </div>
      <div className={styles.grid}>
        {filteredProducts.map((product) => {
          const img = getProductImage(product);
          // Use a distinct surface detail when the top coat shares another product's photo.
          if (img && product.slug === 'trionyx-hydro-top-coat' && products.some((other) => other.id !== product.id && getProductImage(other)?.src === img.src)) {
            img.src = '/images/dealer/coating-surface.png';
            img.alt = 'Water droplets and reflections on automotive paintwork';
          }
          const summary = cardSummaries[product.slug] || product.shortDescription?.trim();
          return (
            <article key={product.id} className={styles.card}>
              <Link href={`/products/${product.slug}`} className={styles.imageLink} aria-label={`Explore ${product.name}`}>
                {img ? <Image src={img.src} alt={img.alt} fill sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 600px" className={styles.image} /> : <span className={styles.placeholder}>{product.name}</span>}
                <span className={styles.imageArrow} aria-hidden="true">↗</span>
              </Link>
              <div className={styles.details}>
                <div>
                  <h2 className={styles.name}><Link href={`/products/${product.slug}`}>{product.name}</Link></h2>
                  {summary && <p className={styles.summary}>{summary}</p>}
                </div>
                <Link className={styles.enquire} href={`/contact?type=PRODUCT_ENQUIRY&product=${encodeURIComponent(product.name)}&code=${encodeURIComponent(product.productCode || '')}`} aria-label={`Enquire about ${product.name}`}>Enquire <span aria-hidden="true">↗</span></Link>
              </div>
            </article>
          );
        })}
      </div>
      {filteredProducts.length === 0 && <p className={styles.empty}>No products in this category. <button onClick={() => setSelectedCategory('all')}>View all products</button></p>}
    </div>
  );
}
