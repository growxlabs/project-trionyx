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
      className="bg-[#F5F5EE] overflow-hidden"
    >
      <ContentGrid className="md:grid-cols-12 pt-8 pb-14 sm:pt-16 sm:pb-20 md:py-20 lg:py-32 items-center gap-10 md:gap-10 lg:gap-16">
        {/* DESKTOP / TABLET VISUAL COLUMN (Hidden on mobile <768px, left on tablet/desktop) */}
        <div className="hidden md:flex md:col-span-5 relative w-full justify-start">
          <div className="relative w-full max-w-[460px] lg:max-w-none group pb-8 pr-6 sm:pr-10 lg:pr-12">
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
            <div className="absolute right-0 bottom-0 w-[58%] sm:w-[56%] aspect-[4/3] overflow-hidden rounded-[4px] border-2 border-[#F5F5EE] shadow-[0_16px_40px_rgba(23,23,20,0.09)] bg-[#EFECE3] transition-transform duration-700 ease-out group-hover:translate-x-1 group-hover:-translate-y-1">
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

        {/* CONTENT COLUMN (Full width on mobile, right on tablet/desktop) */}
        <div
          style={{ fontFamily: '"Instrument Sans", sans-serif' }}
          className="w-full md:col-span-7 flex flex-col justify-center md:pl-6 lg:pl-8 xl:pl-12"
        >
          {/* Main Heading — Restored bold / font-semibold */}
          <h2
            style={{
              fontFamily: '"Instrument Sans", sans-serif',
              letterSpacing: '-0.03em',
            }}
            className="text-[#171714] font-semibold text-[30px] xs:text-[34px] sm:text-[38px] lg:text-[44px] leading-[1.12] max-w-[540px]"
          >
            Two decades in the automotive industry.
          </h2>

          {/* Mobile Overlapping Imagery: Bold presence, aligned with left narrative flow */}
          <div className="md:hidden mt-7 mb-8 w-full max-w-[420px]">
            <div className="relative w-full pb-8 pr-7 sm:pr-9 group">
              {/* Primary Base Image: around 72% width */}
              <div className="relative w-[72%] aspect-[4/5] overflow-hidden rounded-[4px] border border-[rgba(23,23,20,0.08)] shadow-[0_12px_32px_rgba(23,23,20,0.06)] bg-[#EFECE3]">
                <Image
                  src="/images/about/ppf-installation.jpg"
                  alt="Automotive protective film and ceramic coating installation workshop"
                  fill
                  sizes="(max-width: 768px) 75vw, 35vw"
                  className="object-cover"
                  priority={false}
                />
              </div>

              {/* Overlapping Secondary Accent Image: around 52% width, overlapping bottom-right */}
              <div className="absolute right-0 bottom-0 w-[52%] aspect-[4/3] overflow-hidden rounded-[4px] border-2 border-[#F5F5EE] shadow-[0_16px_36px_rgba(23,23,20,0.10)] bg-[#EFECE3]">
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

          {/* Full Body Copy — Uniform #171714 text color matching the heading */}
          <div
            style={{ fontFamily: '"Instrument Sans", sans-serif' }}
            className="mt-6 space-y-4 sm:space-y-5 text-[#171714] text-[16px] leading-[1.7] max-w-[480px] lg:max-w-[500px] font-normal"
          >
            <p>
              Founded in 2006, Trionyx has spent nearly two decades working across the automotive products market, building experience around vehicle protection, care and related product categories.
            </p>
            <p>
              Today, Trionyx is expanding its product portfolio and strengthening its presence through installers and distributors across India, carrying forward the experience built since its early years in the industry.
            </p>
          </div>

          {/* Single Action CTA */}
          <div className="mt-8 sm:mt-10">
            <Button
              variant="outline"
              size="lg"
              onClick={onCtaClick}
              trailingIcon={<ArrowRightIcon size={16} strokeWidth={2} />}
              className="w-full sm:w-auto justify-center h-12 text-[15px] group hover:border-[rgba(23,23,20,0.28)]"
              style={{ fontFamily: '"Instrument Sans", sans-serif' }}
            >
              About Trionyx
            </Button>
          </div>
        </div>
      </ContentGrid>
    </SectionFrame>
  );
};
