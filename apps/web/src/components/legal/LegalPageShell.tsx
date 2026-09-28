'use client';

import React from 'react';
import Link from 'next/link';
import { PageFrame, SectionFrame } from '@/components/frame';
import { HeaderShell } from '@/components/header/HeaderShell';
import { SiteFooter } from '@/components/footer/SiteFooter';
import { SectionEyebrow } from '@/components/ui/SectionEyebrow';

export interface LegalSection {
  id: string;
  number: string;
  title: string;
  content: React.ReactNode;
}

interface LegalPageShellProps {
  eyebrow?: string;
  title: string;
  supportingLine: string;
  lastUpdated: string;
  sections: LegalSection[];
  currentPath: '/privacy' | '/terms' | '/cookies';
}

export function LegalPageShell({
  eyebrow = 'LEGAL',
  title,
  supportingLine,
  lastUpdated,
  sections,
  currentPath,
}: LegalPageShellProps) {
  return (
    <div className="min-h-screen bg-[#F5F5EE] text-[#171714] flex flex-col font-sans antialiased selection:bg-[#F26522]/15 selection:text-[#171714]">
      <PageFrame>
        {/* Navigation Header */}
        <div className="relative isolate overflow-hidden">
          <HeaderShell />
        </div>

        {/* Main Legal Document Surface */}
        <main className="flex-1 flex flex-col">
          <SectionFrame hasBottomBorder={false}>
            {/* Centered Document Column */}
            <div className="w-full max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
              {/* Centered Header Eyebrow & Title */}
              <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
                <SectionEyebrow className="justify-center text-center">
                  {eyebrow}
                </SectionEyebrow>

                <h1 className="text-[34px] sm:text-[42px] lg:text-[48px] font-semibold tracking-[-0.03em] leading-[1.12] text-[#171714] mt-2 mb-4 font-sans">
                  {title}
                </h1>

                <p className="text-[16px] sm:text-[18px] text-[#68665F] leading-[1.65] font-normal mx-auto max-w-xl font-sans">
                  {supportingLine}
                </p>

                <div className="mt-4 pt-2 flex items-center justify-center gap-2 text-[12.5px] sm:text-[13px] text-[#68665F]/80 font-sans">
                  <span className="font-medium text-[#171714]/70">Last updated:</span>
                  <span>{lastUpdated}</span>
                </div>
              </div>

              {/* Centered Horizontal Divider */}
              <div className="border-b border-[#171714]/10 mb-10 sm:mb-14" />

              {/* Document Content (Clean Single-Column Reading Flow) */}
              <div className="w-full">
                <div className="space-y-0">
                  {sections.map((sec) => (
                    <section
                      key={sec.id}
                      id={sec.id}
                      className="py-8 sm:py-10 first:pt-0 border-b border-[#171714]/08 last:border-b-0"
                    >
                      <span className="font-mono text-[11.5px] font-bold text-[#F26522] tracking-wider uppercase block mb-1.5">
                        {sec.number}
                      </span>

                      <h2 className="text-[22px] sm:text-[26px] font-semibold tracking-[-0.025em] text-[#171714] mb-4 leading-tight font-sans">
                        {sec.title}
                      </h2>

                      <div className="space-y-4 text-[15.5px] sm:text-[16px] leading-[1.75] text-[#171714]/85 font-normal font-sans">
                        {sec.content}
                      </div>
                    </section>
                  ))}
                </div>

                {/* Restrained Cross-Navigation Area */}
                <div className="mt-14 pt-8 border-t border-[#171714]/10 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#68665F] block mb-3 font-sans">
                    Related Legal &amp; Product Policies
                  </span>

                  <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13.5px] font-sans">
                    <Link
                      href="/privacy"
                      className={`transition-colors ${
                        currentPath === '/privacy'
                          ? 'font-semibold text-[#171714] pointer-events-none'
                          : 'text-[#68665F] hover:text-[#F26522]'
                      }`}
                    >
                      Privacy Policy
                    </Link>
                    <span className="text-[#171714]/20 select-none">/</span>

                    <Link
                      href="/terms"
                      className={`transition-colors ${
                        currentPath === '/terms'
                          ? 'font-semibold text-[#171714] pointer-events-none'
                          : 'text-[#68665F] hover:text-[#F26522]'
                      }`}
                    >
                      Terms &amp; Conditions
                    </Link>
                    <span className="text-[#171714]/20 select-none">/</span>

                    <Link
                      href="/cookies"
                      className={`transition-colors ${
                        currentPath === '/cookies'
                          ? 'font-semibold text-[#171714] pointer-events-none'
                          : 'text-[#68665F] hover:text-[#F26522]'
                      }`}
                    >
                      Cookie Policy
                    </Link>
                    <span className="text-[#171714]/20 select-none">/</span>

                    <Link
                      href="/warranty"
                      className="text-[#68665F] hover:text-[#F26522] transition-colors"
                    >
                      Warranty Verification →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </SectionFrame>
        </main>

        {/* Global Footer */}
        <SiteFooter />
      </PageFrame>
    </div>
  );
}
