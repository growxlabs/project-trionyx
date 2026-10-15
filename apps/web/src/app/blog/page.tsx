import Image from 'next/image';
import type { Metadata } from 'next';
import { ExploreHeader } from '@/components/ExploreHeader';
import { PageFrame } from '@/components/frame';
import { HeaderShell } from '@/components/header/HeaderShell';
import { SiteFooter } from '@/components/footer/SiteFooter';

export const metadata: Metadata = {
  title: 'Blog — Trionyx Automotive Formulations',
  description:
    'Technical articles, surface care guides, and material science insights from the Trionyx engineering team.',
};

const articles = [
  {
    date: 'October 2026',
    readTime: '4 min read',
    title: 'The Role of 2D Carbon Allotropes in Automotive Paint Protection',
    image: { src: '/images/hero/graphene-protected-vehicle.png', alt: 'Water beading on a protected vehicle' },
  },
  {
    date: 'September 2026',
    readTime: '5 min read',
    title: 'Flash Timing and Cross-Link Stabilization across High-Humidity Climates',
    image: { src: '/images/about/installation.jpg', alt: 'Automotive surface installation' },
  },
  {
    date: 'August 2026',
    readTime: '3 min read',
    title: 'Understanding Contact Angle: Hydrophobic Water Beading vs. Sheeting',
    image: { src: '/images/about/ceramic-coating-surface.jpg', alt: 'Water droplets on coated paintwork' },
  },
];

export default function BlogPage() {
  return (
    <PageFrame>
      <HeaderShell />
      <main className="flex flex-1 flex-col">
        <ExploreHeader active="Blog" />

        <section aria-label="Articles" className="pb-[var(--section-space)]">
          <div className="site-container">
            <div className="border-t border-[var(--color-hairline)]">
              {articles.map((article) => (
                <article
                  key={article.title}
                  className="grid items-center gap-5 border-b border-[var(--color-hairline)] py-8 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-10 lg:py-10"
                >
                  <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-[var(--color-surface)]">
                    <Image src={article.image.src} alt={article.image.alt} fill sizes="(max-width: 40rem) 100vw, 33vw" className="object-cover" />
                  </div>
                  <div>
                    <h2 className="m-0 text-[clamp(1.5rem,2.6vw,2.25rem)] leading-[1.2] tracking-[-0.02em]">{article.title}</h2>
                    <p className="mt-4 text-sm text-[var(--color-text-faint)]">
                      {article.date}
                      <span aria-hidden="true" className="mx-2">
                        ·
                      </span>
                      {article.readTime}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </PageFrame>
  );
}
