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
    slug: 'azoom',
    name: 'Azoom',
    description: 'Explore Azoom automotive lighting products available through Lakshmi Distributions.',
  },
  {
    slug: 'hoggon',
    name: 'Hoggon',
    description: 'Automotive surface protection, sun control window films, and acoustic damping solutions available through Lakshmi Distributions.',
  },
];

export const categories: readonly Category[] = [
  {
    slug: 'led-lamps',
    name: 'LED Lamps',
    brandSlug: 'azoom',
    brandName: 'Azoom',
    description: 'Explore LED lamps and projector lighting for your vehicle.',
    image: {
      src: '/images/about/about-secondary.jpg',
      alt: 'Azoom automotive LED lamp projector module and heatsink component',
    },
  },
  {
    slug: 'sun-control-ceramic-window-film',
    name: 'Sun Control Ceramic Window Film',
    brandSlug: 'hoggon',
    brandName: 'Hoggon',
    description: 'Discover ceramic window films for cabin comfort and sun control.',
    image: {
      src: '/images/categories/window-film.jpg',
      alt: 'Transparent ceramic automotive window tint film unrolling under cool studio light',
    },
  },
  {
    slug: 'paint-protection-film',
    name: 'Paint Protection Film',
    brandSlug: 'hoggon',
    brandName: 'Hoggon',
    description: 'Explore clear films designed to protect your vehicle’s painted surfaces.',
    image: {
      src: '/images/categories/paint-protection.jpg',
      alt: 'Technician applying clear paint protection film to a dark vehicle',
    },
  },
  {
    slug: 'shumoff-damping',
    name: 'Shumoff Damping',
    brandSlug: 'hoggon',
    brandName: 'Hoggon',
    description: 'Discover damping materials for managing vibration and cabin noise.',
    image: {
      src: '/images/categories/sound-damping.jpg',
      alt: 'Textured automotive sound damping sheets with a layered foil backing',
    },
  },
];
