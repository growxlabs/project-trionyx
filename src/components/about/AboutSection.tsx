import React from 'react';
import Image from 'next/image';
import { Button } from '../ui/Button';
import { ArrowRightIcon } from '../ui/Icons';
import { SectionFrame, ContentGrid } from '../frame';

export interface AboutSectionProps {
  onCtaClick?: () => void;
}

/**
 * TRIONYX ABOUT SECTION
 * 
 * Editorial, calm, and spacious two-column layout:
 * - Left (44% visual): Restrained layered automotive image composition showing
 *   precision workshop application and finished protected surface.
 * - Right (56% content): Context eyebrow, substantial heading, 2-paragraph story,
 *   restrained "EST. 2006 · 20 YEARS" proof line, and single CTA.
 * - Canvas: Continues warm Trionyx canvas (#F7F6F0) within continuous page rails.
 */
export const AboutSection: React.FC<AboutSectionProps> = ({ onCtaClick }) => {
  return (
    <SectionFrame
      id="about"
      hasBottomBorder
      className="bg-[#F7F6F0] overflow-hidden"
    >
      <ContentGrid className="py-16 sm:py-20 lg:py-32 items-center gap-10 sm:gap-12 lg:gap-16">
        {/* VISUAL AREA: Layered Overlapping Automotive Imagery (order-2 on mobile, left on desktop) */}
        <div className="order-2 lg:order-1 lg:col-span-5 relative w-full flex justify-center lg:justify-start">
          <div className="relative w-full max-w-[340px] sm:max-w-[420px] lg:max-w-none group pb-6 sm:pb-8 pr-5 sm:pr-8 lg:pr-12">
            {/* Primary Base Image: Precision workshop installation & coating activity */}
            <div className="relative w-[82%] sm:w-[80%] aspect-[4/5] overflow-hidden rounded-[4px] border border-[rgba(23,23,20,0.08)] shadow-[0_12px_36px_rgba(23,23,20,0.05)] bg-[#EFECE3]">
              <Image
                src="/images/about/ppf-installation.jpg"
                alt="Automotive protective film and ceramic coating installation workshop"
                fill
                sizes="(max-width: 768px) 80vw, 35vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                priority={false}
              />
            </div>

            {/* Overlapping Secondary Accent Image: Premium vehicle finish & surface reflection */}
            <div className="absolute right-0 bottom-0 w-[58%] sm:w-[56%] aspect-[4/3] overflow-hidden rounded-[4px] border-2 border-[#F7F6F0] shadow-[0_16px_40px_rgba(23,23,20,0.09)] bg-[#EFECE3] transition-transform duration-700 ease-out group-hover:translate-x-1 group-hover:-translate-y-1">
              <Image
                src="/images/about/ceramic-coating-surface.jpg"
                alt="Hydrophobic ceramic coating and clearcoat finish on automotive surface"
                fill
                sizes="(max-width: 768px) 55vw, 25vw"
                className="object-cover"
                priority={false}
              />
            </div>
          </div>
        </div>

        {/* CONTENT AREA: Editorial Typography, Story & Single CTA (order-1 on mobile, right on desktop) */}
        <div className="order-1 lg:order-2 lg:col-span-7 flex flex-col justify-center lg:pl-4 xl:pl-8">
          {/* Small Eyebrow */}
          <span className="text-[11px] sm:text-[12px] font-bold tracking-[0.14em] uppercase text-[#68665F] font-mono mb-4 sm:mb-5 block">
            ABOUT TRIONYX
          </span>

          {/* Main Heading: Anchors right field, clearly subordinated to Hero headline */}
          <h2
            style={{
              fontFamily: '"Instrument Sans", sans-serif',
              letterSpacing: '-0.03em',
            }}
            className="text-[#171714] font-semibold text-[32px] sm:text-[38px] lg:text-[44px] leading-[1.12] max-w-[540px]"
          >
            Two decades in the automotive industry.
          </h2>

          {/* Two Short Story Paragraphs */}
          <div className="mt-6 sm:mt-7 space-y-4 text-[#68665F] text-[15px] sm:text-[16.5px] leading-[1.7] max-w-[500px] font-normal tracking-[-0.01em]">
            <p>
              Founded in 2006, Trionyx has spent nearly two decades working across the automotive products market, building experience around vehicle protection, care and related product categories.
            </p>
            <p>
              Today, Trionyx is expanding its product portfolio and strengthening its presence through installers and distributors across India, carrying forward the experience built since its early years in the industry.
            </p>
          </div>

          {/* Restrained Proof Line */}
          <div className="mt-8 pt-6 border-t border-[rgba(23,23,20,0.08)] max-w-[500px]">
            <span className="font-mono text-[11px] sm:text-[12px] font-semibold tracking-[0.16em] uppercase text-[#8C897E]">
              EST. 2006 &nbsp;·&nbsp; 20 YEARS
            </span>
          </div>

          {/* Single Action CTA: Exactly one button */}
          <div className="mt-8 sm:mt-10">
            <Button
              variant="outline"
              size="lg"
              onClick={onCtaClick}
              trailingIcon={<ArrowRightIcon size={16} strokeWidth={2} />}
              className="group hover:border-[rgba(23,23,20,0.28)]"
            >
              About Trionyx
            </Button>
          </div>
        </div>
      </ContentGrid>
    </SectionFrame>
  );
};
