import React from 'react';
import { Button } from '../ui/Button';
import { ArrowRightIcon, ChevronRightIcon } from '../ui/Icons';
import { SectionFrame, ContentGrid } from '../frame';

export interface HeroContentProps {
  context?: string;
  headlineLine1?: string;
  headlineLine2?: string;
  headlineLine3?: string;
  supportingText?: string;
  primaryCtaText?: string;
  secondaryCtaText?: string;
  onPrimaryCta?: () => void;
  onSecondaryCta?: () => void;
}

const defaultHeroContent: Required<Omit<HeroContentProps, 'onPrimaryCta' | 'onSecondaryCta'>> = {
  context: 'TRIONYX AUTOMOTIVE',
  headlineLine1: 'Engineered for the road.',
  headlineLine2: 'Designed around your',
  headlineLine3: 'vehicle.',
  supportingText:
    'Automotive protection, films, coatings, lighting and accessories built around how vehicles look, perform and endure.',
  primaryCtaText: 'Explore Products',
  secondaryCtaText: 'Talk to Trionyx',
};

export const HeroSection = ({
  context = defaultHeroContent.context,
  headlineLine1 = defaultHeroContent.headlineLine1,
  headlineLine2 = defaultHeroContent.headlineLine2,
  headlineLine3 = defaultHeroContent.headlineLine3,
  supportingText = defaultHeroContent.supportingText,
  primaryCtaText = defaultHeroContent.primaryCtaText,
  secondaryCtaText = defaultHeroContent.secondaryCtaText,
  onPrimaryCta,
  onSecondaryCta,
}: HeroContentProps) => {
  return (
    <SectionFrame
      id="hero"
      hasBottomBorder={false}
      className="overflow-hidden min-h-0 sm:min-h-[540px] lg:min-h-[640px] flex items-center border-b-0 md:border-b md:border-[rgba(23,23,20,0.07)]"
    >
      {/* INTERNAL 12-COLUMN CONTENT GRID (32px padding on desktop, 20px-24px on mobile) */}
      <ContentGrid className="relative z-10 pt-2 pb-8 sm:py-20 lg:py-24">
        {/* COLUMNS 1 THROUGH 7: Structured Typography & Primary Actions */}
        <div className="md:col-span-7 flex flex-col justify-center">
          {/* Small Context Tag: strictly aligned flush to Column 1 */}
          <div className="flex items-center gap-2 mb-3.5 sm:mb-5">
            <span className="text-[11px] sm:text-[12px] font-bold tracking-[0.14em] uppercase text-[#68665F] font-mono">
              {context}
            </span>
          </div>

          {/* Mobile Art-Directed Headline: natural line flow, no awkward 1-word breaks */}
          <h1
            style={{
              fontFamily: '"Instrument Sans", sans-serif',
              letterSpacing: '-0.035em',
            }}
            className="md:hidden text-[#171714] font-semibold text-[34px] sm:text-[42px] leading-[1.04] max-w-[340px]"
          >
            Engineered for the road. Designed around your vehicle.
          </h1>

          {/* Desktop Headline: 100% unchanged */}
          <h1
            style={{
              fontFamily: '"Instrument Sans", sans-serif',
              fontWeight: 600,
              fontSize: 'clamp(40px, 4.8vw, 78px)',
              lineHeight: 0.99,
              letterSpacing: '-0.035em',
            }}
            className="hidden md:block text-[#171714]"
          >
            <span className="block">{headlineLine1}</span>
            <span className="block">{headlineLine2}</span>
            {headlineLine3 && <span className="block">{headlineLine3}</span>}
          </h1>

          {/* Supporting Copy: Narrower, approximately columns 1 through 6 */}
          <p className="mt-5 sm:mt-8 text-[15px] sm:text-[1.1875rem] text-[#68665F] font-normal leading-[1.6] sm:leading-[1.65] max-w-[340px] sm:max-w-[540px] tracking-[-0.01em]">
            {supportingText}
          </p>

          {/* Actions: Full-width / stacked rhythm on mobile, inline row on desktop */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              onClick={onPrimaryCta}
              trailingIcon={<ArrowRightIcon size={16} color="inverse" strokeWidth={2} />}
              className="w-full sm:w-auto justify-center h-12 text-[15px] shadow-[0_1px_3px_rgba(242,101,34,0.2)]"
            >
              {primaryCtaText}
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={onSecondaryCta}
              trailingIcon={<ChevronRightIcon size={15} color="muted" strokeWidth={1.75} />}
              className="w-full sm:w-auto justify-center h-12 text-[15px]"
            >
              {secondaryCtaText}
            </Button>
          </div>
        </div>

        {/* COLUMNS 8 THROUGH 12: Spatial negative space allowing freeform artwork to command the right field */}
        <div className="hidden md:block md:col-span-5 pointer-events-none" aria-hidden="true" />
      </ContentGrid>
    </SectionFrame>
  );
};

