import React from 'react';
import { SectionFrame, ContentGrid } from '../frame';

/**
 * WHY TRIONYX SECTION
 * 
 * Stripe-grade Trust & Differentiation Section:
 * - 2 × 2 Grid on Desktop, Clean Stack on Mobile
 * - Each card integrates dedicated visual craft inspired by Stripe's feature cards:
 *   1. Since 2006: Architectural timeline odometer & calibration ticks
 *   2. Product-focused: Radiant Trionyx brand orange/amber folded gradient mesh
 *   3. Dealer support: Precision distributor network hub schematic with live pulse
 *   4. Made for Indian market: Real-world automotive climatic stress matrix
 */
export const WhyTrionyxSection: React.FC = () => {
  return (
    <SectionFrame
      id="why-trionyx"
      hasBottomBorder
      className="bg-[#F7F6F0] overflow-hidden"
    >
      <ContentGrid className="pt-14 pb-[72px] sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-32">
        {/* Section Header */}
        <div className="md:col-span-12 mb-10 md:mb-14">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F26522]" aria-hidden="true" />
            <span className="text-[11px] sm:text-[12px] font-bold tracking-[0.16em] uppercase text-[#68665F] font-mono">
              WHY TRIONYX
            </span>
          </div>

          <h2
            style={{
              fontFamily: '"Instrument Sans", sans-serif',
              letterSpacing: '-0.03em',
            }}
            className="text-[#171714] font-semibold text-[30px] sm:text-[40px] lg:text-[46px] leading-[1.08] max-w-[660px]"
          >
            <span className="block">Built on experience.</span>
            <span className="block">Chosen for what comes with it.</span>
          </h2>
        </div>

        {/* 2 × 2 Architectural Cards Grid */}
        <div className="md:col-span-12 grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
          {/* ========================================================================= */}
          {/* CARD 01: Since 2006 (Heritage & Longevity) */}
          {/* ========================================================================= */}
          <div className="group relative bg-[#FAF9F5] rounded-[14px] border border-[rgba(23,23,20,0.08)] overflow-hidden shadow-[0_1px_3px_rgba(23,23,20,0.03)] hover:shadow-[0_10px_28px_rgba(23,23,20,0.06)] hover:border-[rgba(23,23,20,0.15)] transition-all duration-300 flex flex-col md:flex-row justify-between min-h-[220px]">
            {/* Left Content Area */}
            <div className="p-6 sm:p-7 lg:p-8 flex-1 flex flex-col justify-between">
              <div>
                <span className="font-mono text-[11px] sm:text-[12px] font-bold tracking-[0.16em] uppercase text-[#F26522] mb-3 block">
                  01
                </span>
                <h3
                  style={{
                    fontFamily: '"Instrument Sans", sans-serif',
                    letterSpacing: '-0.02em',
                  }}
                  className="text-[21px] sm:text-[23px] font-semibold text-[#171714] mb-2.5 leading-snug"
                >
                  Since 2006
                </h3>
                <p className="text-[14.5px] sm:text-[15px] text-[#68665F] leading-[1.65] max-w-[380px] font-normal tracking-[-0.01em]">
                  Nearly two decades of experience in the automotive products market.
                </p>
              </div>

              <div className="pt-5 mt-auto">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold tracking-[0.1em] text-[#8C897E] uppercase">
                  EST. 2006 · 20 YEARS AUTOMOTIVE FOCUS
                </span>
              </div>
            </div>

            {/* Right Graphic: Architectural Timeline Odometer */}
            <div className="w-full md:w-[220px] lg:w-[240px] shrink-0 bg-[#F4F2EA]/70 border-t md:border-t-0 md:border-l border-[rgba(23,23,20,0.06)] p-6 flex flex-col justify-center items-center relative overflow-hidden">
              {/* Subtle background grid lines */}
              <div 
                className="absolute inset-0 opacity-[0.06] pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(#171714 1px, transparent 1px)',
                  backgroundSize: '12px 12px',
                }}
              />

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="flex items-baseline gap-1.5">
                  <span 
                    style={{ fontFamily: '"Instrument Sans", sans-serif' }}
                    className="text-[52px] sm:text-[58px] font-bold text-[#171714] tracking-[-0.04em] leading-none"
                  >
                    20
                  </span>
                  <span className="font-mono text-[12px] font-bold tracking-[0.14em] text-[#F26522] uppercase">
                    YRS
                  </span>
                </div>

                <span className="text-[11px] font-mono tracking-[0.14em] uppercase text-[#68665F] mt-1">
                  2006 → 2026
                </span>

                {/* Precision Calibration Ticks */}
                <div className="flex items-end gap-[3px] mt-4 h-6 px-3 py-1 bg-white/60 rounded-md border border-[rgba(23,23,20,0.06)] shadow-sm">
                  {[...Array(20)].map((_, i) => {
                    const isEdge = i === 0 || i === 19;
                    const isMid = i === 9;
                    return (
                      <span
                        key={i}
                        className={`w-[2px] rounded-full transition-all duration-300 ${
                          isEdge
                            ? 'h-4 bg-[#F26522]'
                            : isMid
                            ? 'h-3 bg-[#171714]'
                            : 'h-2 bg-[#D1CCC0]'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CARD 02: Product-focused (Stripe-style Embedded Radiant Mesh Gradient) */}
          {/* ========================================================================= */}
          <div className="group relative bg-[#FAF9F5] rounded-[14px] border border-[rgba(23,23,20,0.08)] overflow-hidden shadow-[0_1px_3px_rgba(23,23,20,0.03)] hover:shadow-[0_10px_28px_rgba(23,23,20,0.06)] hover:border-[rgba(23,23,20,0.15)] transition-all duration-300 flex flex-col md:flex-row justify-between min-h-[220px]">
            {/* Left Content Area */}
            <div className="p-6 sm:p-7 lg:p-8 flex-1 flex flex-col justify-between relative z-10">
              <div>
                <span className="font-mono text-[11px] sm:text-[12px] font-bold tracking-[0.16em] uppercase text-[#F26522] mb-3 block">
                  02
                </span>
                <h3
                  style={{
                    fontFamily: '"Instrument Sans", sans-serif',
                    letterSpacing: '-0.02em',
                  }}
                  className="text-[21px] sm:text-[23px] font-semibold text-[#171714] mb-2.5 leading-snug"
                >
                  Product-focused
                </h3>
                <p className="text-[14.5px] sm:text-[15px] text-[#68665F] leading-[1.65] max-w-[380px] font-normal tracking-[-0.01em]">
                  A growing automotive portfolio built around protection, care and related product categories.
                </p>
              </div>

              <div className="pt-5 mt-auto">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold tracking-[0.1em] text-[#8C897E] uppercase">
                  FILMS · COATINGS · SURFACE PROTECTION
                </span>
              </div>
            </div>

            {/* Right Graphic: Signature Stripe-Inspired Radiant Mesh Ribbon Bleed */}
            <div className="w-full md:w-[220px] lg:w-[240px] h-[140px] md:h-auto shrink-0 relative overflow-hidden bg-[#F4F2EA]/40 border-t md:border-t-0 md:border-l border-[rgba(23,23,20,0.06)] flex items-center justify-center">
              {/* Angled Folded Mesh Gradient Swatch */}
              <div 
                className="absolute -right-8 -bottom-8 w-[240px] h-[220px] rounded-[24px] transform rotate-[-14deg] transition-transform duration-700 ease-out group-hover:scale-105 group-hover:rotate-[-10deg] shadow-[0_12px_36px_rgba(242,101,34,0.30)]"
                style={{
                  background: 'linear-gradient(135deg, #FF9E44 0%, #F26522 45%, #C93809 85%, #8A1A05 100%)',
                }}
              >
                {/* Internal Satin Specular Ridge Gleam */}
                <div 
                  className="absolute inset-0 rounded-[24px]"
                  style={{
                    background: 'radial-gradient(ellipse at 30% 25%, rgba(255,245,230,0.85) 0%, rgba(255,180,120,0.4) 40%, transparent 75%)',
                  }}
                />

                {/* Combed Longitudinal Micro-Fibres */}
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.7) 3px, rgba(255,255,255,0.7) 4px)',
                  }}
                />
              </div>

              {/* Foreground Technical Spec Pill */}
              <div className="relative z-10 bg-white/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[rgba(23,23,20,0.10)] shadow-sm">
                <span className="font-mono text-[10.5px] font-bold tracking-[0.14em] uppercase text-[#171714]">
                  MULTI-CATEGORY
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CARD 03: Dealer support (Distribution Node Schematic) */}
          {/* ========================================================================= */}
          <div className="group relative bg-[#FAF9F5] rounded-[14px] border border-[rgba(23,23,20,0.08)] overflow-hidden shadow-[0_1px_3px_rgba(23,23,20,0.03)] hover:shadow-[0_10px_28px_rgba(23,23,20,0.06)] hover:border-[rgba(23,23,20,0.15)] transition-all duration-300 flex flex-col md:flex-row justify-between min-h-[220px]">
            {/* Left Content Area */}
            <div className="p-6 sm:p-7 lg:p-8 flex-1 flex flex-col justify-between">
              <div>
                <span className="font-mono text-[11px] sm:text-[12px] font-bold tracking-[0.16em] uppercase text-[#F26522] mb-3 block">
                  03
                </span>
                <h3
                  style={{
                    fontFamily: '"Instrument Sans", sans-serif',
                    letterSpacing: '-0.02em',
                  }}
                  className="text-[21px] sm:text-[23px] font-semibold text-[#171714] mb-2.5 leading-snug"
                >
                  Dealer support
                </h3>
                <p className="text-[14.5px] sm:text-[15px] text-[#68665F] leading-[1.65] max-w-[380px] font-normal tracking-[-0.01em]">
                  Product availability, guidance and support designed around long-term dealer relationships.
                </p>
              </div>

              <div className="pt-5 mt-auto">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold tracking-[0.1em] text-[#8C897E] uppercase">
                  PARTNER ALLOCATION & GUIDANCE
                </span>
              </div>
            </div>

            {/* Right Graphic: Technical Hub & Route Node Schematic */}
            <div className="w-full md:w-[220px] lg:w-[240px] h-[140px] md:h-auto shrink-0 bg-[#F4F2EA]/70 border-t md:border-t-0 md:border-l border-[rgba(23,23,20,0.06)] p-5 flex flex-col justify-center items-center relative overflow-hidden">
              <svg
                viewBox="0 0 180 120"
                className="w-full h-auto max-w-[170px]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Background coordinate grid */}
                <path d="M10 60H170M90 10V110" stroke="rgba(23,23,20,0.06)" strokeWidth="1" strokeDasharray="3 3" />
                
                {/* Route connector arcs */}
                <path d="M90 60 Q 50 30 35 40" stroke="rgba(242,101,34,0.4)" strokeWidth="1.5" strokeDasharray="2 2" />
                <path d="M90 60 Q 130 30 145 35" stroke="rgba(242,101,34,0.4)" strokeWidth="1.5" strokeDasharray="2 2" />
                <path d="M90 60 Q 60 90 45 85" stroke="rgba(242,101,34,0.4)" strokeWidth="1.5" strokeDasharray="2 2" />
                <path d="M90 60 Q 125 95 140 85" stroke="rgba(242,101,34,0.4)" strokeWidth="1.5" strokeDasharray="2 2" />

                {/* Satellite Studio Nodes */}
                <circle cx="35" cy="40" r="4" fill="#171714" />
                <circle cx="145" cy="35" r="4" fill="#171714" />
                <circle cx="45" cy="85" r="4" fill="#171714" />
                <circle cx="140" cy="85" r="4" fill="#171714" />

                {/* Central Origin Pulse Hub (HQ) */}
                <circle cx="90" cy="60" r="16" stroke="rgba(242,101,34,0.25)" strokeWidth="1.5" />
                <circle cx="90" cy="60" r="10" stroke="rgba(242,101,34,0.45)" strokeWidth="1.5" />
                <circle cx="90" cy="60" r="5" fill="#F26522" />
              </svg>

              {/* Live Status Pill */}
              <div className="flex items-center gap-1.5 mt-2 bg-white/80 px-2.5 py-1 rounded-full border border-[rgba(23,23,20,0.07)] shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                <span className="text-[9.5px] font-mono font-bold tracking-[0.1em] text-[#171714] uppercase">
                  DIRECT ACCESS
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CARD 04: Made for the Indian market (Operating Matrix) */}
          {/* ========================================================================= */}
          <div className="group relative bg-[#FAF9F5] rounded-[14px] border border-[rgba(23,23,20,0.08)] overflow-hidden shadow-[0_1px_3px_rgba(23,23,20,0.03)] hover:shadow-[0_10px_28px_rgba(23,23,20,0.06)] hover:border-[rgba(23,23,20,0.15)] transition-all duration-300 flex flex-col md:flex-row justify-between min-h-[220px]">
            {/* Left Content Area */}
            <div className="p-6 sm:p-7 lg:p-8 flex-1 flex flex-col justify-between">
              <div>
                <span className="font-mono text-[11px] sm:text-[12px] font-bold tracking-[0.16em] uppercase text-[#F26522] mb-3 block">
                  04
                </span>
                <h3
                  style={{
                    fontFamily: '"Instrument Sans", sans-serif',
                    letterSpacing: '-0.02em',
                  }}
                  className="text-[21px] sm:text-[23px] font-semibold text-[#171714] mb-2.5 leading-snug"
                >
                  Made for the Indian market
                </h3>
                <p className="text-[14.5px] sm:text-[15px] text-[#68665F] leading-[1.65] max-w-[380px] font-normal tracking-[-0.01em]">
                  Products and distribution shaped around Indian automotive demand and operating conditions.
                </p>
              </div>

              <div className="pt-5 mt-auto">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold tracking-[0.1em] text-[#8C897E] uppercase">
                  CLIMATE & ROAD ENVIRONMENT TESTED
                </span>
              </div>
            </div>

            {/* Right Graphic: Indian Condition Spec Matrix */}
            <div className="w-full md:w-[220px] lg:w-[240px] shrink-0 bg-[#F4F2EA]/70 border-t md:border-t-0 md:border-l border-[rgba(23,23,20,0.06)] p-5 flex flex-col justify-center">
              <div className="grid grid-cols-2 gap-2 w-full">
                {/* Metric 1 */}
                <div className="bg-white/80 border border-[rgba(23,23,20,0.07)] rounded-md p-2.5 shadow-xs flex flex-col">
                  <span className="font-mono text-[12px] font-bold text-[#171714] leading-none">
                    48°C
                  </span>
                  <span className="text-[9.5px] font-mono tracking-[0.08em] text-[#68665F] uppercase mt-1">
                    HIGH HEAT
                  </span>
                </div>

                {/* Metric 2 */}
                <div className="bg-white/80 border border-[rgba(23,23,20,0.07)] rounded-md p-2.5 shadow-xs flex flex-col">
                  <span className="font-mono text-[12px] font-bold text-[#171714] leading-none">
                    11+ UV
                  </span>
                  <span className="text-[9.5px] font-mono tracking-[0.08em] text-[#68665F] uppercase mt-1">
                    SOLAR INDEX
                  </span>
                </div>

                {/* Metric 3 */}
                <div className="bg-white/80 border border-[rgba(23,23,20,0.07)] rounded-md p-2.5 shadow-xs flex flex-col">
                  <span className="font-mono text-[12px] font-bold text-[#F26522] leading-none">
                    MONSOON
                  </span>
                  <span className="text-[9.5px] font-mono tracking-[0.08em] text-[#68665F] uppercase mt-1">
                    HYDROPHOBIC
                  </span>
                </div>

                {/* Metric 4 */}
                <div className="bg-white/80 border border-[rgba(23,23,20,0.07)] rounded-md p-2.5 shadow-xs flex flex-col">
                  <span className="font-mono text-[12px] font-bold text-[#171714] leading-none">
                    DEBRIS
                  </span>
                  <span className="text-[9.5px] font-mono tracking-[0.08em] text-[#68665F] uppercase mt-1">
                    IMPACT SHOCK
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ContentGrid>
    </SectionFrame>
  );
};
