import Image from 'next/image';
import { ExploreHeader } from '@/components/ExploreHeader';
import type { Metadata } from 'next';
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
    category: 'Material Science',
    date: 'October 2026',
    readTime: '4 min read',
    title: 'The Role of 2D Carbon Allotropes in Automotive Paint Protection',
    excerpt:
      'How reduced graphene oxide lattices distribute surface heat and minimize water spot etching on modern automotive clearcoats.',
  },
  {
    category: 'Application Standards',
    date: 'September 2026',
    readTime: '5 min read',
    title: 'Flash Timing and Cross-Link Stabilization across High-Humidity Climates',
    excerpt:
      'Studio parameters and curing considerations when applying 10H ceramic and graphene coatings during Indian monsoon seasons.',
  },
  {
    category: 'Surface Science',
    date: 'August 2026',
    readTime: '3 min read',
    title: 'Understanding Contact Angle: Hydrophobic Water Beading vs. Sheeting',
    excerpt:
      'The physics behind surface tension, droplet angle dynamics, and how nano-matrix coatings shed road grime effortlessly.',
  },
];

export default function BlogPage() {
  return (
    <PageFrame>
      <HeaderShell />
      <main className="flex flex-1 flex-col text-[var(--color-text)]">
        <ExploreHeader active="Blog" description="Surface science, coating care, and application guides." />

        <section aria-label="Articles" className="pb-16 sm:pb-20">
          <div className="site-container">
            <div className="divide-y divide-[var(--color-hairline)] border-y border-[var(--color-hairline)]">
              {articles.map((item, index) => (
                <article key={item.title} className="grid gap-5 py-7 sm:grid-cols-[220px_1fr] sm:gap-8 sm:py-8 lg:grid-cols-[280px_1fr] lg:gap-10">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-[var(--color-surface)]">
                    <Image
                      src={['/images/hero/graphene-protected-vehicle.png', '/images/about/installation.jpg', '/images/about/ceramic-coating-surface.jpg'][index]}
                      alt={['Water beading on a protected vehicle', 'Automotive surface installation', 'Water droplets on coated paintwork'][index]}
                      fill
                      sizes="(max-width: 40rem) 100vw, (max-width: 64rem) 220px, 280px"
                      className="object-cover"
                    />
                  </div>
                  <div className="max-w-3xl self-center">
                    <p className="mb-2 text-xs text-[var(--color-primary)]">{item.category}</p>
                    <h2 className="text-xl font-normal leading-snug tracking-tight sm:text-2xl">{item.title}</h2>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]">{item.excerpt}</p>
                    <p className="mt-4 text-xs text-[var(--color-text-muted)]">{item.date}<span aria-hidden="true" className="mx-2">·</span>{item.readTime}</p>
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
