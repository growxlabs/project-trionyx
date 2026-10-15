import { ExploreHeader } from '@/components/ExploreHeader';
import type { Metadata } from 'next';
import Image from 'next/image';
import { PageFrame } from '@/components/frame';
import { HeaderShell } from '@/components/header/HeaderShell';
import { SiteFooter } from '@/components/footer/SiteFooter';

export const metadata: Metadata = {
  title: 'Gallery — Trionyx Automotive Formulations',
  description:
    'Showcase of protected automotive paintwork, water contact beading, and detailing studio results using Trionyx coatings.',
};

const galleryItems = [
  {
    title: 'Graphene Hydrophobic Surface',
    category: 'Graphene Coating',
    src: '/images/hero/graphene-protected-vehicle.png',
    alt: 'Black car bonnet beaded with water after a graphene coating',
  },
  {
    title: 'Ceramic Optical Reflection',
    category: 'Ceramic Coating',
    src: '/images/about/ceramic-coating-surface.jpg',
    alt: 'Hydrophobic ceramic-coated paintwork with dense water beading',
  },
  {
    title: 'Borophene Crystalline Bodywork',
    category: 'Borophene Coating',
    src: '/images/borophene/borophene-surface.jpg',
    alt: 'Dark car body panel with a crystalline borophene finish',
  },
  {
    title: 'Fleet Protection Endurance',
    category: 'Commercial Fleet',
    src: '/images/graphene/mountain-bridge-cars.png',
    alt: 'Vehicles on road protected by Trionyx formulations',
  },
];

export default function GalleryPage() {
  return (
    <PageFrame>
      <HeaderShell />
      <main className="flex flex-1 flex-col text-[var(--color-text)]">
        <ExploreHeader active="Gallery" description="A closer look at Trionyx finishes and surface protection." />

        <section aria-label="Gallery images" className="pb-16 sm:pb-20">
          <div className="site-container">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
              {galleryItems.map((item) => (
                <figure
                  key={item.title}
                  className="min-w-0"
                >
                  <div className="relative aspect-[3/2] overflow-hidden rounded-lg bg-[var(--color-surface)]">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 40rem) 100vw, (max-width: 80rem) 50vw, 640px"
                    className="object-cover object-center"
                  />
                  </div>
                  <figcaption className="pt-3">
                    <h2 className="text-base font-normal text-[var(--color-text)]">
                      {item.title}
                    </h2>
                  </figcaption>
                </figure>
              ))}
            </div>

          </div>
        </section>
      </main>
      <SiteFooter />
    </PageFrame>
  );
}
