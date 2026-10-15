'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './catalogue.module.css';
import type { ProductWithRelations, ProductCategory } from '@trionyx/types';

export interface ProductsCatalogueViewProps {
  products: ProductWithRelations[];
  categories: ProductCategory[];
}

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
            <button
              key={category.id}
              type="button"
              aria-pressed={selectedCategory === category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={styles.filter}
            >
              {category.name.replace(/ Matrix Coatings| Quartz Coatings| Coatings/g, '').replace('Maintenance & Top Coats', 'Top coats')}
            </button>
          ))}
        </div>
        <span className={styles.count} aria-live="polite">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
        </span>
      </div>

      <div className={styles.grid}>
        {filteredProducts.map((product) => {
          const img = getProductImage(product);
          // Use a distinct surface detail when the top coat shares another product's photo.
          if (img && product.slug === 'trionyx-hydro-top-coat' && products.some((other) => other.id !== product.id && getProductImage(other)?.src === img.src)) {
            img.src = '/images/dealer/coating-surface.png';
            img.alt = 'Water droplets and reflections on automotive paintwork';
          }
          return (
            <Link key={product.id} href={`/products/${product.slug}`} className={styles.tile}>
              {img ? (
                <Image src={img.src} alt={img.alt} fill sizes="(max-width: 34rem) 100vw, (max-width: 56rem) 50vw, 33vw" className={styles.image} />
              ) : (
                <span className={styles.placeholder} aria-hidden="true" />
              )}
              <div className={styles.blur} aria-hidden="true" />
              <div className={styles.caption}>
                <h2>{product.name}</h2>
                <span className={styles.arrow} aria-hidden="true">→</span>
              </div>
            </Link>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className={styles.empty}>
          <button type="button" className="text-link" onClick={() => setSelectedCategory('all')}>
            View all products
          </button>
        </div>
      )}
    </div>
  );
}
