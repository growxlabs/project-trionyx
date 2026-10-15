import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PageFrame } from '@/components/frame';
import { HeaderShell } from '@/components/header/HeaderShell';
import { SiteFooter } from '@/components/footer/SiteFooter';
import { DistributorsView } from '@/components/distributors/DistributorsView';

export const metadata: Metadata = {
  title: 'Distributors — Trionyx',
  description:
    'Explore available locations and enquire about becoming an authorised Trionyx distributor across India.',
};

export default function DistributorsPage() {
  return (
    <PageFrame>
      <HeaderShell />
      <main className="flex flex-1 flex-col">
        <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-sm text-[var(--color-text-muted)]">Loading available locations...</div>}>
          <DistributorsView />
        </Suspense>
      </main>
      <SiteFooter />
    </PageFrame>
  );
}
