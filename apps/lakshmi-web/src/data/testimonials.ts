export type TestimonialTheme = 'green' | 'cream' | 'orange' | 'lavender' | 'oxblood';

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  type?: 'customer' | 'dealer';
  categoryLabel?: string;
  company?: string;
  location?: string;
  rating?: number;
  image?: string;
  isPlaceholder?: boolean;
  theme: TestimonialTheme;
  cardType?: 'landscape-image' | 'square' | 'wide';
}

/**
 * Editorial Testimonial Sequence (Wispr Flow Deck Interaction)
 *
 * IMPORTANT:
 * Per client review guidelines, these entries represent structured development placeholders
 * showcasing optical lighting retrofits, workshop installation feedback, and dealer distribution support.
 * They are marked with `isPlaceholder: true` until verified and supplied by the client.
 */
export const testimonials: readonly Testimonial[] = [
  {
    id: 'review-1',
    theme: 'green',
    cardType: 'landscape-image',
    image: '/images/categories/paint-protection.jpg',
    categoryLabel: 'WORKSHOP RETROFIT',
    quote: 'Azoom LED projector modules have been our top recommendation for headlight retrofits. The beam cutoff is razor-sharp with zero glare for oncoming traffic.',
    name: 'Arjun Menon',
    type: 'dealer',
    company: 'Apex Auto Lighting Workshop',
    location: 'Kochi, Kerala',
    isPlaceholder: true,
  },
  {
    id: 'review-2',
    theme: 'cream',
    cardType: 'square',
    categoryLabel: 'FITMENT GARAGE',
    quote: 'Consistent build quality and genuine technical fitment guidance save workshop hours on every canbus integration and projector alignment.',
    name: 'Vivek Nair',
    type: 'dealer',
    company: 'Precision Fitment Garage',
    location: 'Coimbatore, Tamil Nadu',
    isPlaceholder: true,
  },
  {
    id: 'review-3',
    theme: 'orange',
    cardType: 'landscape-image',
    image: '/images/products/azoom-installed-beam.jpg',
    categoryLabel: 'VEHICLE UPGRADE',
    quote: 'The illumination throw and beam spread transformed night driving on unlit highways. Optical cutoff keeps the road visible without blinding others.',
    name: 'Neha Thomas',
    type: 'customer',
    company: 'Automotive Illumination Upgrade',
    location: 'Ernakulam, Kerala',
    isPlaceholder: true,
  },
  {
    id: 'review-4',
    theme: 'lavender',
    cardType: 'square',
    categoryLabel: 'DISTRIBUTION PARTNER',
    quote: 'Stock replenishment is dependable and technical specifications are verified before dispatch. Our customers notice the optical clarity immediately.',
    name: 'Rahul Kumar',
    type: 'dealer',
    company: 'Royal Auto Accessories',
    location: 'Bengaluru, Karnataka',
    isPlaceholder: true,
  },
  {
    id: 'review-5',
    theme: 'oxblood',
    cardType: 'wide',
    categoryLabel: 'DETAILING STUDIO',
    quote: 'Transparent product specifications and dependable wholesale distribution give our installation team complete confidence on every project.',
    name: 'Suresh Pillai',
    type: 'dealer',
    company: 'MotorCraft Detailing & Retrofit',
    location: 'Trivandrum, Kerala',
    isPlaceholder: true,
  },
];
