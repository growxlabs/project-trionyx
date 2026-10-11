export interface CatalogueImage {
  src: string;
  alt: string;
}

export interface Brand {
  slug: string;
  name: string;
  description: string;
  image?: CatalogueImage;
}

export interface Category {
  slug: string;
  name: string;
  brandSlug: string;
  brandName?: string;
  description: string;
  image?: CatalogueImage;
}

export const brands: readonly Brand[] = [
  {
    slug: 'aozoom',
    name: 'Aozoom',
    description: 'Explore Aozoom automotive lighting products available through Lakshmi Distributions.',
  },
  {
    slug: 'hogonn',
    name: 'Hogonn',
    description: 'Automotive surface protection, sun control window films, and acoustic damping solutions available through Lakshmi Distributions.',
  },
];

export const categories: readonly Category[] = [
  {
    slug: 'led-lamps',
    name: 'LED Lamps',
    brandSlug: 'aozoom',
    brandName: 'Aozoom',
    description: '',
    image: {
      src: '/images/about/about-secondary.jpg',
      alt: 'Aozoom automotive LED lamp projector module and heatsink component',
    },
  },
  {
    slug: 'sun-control-ceramic-window-film',
    name: 'Sun Control Window Film',
    brandSlug: 'hogonn',
    brandName: 'Hogonn',
    description: '',
    image: {
      src: '/images/categories/window-film.jpg',
      alt: 'Transparent automotive sun control window tint film unrolling under cool studio light',
    },
  },
  {
    slug: 'paint-protection-film',
    name: 'Paint Protection Film',
    brandSlug: 'hogonn',
    brandName: 'Hogonn',
    description: '',
    image: {
      src: '/images/categories/paint-protection.jpg',
      alt: 'Technician applying clear paint protection film to a dark vehicle',
    },
  },
  {
    slug: 'shumoff-damping',
    name: 'Shumoff Damping',
    brandSlug: 'hogonn',
    brandName: 'Hogonn',
    description: '',
    image: {
      src: '/images/categories/sound-damping.jpg',
      alt: 'Textured automotive sound damping sheets with a layered foil backing',
    },
  },
];
