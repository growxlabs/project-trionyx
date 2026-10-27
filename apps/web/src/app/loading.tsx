import React from 'react';
import { PageFrame } from '@/components/frame';
import { HeaderShell } from '@/components/header/HeaderShell';
import { SiteFooter } from '@/components/footer/SiteFooter';

export default function RootLoading() {
  return (
    <PageFrame>
      <HeaderShell appearance="default" />
      <main className="site-container flex flex-1 flex-col py-12" aria-busy="true" aria-label="Loading page">
        <div className="w-48 h-8 rounded-[6px] bg-[#262420] animate-pulse mb-8" />
        <div className="w-full h-4 rounded bg-[#1F1D19] animate-pulse mb-3 max-w-xl" />
        <div className="w-4/5 h-4 rounded bg-[#1F1D19] animate-pulse mb-8 max-w-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="aspect-[4/3] rounded-[16px] bg-[#171613] border border-[#262420] animate-pulse" />
          ))}
        </div>
      </main>
      <SiteFooter />
    </PageFrame>
  );
}
