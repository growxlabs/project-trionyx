import React from 'react';
import { PageFrame } from '@/components/frame';
import { HeaderShell } from '@/components/header/HeaderShell';
import { SiteFooter } from '@/components/footer/SiteFooter';

export default function ProductsCatalogueLoading() {
  return (
    <PageFrame>
      <HeaderShell appearance="default" />
      <main className="flex flex-1 flex-col">
        <div className="site-container pt-12 pb-6">
          <div className="w-56 h-10 rounded-[6px] bg-[#262420] animate-pulse mb-8" />
          <div className="flex gap-2.5 mb-10 overflow-x-auto pb-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="w-28 h-9 rounded-full bg-[#1F1D19] border border-[#262420] animate-pulse shrink-0" />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-16">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="rounded-[16px] bg-[#171613] border border-[#262420] overflow-hidden p-4 space-y-4 animate-pulse"
              >
                <div className="w-full aspect-[4/3] rounded-[10px] bg-[#1F1D19]" />
                <div className="space-y-2">
                  <div className="w-3/4 h-5 rounded bg-[#262420]" />
                  <div className="w-1/2 h-3.5 rounded bg-[#1F1D19]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </PageFrame>
  );
}
