import type { Metadata } from 'next';
import Image from 'next/image';
import { ExploreHeader } from '@/components/ExploreHeader';
import { PageFrame } from '@/components/frame';
import { HeaderShell } from '@/components/header/HeaderShell';
import { SiteFooter } from '@/components/footer/SiteFooter';
import styles from './gallery.module.css';

export const metadata: Metadata = {
  title: 'Gallery — Trionyx Automotive Formulations',
  description:
    'Showcase of protected automotive paintwork, water contact beading, and detailing studio results using Trionyx coatings.',
};

const galleryItems = [
  {
    title: 'Graphene hydrophobic surface',
    src: '/images/hero/graphene-protected-vehicle.png',
    alt: 'Black car bonnet beaded with water after a graphene coating',
  },
  {
    title: 'Ceramic optical reflection',
    src: '/images/about/ceramic-coating-surface.jpg',
    alt: 'Hydrophobic ceramic-coated paintwork with dense water beading',
  },
  {
    title: 'Borophene crystalline bodywork',
    src: '/images/borophene/borophene-surface.jpg',
    alt: 'Dark car body panel with a crystalline borophene finish',
  },
  {
    title: 'Fleet protection endurance',
    src: '/images/graphene/mountain-bridge-cars.png',
    alt: 'Vehicles on a mountain road protected by Trionyx formulations',
  },
];

export default function GalleryPage() {
  return (
    <PageFrame>
      <HeaderShell />
      <main className="flex flex-1 flex-col">
        <ExploreHeader active="Gallery" />

        <section aria-label="Gallery images" className="pb-[var(--section-space)]">
          <div className={`site-container ${styles.grid}`}>
            {galleryItems.map((item) => (
              <figure key={item.title} className={styles.tile}>
                <Image src={item.src} alt={item.alt} fill sizes="(max-width: 40rem) 100vw, 50vw" className={styles.image} />
                <div className={styles.blur} aria-hidden="true" />
                <figcaption className={styles.caption}>{item.title}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </PageFrame>
  );
}
