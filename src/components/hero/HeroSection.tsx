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
      hasBottomBorder
      className="overflow-hidden min-h-[600px] lg:min-h-[640px] flex items-center"
    >
      {/* FULL-BLEED ANIMATED MESH GRADIENT BACKGROUND */}


      {/* INTERNAL 12-COLUMN CONTENT GRID (32px padding, 24px column gaps) */}
      <ContentGrid className="relative z-10 py-16 sm:py-20 lg:py-24">
        {/* COLUMNS 1 THROUGH 7: Structured Typography & Primary Actions */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          {/* Small Context Tag: strictly aligned flush to Column 1 */}
          <div className="flex items-center gap-2 mb-4 sm:mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F26522]" aria-hidden="true" />
            <span className="text-[11px] sm:text-[12px] font-bold tracking-[0.14em] uppercase text-[#68665F] font-mono">
              {context}
            </span>
          </div>

          {/* Main Headline: Spans approximately columns 1 through 7 */}
          <h1
            style={{
              fontFamily: '"Instrument Sans", sans-serif',
              fontWeight: 600,
              fontSize: 'clamp(40px, 4.8vw, 78px)',
              lineHeight: 0.99,
              letterSpacing: '-0.035em',
            }}
            className="text-[#171714]"
          >
            <span className="block">{headlineLine1}</span>
            <span className="block">{headlineLine2}</span>
            {headlineLine3 && <span className="block">{headlineLine3}</span>}
          </h1>

          {/* Supporting Copy: Narrower, approximately columns 1 through 6 */}
          <p className="mt-6 sm:mt-8 text-[1.0625rem] sm:text-[1.1875rem] text-[#68665F] font-normal leading-[1.65] max-w-[540px] tracking-[-0.01em]">
            {supportingText}
          </p>

          {/* Actions: Starts flush at Column 1 */}
          <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-3.5 sm:gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={onPrimaryCta}
              trailingIcon={<ArrowRightIcon size={16} color="inverse" strokeWidth={2} />}
              className="shadow-[0_1px_3px_rgba(242,101,34,0.2)]"
            >
              {primaryCtaText}
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={onSecondaryCta}
              trailingIcon={<ChevronRightIcon size={15} color="muted" strokeWidth={1.75} />}
            >
              {secondaryCtaText}
            </Button>
          </div>
        </div>

        {/* COLUMNS 8 THROUGH 12: Spatial negative space allowing freeform artwork to command the right field */}
        <div className="hidden lg:block lg:col-span-5 pointer-events-none" aria-hidden="true" />
      </ContentGrid>
    </SectionFrame>
  );
};

