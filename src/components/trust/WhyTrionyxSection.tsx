import React from 'react';
import { SectionFrame, ContentGrid } from '../frame';

interface TrustPoint {
  number: string;
  title: string;
  description: string;
}

const trustPoints: TrustPoint[] = [
  {
    number: '01',
    title: 'Since 2006',
    description: 'Nearly two decades of experience in the automotive products market.',
  },
  {
    number: '02',
    title: 'Product-focused',
    description: 'A growing automotive portfolio built around protection, care and related product categories.',
  },
  {
    number: '03',
    title: 'Dealer support',
    description: 'Product availability, guidance and support designed around long-term dealer relationships.',
  },
  {
    number: '04',
    title: 'Made for the Indian market',
    description: 'Products and distribution shaped around Indian automotive demand and operating conditions.',
  },
];

/**
 * WHY TRIONYX SECTION
 * 
 * Trust section built with a premium editorial layout:
 * - Desktop: 2 × 2 editorial information grid with subtle horizontal & vertical separator rules
 * - Mobile: Purpose-built 1-column sequence with 24–28px item rhythm and subtle dividers
 * - Integrated directly into the #F7F6F0 canvas with generous negative space (no SaaS boxed cards)
 */
export const WhyTrionyxSection: React.FC = () => {
  return (
    <SectionFrame
      id="why-trionyx"
      hasBottomBorder
      className="bg-[#F7F6F0] overflow-hidden"
    >
      <ContentGrid className="pt-14 pb-[72px] sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-32">
        {/* Section Header: Eyebrow + Strong Editorial Heading */}
        <div className="md:col-span-12 mb-10 md:mb-16">
          {/* Eyebrow: 16px mb on mobile */}
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F26522]" aria-hidden="true" />
            <span className="text-[11px] sm:text-[12px] font-bold tracking-[0.16em] uppercase text-[#68665F] font-mono">
              WHY TRIONYX
            </span>
          </div>

          {/* Main Heading: Editorial line breaks, strong typography */}
          <h2
            style={{
              fontFamily: '"Instrument Sans", sans-serif',
              letterSpacing: '-0.03em',
            }}
            className="text-[#171714] font-semibold text-[28px] sm:text-[38px] lg:text-[46px] leading-[1.08] max-w-[660px]"
          >
            <span className="block">Built on experience.</span>
            <span className="block">Chosen for what comes with it.</span>
          </h2>
        </div>

        {/* 
          DESKTOP 2 × 2 EDITORIAL INFORMATION GRID (Hidden on mobile <768px)
          - Subtle horizontal and vertical separator rules
          - Large negative space, no floating boxed cards
        */}
        <div className="hidden md:grid md:col-span-12 md:grid-cols-2">
          {trustPoints.map((item, index) => {
            const isTopRow = index < 2;
            const isLeftColumn = index % 2 === 0;

            return (
              <div
                key={item.number}
                className={`flex flex-col justify-start transition-colors duration-200 ${
                  isTopRow
                    ? 'border-b border-[rgba(23,23,20,0.08)] pb-12 lg:pb-14'
                    : 'pt-12 lg:pt-14'
                } ${
                  isLeftColumn
                    ? 'border-r border-[rgba(23,23,20,0.08)] pr-10 lg:pr-16'
                    : 'pl-10 lg:pl-16'
                }`}
              >
                {/* Number: mono uppercase metadata treatment */}
                <div className="flex items-center gap-2 mb-3.5">
                  <span className="font-mono text-[11px] lg:text-[12px] font-bold tracking-[0.16em] uppercase text-[#F26522]">
                    {item.number}
                  </span>
                </div>

                {/* Short Title */}
                <h3
                  style={{
                    fontFamily: '"Instrument Sans", sans-serif',
                    letterSpacing: '-0.02em',
                  }}
                  className="text-[20px] lg:text-[23px] font-semibold text-[#171714] mb-3 leading-snug"
                >
                  {item.title}
                </h3>

                {/* Supporting Description */}
                <p className="text-[15px] lg:text-[15.5px] text-[#68665F] leading-[1.65] max-w-[440px] font-normal tracking-[-0.01em]">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* 
          MOBILE 1-COLUMN VERTICAL SEQUENCE (Visible only on mobile <768px)
          - Purpose-built vertical flow
          - 24–28px vertical padding rhythm
          - Thin subtle separator between items
          - No boxed cards
        */}
        <div className="md:hidden flex flex-col w-full">
          {trustPoints.map((item, index) => {
            const isLast = index === trustPoints.length - 1;

            return (
              <div
                key={item.number}
                className={`flex flex-col ${
                  index === 0 ? 'pt-0 pb-6 sm:pb-7' : 'py-6 sm:py-7'
                } ${!isLast ? 'border-b border-[rgba(23,23,20,0.08)]' : ''}`}
              >
                {/* Number: mono metadata style */}
                <span className="font-mono text-[11px] font-bold tracking-[0.16em] uppercase text-[#F26522] mb-2">
                  {item.number}
                </span>

                {/* Short Title */}
                <h3
                  style={{
                    fontFamily: '"Instrument Sans", sans-serif',
                    letterSpacing: '-0.02em',
                  }}
                  className="text-[19px] sm:text-[20px] font-semibold text-[#171714] mb-2 leading-snug"
                >
                  {item.title}
                </h3>

                {/* Supporting Description */}
                <p className="text-[14.5px] sm:text-[15px] text-[#68665F] leading-[1.6] max-w-[360px] font-normal tracking-[-0.01em]">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </ContentGrid>
    </SectionFrame>
  );
};
