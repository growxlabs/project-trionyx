import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
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
    span: 'col-span-1 md:col-span-2 aspect-[16/9]',
  },
  {
    title: 'Ceramic Optical Reflection',
    category: 'Ceramic Coating',
    src: '/images/about/ceramic-coating-surface.jpg',
    alt: 'Hydrophobic ceramic-coated paintwork with dense water beading',
    span: 'col-span-1 aspect-square',
  },
  {
    title: 'Borophene Crystalline Bodywork',
    category: 'Borophene Coating',
    src: '/images/borophene/borophene-surface.jpg',
    alt: 'Dark car body panel with a crystalline borophene finish',
    span: 'col-span-1 aspect-square',
  },
  {
    title: 'Fleet Protection Endurance',
    category: 'Commercial Fleet',
    src: '/images/graphene/mountain-bridge-cars.png',
    alt: 'Vehicles on road protected by Trionyx formulations',
    span: 'col-span-1 md:col-span-2 aspect-[16/9]',
  },
];

export default function GalleryPage() {
  return (
    <PageFrame>
      <HeaderShell />
      <main className="flex flex-1 flex-col text-[var(--color-text)]">
        <section className="pt-24 pb-16 sm:pt-32 sm:pb-20 border-b border-[var(--color-hairline)] bg-[rgba(236,231,222,0.02)]">
          <div className="site-container max-w-4xl">
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--color-primary)] block mb-3">
              Showcase
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[var(--color-text)]">
              Gallery
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-[var(--color-text-muted)] leading-relaxed max-w-2xl">
              Automotive reflections, water-beading dynamics, and studio application results.
            </p>
          </div>
        </section>

        <section className="py-16 sm:py-24">
          <div className="site-container">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {galleryItems.map((item) => (
                <div
                  key={item.title}
                  className={`group relative rounded-2xl overflow-hidden border border-[var(--color-hairline)] bg-[var(--color-surface)] ${item.span}`}
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 48rem) 100vw, 50vw"
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />
                  <div className="absolute bottom-0 inset-x-0 p-6 flex flex-col justify-end">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-primary)]">
                      {item.category}
                    </span>
                    <h3 className="text-lg font-medium text-[var(--color-text)] mt-1">
                      {item.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <Link href="/products" className="pill-button !min-h-[44px] !h-[44px] !py-0 !px-7 text-xs sm:text-sm font-medium">
                View All Products
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </PageFrame>
  );
}
