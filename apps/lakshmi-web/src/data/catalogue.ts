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
  specs?: readonly string[];
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
    description: 'High-output bi-LED projectors with precision beam optics and active thermal heatsink cooling.',
    specs: ['Laser Bi-LED', '5800K Color Temp', 'Projector Optics'],
    image: {
      src: '/images/categories/category-led-projector.jpg',
      alt: 'Aozoom high-precision automotive bi-LED lamp projector module with cooling heatsink',
    },
  },
  {
    slug: 'sun-control-ceramic-window-film',
    name: 'Sun Control Window Film',
    brandSlug: 'hogonn',
    brandName: 'Hogonn',
    description: 'Multi-layer nano-ceramic solar control films engineered for maximum heat and UV rejection without signal interference.',
    specs: ['Nano-Ceramic IR', '99% UV Block', '92% Heat Rejection'],
    image: {
      src: '/images/categories/category-window-film.jpg',
      alt: 'Hogonn ceramic automotive window film unrolled in workshop setting',
    },
  },
  {
    slug: 'paint-protection-film',
    name: 'Paint Protection Film',
    brandSlug: 'hogonn',
    brandName: 'Hogonn',
    description: 'Optically clear aliphatic TPU film with instant self-healing topcoat, stain barrier, and deep gloss depth.',
    specs: ['180µm Premium TPU', 'Self-Healing Topcoat', 'Hydrophobic Gloss'],
    image: {
      src: '/images/categories/category-paint-protection.jpg',
      alt: 'Technician installing glossy paint protection film onto sports car fender',
    },
  },
  {
    slug: 'shumoff-damping',
    name: 'Shumoff Damping',
    brandSlug: 'hogonn',
    brandName: 'Shumoff',
    description: 'Multi-layer butyl vibration damping and composite thermal barriers for structural resonance elimination.',
    specs: ['Multi-Layer Butyl', 'Vibration Control', 'Acoustic Barrier'],
    image: {
      src: '/images/categories/category-sound-damping.jpg',
      alt: 'Shumoff acoustic sound damping sheets and application roller on workbench',
    },
  },
];
