import type { Metadata } from 'next';
import Link from 'next/link';
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
        <section className="pt-24 pb-16 sm:pt-32 sm:pb-20 border-b border-[var(--color-hairline)] bg-[rgba(23,22,19,0.3)]">
          <div className="site-container max-w-4xl">
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--color-primary)] block mb-3">
              Journal
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[var(--color-text)]">
              Blog
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-[var(--color-text-muted)] leading-relaxed max-w-2xl">
              Technical insights, studio methodologies, and surface protection research from Trionyx.
            </p>
          </div>
        </section>

        <section className="py-16 sm:py-24">
          <div className="site-container max-w-4xl">
            <div className="space-y-6">
              {articles.map((item) => (
                <article
                  key={item.title}
                  className="rounded-2xl border border-[var(--color-hairline)] bg-[var(--color-surface)] p-6 sm:p-8 transition-all duration-200 hover:border-[rgba(236,231,222,0.22)] hover:bg-[#1A1916]"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[var(--color-text-muted)] mb-3">
                    <span className="text-[var(--color-primary)] font-medium uppercase">{item.category}</span>
                    <span>•</span>
                    <span>{item.date}</span>
                    <span>•</span>
                    <span>{item.readTime}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-[var(--color-text)] mb-3">
                    {item.title}
                  </h2>
                  <p className="text-sm sm:text-base text-[var(--color-text-muted)] leading-relaxed">
                    {item.excerpt}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-[var(--color-hairline)] flex items-center justify-between">
              <span className="text-xs text-[var(--color-text-muted)]">
                More articles published monthly.
              </span>
              <Link href="/products" className="text-xs font-mono uppercase text-[var(--color-primary)] hover:text-[var(--color-text)] transition-colors">
                Explore Coatings →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </PageFrame>
  );
}
