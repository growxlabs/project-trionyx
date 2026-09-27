'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  const [activeSectionId, setActiveSectionId] = useState<string>(sections[0]?.id || '');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Set up scroll-spy intersection observer
    const handleIntersect: IntersectionObserverCallback = (entries) => {
      // Find the first intersecting entry from top
      const visible = entries.filter((e) => e.isIntersecting);
      if (visible.length > 0) {
        // Pick the top visible entry
        const topVisible = visible.reduce((prev, curr) =>
          prev.boundingClientRect.top < curr.boundingClientRect.top ? prev : curr
        );
        setActiveSectionId(topVisible.target.id);
      }
    };

    observerRef.current = new IntersectionObserver(handleIntersect, {
      rootMargin: '-10% 0px -70% 0px',
      threshold: 0,
    });

    sections.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el && observerRef.current) {
        observerRef.current.observe(el);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [sections]);

  // Handle smooth click-to-scroll
  const handleScrollTo = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const topOffset = 110; // offset for sticky header
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      setActiveSectionId(id);
      window.history.pushState(null, '', `#${id}`);
    }
  };

  const activeSection = sections.find((s) => s.id === activeSectionId) || sections[0];

  return (
    <div className="min-h-screen bg-[#F7F6F0] text-[#171714] flex flex-col antialiased selection:bg-[#F26522]/15 selection:text-[#171714]">
      <PageFrame>
        {/* Navigation Header */}
        <div className="relative isolate overflow-hidden">
          <HeaderShell />
        </div>

        {/* Main Legal Document Surface */}
        <main className="flex-1 flex flex-col">
          <SectionFrame hasBottomBorder={false}>
            <div className="px-5 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
              {/* Header Eyebrow & Title */}
              <div className="max-w-3xl mb-8 sm:mb-12">
                <SectionEyebrow>{eyebrow}</SectionEyebrow>

                <h1 className="text-[34px] sm:text-[42px] lg:text-[50px] font-medium tracking-[-0.025em] leading-[1.08] text-[#171714] mt-2 mb-4">
                  {title}
                </h1>

                <p className="text-[16px] sm:text-[18px] text-[#68665F] leading-[1.65] max-w-2xl m-0 font-normal">
                  {supportingLine}
                </p>

                <div className="mt-4 pt-3 flex items-center gap-2 text-[12px] sm:text-[13px] text-[#68665F]/80">
                  <span className="font-medium text-[#171714]/70">Last updated:</span>
                  <span>{lastUpdated}</span>
                </div>
              </div>

              {/* Horizontal Divider */}
              <div className="border-b border-[#171714]/10 mb-8 sm:mb-12" />

              {/* Mobile / Tablet Collapsible Contents Control */}
              <div className="lg:hidden mb-8 sticky top-16 z-30 bg-[#F7F6F0]/95 backdrop-blur-xs py-2">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-expanded={mobileMenuOpen}
                  aria-label="Table of contents menu"
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-[6px] border border-[#171714]/12 bg-[#FCFBF7] text-[#171714] text-[13.5px] font-medium transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2 truncate">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#F26522]">
                      Contents
                    </span>
                    <span className="text-[#171714]/25">|</span>
                    <span className="truncate text-[#171714]">
                      {activeSection ? `${activeSection.number} ${activeSection.title}` : 'Jump to section'}
                    </span>
                  </span>
                  <svg
                    className={`w-4 h-4 text-[#68665F] shrink-0 ml-2 transition-transform duration-150 ${
                      mobileMenuOpen ? 'rotate-180' : ''
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {mobileMenuOpen && (
                  <div className="mt-1.5 max-h-[60vh] overflow-y-auto rounded-[6px] border border-[#171714]/12 bg-[#FCFBF7] p-2 shadow-[0_4px_16px_rgba(23,23,20,0.06)] space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                    {sections.map((sec) => (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={(e) => {
                          handleScrollTo(e, sec.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full text-left flex items-baseline gap-2.5 px-3 py-2 rounded-[4px] text-[13px] transition-colors cursor-pointer ${
                          activeSectionId === sec.id
                            ? 'bg-[#ECE9E4] text-[#F26522] font-semibold'
                            : 'text-[#171714]/85 hover:bg-[#ECE9E4]/60'
                        }`}
                      >
                        <span className="font-mono text-[11px] opacity-75 shrink-0">
                          {sec.number}
                        </span>
                        <span className="truncate">{sec.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Two-Column Architecture */}
              <div className="flex flex-col lg:flex-row items-start justify-between gap-10 lg:gap-14">
                {/* Desktop Left Column: Sticky Table of Contents (26%) */}
                <nav
                  aria-label="Table of contents"
                  className="hidden lg:block lg:w-[26%] shrink-0"
                >
                  <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-6 no-scrollbar space-y-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#68665F] m-0">
                      Contents
                    </p>

                    <ul className="space-y-1 list-none p-0 m-0 border-l border-[#171714]/10">
                      {sections.map((sec) => {
                        const isActive = activeSectionId === sec.id;
                        return (
                          <li key={sec.id}>
                            <a
                              href={`#${sec.id}`}
                              onClick={(e) => handleScrollTo(e, sec.id)}
                              className={`group flex items-baseline gap-2.5 py-1.5 pl-3.5 -ml-[1px] border-l-2 text-[13px] transition-colors duration-100 ${
                                isActive
                                  ? 'border-[#F26522] text-[#F26522] font-semibold'
                                  : 'border-transparent text-[#68665F] hover:text-[#171714]'
                              }`}
                            >
                              <span
                                className={`font-mono text-[11px] shrink-0 ${
                                  isActive ? 'text-[#F26522]' : 'text-[#68665F]/80 group-hover:text-[#171714]'
                                }`}
                              >
                                {sec.number}
                              </span>
                              <span className="leading-snug">
                                {sec.title}
                              </span>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </nav>

                {/* Right Column: Policy Content (74%, max-w-[720px]) */}
                <div className="w-full lg:w-[74%] max-w-[720px] min-w-0">
                  <div className="space-y-0">
                    {sections.map((sec) => (
                      <section
                        key={sec.id}
                        id={sec.id}
                        className="scroll-mt-28 py-8 sm:py-10 first:pt-0 border-b border-[#171714]/08 last:border-b-0"
                      >
                        <span className="font-mono text-[11.5px] font-bold text-[#F26522] tracking-wider uppercase block mb-1.5">
                          {sec.number}
                        </span>

                        <h2 className="text-[24px] sm:text-[28px] font-medium tracking-[-0.02em] text-[#171714] mb-5 leading-tight">
                          {sec.title}
                        </h2>

                        <div className="space-y-4 text-[15.5px] sm:text-[16px] leading-[1.72] text-[#171714]/85 font-normal">
                          {sec.content}
                        </div>
                      </section>
                    ))}
                  </div>

                  {/* Restrained Cross-Navigation Area */}
                  <div className="mt-14 pt-8 border-t border-[#171714]/10">
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#68665F] block mb-3">
                      Related Legal &amp; Product Policies
                    </span>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13.5px]">
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
            </div>
          </SectionFrame>
        </main>

        {/* Global Footer */}
        <SiteFooter />
      </PageFrame>
    </div>
  );
}
