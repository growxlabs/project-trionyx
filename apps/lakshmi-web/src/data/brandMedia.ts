import type { CatalogueImage } from './catalogue';
import { categories } from './catalogue';

export interface BrandMedia {
  logo: CatalogueImage;
  image: CatalogueImage;
}

const AOZOOM: BrandMedia = {
  logo: { src: '/images/brands/aozoom-trim.png', alt: 'Aozoom logo' },
  image: { src: '/images/studio/led-lamps.jpg', alt: 'Aozoom bi-LED projector module lit on a dark workbench' },
};

const HOGONN: BrandMedia = {
  logo: { src: '/images/brands/hogonn-trim.png', alt: 'Hogonn logo' },
  image: { src: '/images/studio/paint-protection.jpg', alt: 'Clear paint protection film lifting from a dark car bonnet' },
};

/** Catalogue slugs have appeared under alternate spellings, so both are mapped. */
const BRAND_MEDIA: Record<string, BrandMedia> = {
  aozoom: AOZOOM,
  azoom: AOZOOM,
  hogonn: HOGONN,
  hoggon: HOGONN,
};

export const getBrandMedia = (slug: string): BrandMedia | undefined => BRAND_MEDIA[slug.toLowerCase()];

/** Photography for a category slug, when the site has one. */
export const getCategoryImage = (slug: string): CatalogueImage | undefined =>
  categories.find((category) => category.slug === slug)?.image;
