import React from 'react';
import { PageFrame } from '@/components/frame';
import { HeaderShell } from '@/components/header/HeaderShell';
import { SiteFooter } from '@/components/footer/SiteFooter';
import styles from '@/components/product/ProductPageTemplate.module.css';

export default function ProductDetailLoading() {
  return (
    <PageFrame>
      <HeaderShell appearance="default" />
      <main className="flex flex-1 flex-col">
        <article className={`site-container ${styles.page}`}>
          {/* Back button skeleton */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-28 h-5 rounded-[4px] bg-[#262420] animate-pulse" />
          </div>

          <div className={styles.layout}>
            {/* Gallery Skeleton (Left Column) */}
            <div className={styles.gallery}>
              {/* Main square product image */}
              <div className="w-full aspect-square rounded-[16px] bg-[#171613] border border-[#262420] relative overflow-hidden animate-pulse flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-[#262420]/60 flex items-center justify-center text-[#555046]">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </div>
              </div>

              {/* Thumbnails row */}
              <div className="flex gap-2.5 mt-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-[4.75rem] h-[4.75rem] rounded-[10px] bg-[#171613] border border-[#262420] animate-pulse"
                  />
                ))}
              </div>
            </div>

            {/* Info Skeleton (Right Column) */}
            <div className={styles.info}>
              {/* Title & Ref code */}
              <div className="space-y-3 mb-6">
                <div className="w-4/5 h-11 rounded-[6px] bg-[#262420] animate-pulse" />
                <div className="w-1/3 h-4 rounded-[4px] bg-[#1F1D19] animate-pulse" />
              </div>

              {/* Enquire CTA Button pill */}
              <div className="w-56 h-11 rounded-full bg-[#F26522]/30 border border-[#F26522]/40 animate-pulse my-6" />

              {/* Specifications Skeleton */}
              <div className="mt-8 pt-8 border-t border-[#262420] space-y-4">
                <div className="w-32 h-6 rounded-[4px] bg-[#262420] animate-pulse mb-6" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="p-3.5 rounded-[8px] bg-[#171613] border border-[#262420] space-y-2 animate-pulse">
                      <div className="w-20 h-3 rounded bg-[#262420]" />
                      <div className="w-32 h-4 rounded bg-[#33302B]" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Description Paragraph Skeleton */}
              <div className="mt-8 pt-8 border-t border-[#262420] space-y-2.5">
                <div className="w-full h-3.5 rounded bg-[#1F1D19] animate-pulse" />
                <div className="w-11/12 h-3.5 rounded bg-[#1F1D19] animate-pulse" />
                <div className="w-4/5 h-3.5 rounded bg-[#1F1D19] animate-pulse" />
              </div>
            </div>
          </div>
        </article>
      </main>
      <SiteFooter />
    </PageFrame>
  );
}
