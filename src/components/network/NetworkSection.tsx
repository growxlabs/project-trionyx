'use client';

import React from 'react';
import { SectionFrame } from '../frame';
import { WorldMap } from '../ui/world-map';

/**
 * TRIONYX NETWORK SECTION
 *
 * Requirements:
 * - Aceternity UI World Map starting component + dotted-map + motion
 * - Full horizontal section width on the warm Trionyx canvas (#F7F6F0)
 * - Top left: Eyebrow "TRIONYX NETWORK", Main heading "From Vijayawada, across India."
 * - No body paragraph, no CTA buttons, no cards, no rectangular borders
 * - World dots: subtle warm grey, low contrast, no country borders, no ocean fill
 * - India dots: highlighted in Trionyx orange (#F26522) with distinct dotted language
 * - Vijayawada origin: real geographic position (16.5062°N, 80.6480°E), solid orange center, thin outer ring, restrained pulse, small label
 * - Thin animated curved routes radiating from Vijayawada to Indian hubs (Hyderabad, Bengaluru, Chennai, Mumbai, Delhi NCR, Kolkata, Ahmedabad, Kochi)
 */
export const NetworkSection: React.FC = () => {
  return (
    <SectionFrame
      id="network"
      hasBottomBorder
      className="bg-[#F7F6F0] overflow-hidden"
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        {/* Top Left Header Area */}
        <div className="mb-6 sm:mb-10 max-w-[640px]">
          {/* Eyebrow: Strictly uppercase monospace, no dots */}
          <span className="text-[11px] sm:text-[12px] font-bold tracking-[0.14em] uppercase text-[#68665F] font-mono mb-3 sm:mb-4 block">
            TRIONYX NETWORK
          </span>

          {/* Main Heading */}
          <h2
            style={{
              fontFamily: '"Instrument Sans", sans-serif',
              letterSpacing: '-0.035em',
            }}
            className="text-[#171714] font-semibold text-[32px] sm:text-[40px] lg:text-[46px] leading-[1.1]"
          >
            From Vijayawada, across India.
          </h2>
        </div>

        {/* Expansive Horizontal Dotted World Map */}
        <div className="w-full">
          <WorldMap />
        </div>
      </div>
    </SectionFrame>
  );
};
