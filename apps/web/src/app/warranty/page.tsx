import type { Metadata } from 'next';
import Image from 'next/image';
import { PageFrame } from '@/components/frame';
import { HeaderShell } from '@/components/header/HeaderShell';
import { SiteFooter } from '@/components/footer/SiteFooter';
import { PageIntro } from '@/components/ui/PageIntro';
import { WarrantyCheckForm } from '@/components/warranty/WarrantyCheckForm';
import { WarrantyFaqSection } from '@/components/warranty/WarrantyFaqSection';
import styles from './warranty.module.css';

export const metadata: Metadata = {
  title: 'Warranty Verification — Trionyx',
  description:
    'Verify the official warranty status and authenticity of your Trionyx professional surface protection products.',
};

export default function WarrantyPage() {
  return (
    <PageFrame>
      <HeaderShell />
      <main className="flex flex-1 flex-col">
        <div className="site-container">
          <PageIntro title="Check your Trionyx warranty." />

          <section className={styles.lookup} aria-label="Warranty lookup">
            <div className={styles.form}>
              <WarrantyCheckForm />
            </div>
            <figure className={styles.guide}>
              <Image
                src="/images/warranty/serial-number-guide.jpg"
                alt="Trionyx product box and bottle showing where the authenticity label and serial number are printed"
                fill
                sizes="(max-width: 56rem) 100vw, 40vw"
                className={styles.guideImage}
              />
              <div className={styles.blur} aria-hidden="true" />
              <figcaption className={styles.caption}>Your serial number is on the authenticity label.</figcaption>
            </figure>
          </section>
        </div>

        <WarrantyFaqSection />
      </main>
      <SiteFooter />
    </PageFrame>
  );
}
