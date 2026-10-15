import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { PageFrame } from '@/components/frame';
import { HeaderShell } from '@/components/header/HeaderShell';
import { SiteFooter } from '@/components/footer/SiteFooter';
import { PageIntro } from '@/components/ui/PageIntro';
import { BrandStory } from '@/components/story/BrandStory';
import styles from './about.module.css';

export const metadata: Metadata = {
  title: 'About — Trionyx',
  description:
    'Founded in 2006, Trionyx has spent nearly two decades in the automotive products market, building experience in vehicle protection and care.',
};

const facts = [
  { value: '2006', label: 'Founded' },
  { value: '20 years', label: 'In the automotive industry' },
  { value: 'India', label: 'Installers and distributors nationwide' },
];

export default function AboutPage() {
  return (
    <PageFrame>
      <HeaderShell />
      <main className="flex flex-1 flex-col">
        <div className="site-container">
          <PageIntro title="Two decades in the automotive industry." />

          <figure className={styles.banner}>
            <Image
              src="/trionyx-materials.png"
              alt="Sheets of clear, smoked and orange protective film curling over one another"
              fill
              priority
              sizes="(max-width: 80rem) 100vw, 80rem"
              className={styles.bannerImage}
            />
          </figure>

          <dl className={styles.facts}>
            {facts.map((fact) => (
              <div key={fact.value}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <BrandStory />

        <section className={styles.closing} aria-labelledby="work-with-us">
          <div className={`site-container ${styles.closingInner}`}>
            <h2 id="work-with-us">Work with Trionyx.</h2>
            <div className={styles.actions}>
              <Link href="/products" className="pill-button">
                Explore products
              </Link>
              <Link href="/distributors" className="pill-button pill-button-ghost">
                Become a distributor
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </PageFrame>
  );
}
