import React from 'react';
import { Button } from '../ui/Button';
import { ArrowRightIcon, ChevronRightIcon } from '../ui/Icons';
import { SectionFrame, ContentGrid } from '../frame';
import { AutomotiveRevealExperiment } from './AutomotiveRevealExperiment';
import { SectionEyebrow } from '../ui/SectionEyebrow';

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
  headlineLine2: 'Designed around',
  headlineLine3: 'your vehicle.',
  supportingText:
    'Protection films, advanced coatings, lighting and accessories. Everything to help your vehicle look its best and go further.',
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
      className="bg-[#F7F6F0] relative overflow-hidden flex items-center border-b border-[var(--section-divider)]"
    >
      {/* INTERNAL 12-COLUMN CONTENT GRID (32px padding on desktop, 20px-24px on mobile) */}
      <ContentGrid className="relative z-10 pt-4 sm:pt-6 lg:pt-8 pb-10 sm:pb-12 lg:pb-16 items-center !gap-y-10">
        <div className="md:col-span-7 flex flex-col justify-center lg:pr-10">
          <SectionEyebrow>{context}</SectionEyebrow>
          <h1
            style={{ fontFamily: '"Instrument Sans", sans-serif', letterSpacing: '-0.045em' }}
            className="section-heading text-[#171714] text-[40px] sm:text-[52px] md:text-[clamp(36px,4.15vw,64px)] leading-[1.06]"
          >
            <span className="block">{headlineLine1}</span>
            <span className="block">{headlineLine2}</span>
            {headlineLine3 && <span className="block">{headlineLine3}</span>}
          </h1>
          <p className="body-copy mt-6 max-w-[460px]">
            {supportingText}
          </p>

          {/* Actions: Full-width / stacked rhythm on mobile, inline row on desktop */}
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
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

        <div className="md:col-span-5 min-w-0">
          <AutomotiveRevealExperiment />
        </div>
      </ContentGrid>
    </SectionFrame>
  );
};

