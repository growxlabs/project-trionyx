'use client';

import React, { useEffect, useState } from 'react';

/**
 * TRIONYX OPERATIONS EMBLEM & SYSTEM INITIALIZATION ANIMATION
 *
 * Option A: The Performance Tyre / Wheel Rim Chassis
 * Custom brand identity symbol designed on a 64 × 64 master vector grid:
 * - Outer Performance Tyre: r=23 circle (~46 units diameter) with 3.0px stroke.
 * - Technical Tread / Alignment Notches: 4 cardinal ticks at 12, 3, 6, 9 o'clock (2.4px stroke).
 * - Inner Wheel Rim Lip: r=17 concentric circle (1.6px stroke) framing the hub.
 * - Inner Custom X: 24 × 24 units spokes anchoring directly into the rim lip.
 * - Engineered negative space notch: separating counter arms from the rising Trionyx orange identity blade.
 *
 * Sequence (0–850ms):
 * 1. 0–280ms: Tyre contour, technical tread notches, and wheel rim lip draw into position.
 * 2. 280–550ms: Two custom X counter strokes assemble from the rim lip inward.
 * 3. 550–750ms: Orange identity blade draws into place through the hub center.
 * 4. 750–850ms: Emblem settles into final static equilibrium.
 */

export interface TrionyxOpsMarkProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  variant?: 'brand' | 'monochrome';
  className?: string;
  animateOnce?: boolean;
  forceAnimate?: boolean;
}

const TYRE_NOTCHES_PATH = 'M32 5.5V10.5M32 53.5V58.5M5.5 32H10.5M53.5 32H58.5';
const X_COUNTER_TOP = { x1: 20, y1: 20, x2: 27.5, y2: 27.5 };
const X_COUNTER_BOTTOM = { x1: 36.5, y1: 36.5, x2: 44, y2: 44 };
const X_IDENTITY = { x1: 20, y1: 44, x2: 44, y2: 20 };

/**
 * Canonical Static SVG Vector Component
 */
export function TrionyxOpsMark({
  size = 24,
  variant = 'brand',
  className = '',
  ...props
}: TrionyxOpsMarkProps) {
  const isBrand = variant === 'brand';
  const tyreStroke = isBrand ? '#A9A59C' : 'currentColor';
  const rimStroke = isBrand ? '#8E8A81' : 'currentColor';
  const counterStroke = isBrand ? '#F5F3EC' : 'currentColor';
  const identityStroke = isBrand ? '#F26522' : 'currentColor';

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      width={size}
      height={size}
      className={`shrink-0 select-none ${className}`}
      role="img"
      aria-label="Trionyx Operations Emblem"
      {...props}
    >
      {/* Outer Performance Tyre Wall */}
      <circle
        cx="32"
        cy="32"
        r="23"
        stroke={tyreStroke}
        strokeWidth="3"
      />
      {/* Technical Tread / Alignment Notches (12, 3, 6, 9 o'clock) */}
      <path
        d={TYRE_NOTCHES_PATH}
        stroke={tyreStroke}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* Inner Wheel Rim Lip */}
      <circle
        cx="32"
        cy="32"
        r="17"
        stroke={rimStroke}
        strokeWidth="1.6"
        strokeOpacity={isBrand ? 0.85 : 0.6}
      />
      {/* Inner X: Neutral Counter Arm (Top-Left segment) */}
      <line
        x1={X_COUNTER_TOP.x1}
        y1={X_COUNTER_TOP.y1}
        x2={X_COUNTER_TOP.x2}
        y2={X_COUNTER_TOP.y2}
        stroke={counterStroke}
        strokeWidth="3.8"
        strokeLinecap="round"
      />
      {/* Inner X: Neutral Counter Arm (Bottom-Right segment) */}
      <line
        x1={X_COUNTER_BOTTOM.x1}
        y1={X_COUNTER_BOTTOM.y1}
        x2={X_COUNTER_BOTTOM.x2}
        y2={X_COUNTER_BOTTOM.y2}
        stroke={counterStroke}
        strokeWidth="3.8"
        strokeLinecap="round"
      />
      {/* Inner X: Signature Orange Identity Blade */}
      <line
        x1={X_IDENTITY.x1}
        y1={X_IDENTITY.y1}
        x2={X_IDENTITY.x2}
        y2={X_IDENTITY.y2}
        stroke={identityStroke}
        strokeWidth="3.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Animated Variant Component — System Initialization
 * Plays the mechanical assembly sequence once per browser session.
 */
export function TrionyxOpsMarkAnimated({
  size = 24,
  variant = 'brand',
  animateOnce = true,
  forceAnimate = false,
  className = '',
  ...props
}: TrionyxOpsMarkProps) {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (forceAnimate) {
      setShouldAnimate(true);
      return;
    }

    if (typeof window !== 'undefined') {
      if (!animateOnce) {
        setShouldAnimate(true);
        return;
      }

      try {
        const hasAnimated = window.sessionStorage.getItem('trionyx_ops_mark_initialized');
        if (!hasAnimated) {
          setShouldAnimate(true);
          window.sessionStorage.setItem('trionyx_ops_mark_initialized', 'true');
        } else {
          setShouldAnimate(false);
        }
      } catch {
        // Fallback for private mode without session storage
        setShouldAnimate(false);
      }
    }
  }, [animateOnce, forceAnimate]);

  // If already animated or static mode, render clean static mark
  if (!shouldAnimate) {
    return (
      <TrionyxOpsMark
        size={size}
        variant={variant}
        className={`transition-transform duration-150 ease-out hover:scale-[1.04] ${className}`}
        {...props}
      />
    );
  }

  const isBrand = variant === 'brand';
  const tyreStroke = isBrand ? '#A9A59C' : 'currentColor';
  const rimStroke = isBrand ? '#8E8A81' : 'currentColor';
  const counterStroke = isBrand ? '#F5F3EC' : 'currentColor';
  const identityStroke = isBrand ? '#F26522' : 'currentColor';

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      width={size}
      height={size}
      className={`shrink-0 select-none transition-transform duration-150 ease-out hover:scale-[1.04] ${className}`}
      role="img"
      aria-label="Trionyx Operations Emblem (Initializing)"
      {...props}
    >
      <style>{`
        /* System Initialization Assembly Sequence (850ms Total) */
        @keyframes trx-tyre-draw {
          0% {
            stroke-dashoffset: 145;
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          33% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }

        @keyframes trx-rim-draw {
          0% {
            stroke-dashoffset: 107;
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          33% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }

        @keyframes trx-notches-fade {
          0%, 15% {
            opacity: 0;
          }
          33% {
            opacity: 1;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes trx-counter-draw {
          0%, 33% {
            stroke-dashoffset: 16;
            opacity: 0;
          }
          36% {
            opacity: 1;
          }
          65% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }

        @keyframes trx-identity-draw {
          0%, 65% {
            stroke-dashoffset: 36;
            opacity: 0;
          }
          68% {
            opacity: 1;
          }
          88% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }

        @keyframes trx-mark-settle {
          0%, 88% {
            transform: scale(1.02);
            transform-origin: center;
          }
          100% {
            transform: scale(1.0);
            transform-origin: center;
          }
        }

        .trx-tyre-path {
          stroke-dasharray: 145;
          stroke-dashoffset: 145;
          animation: trx-tyre-draw 850ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }

        .trx-rim-path {
          stroke-dasharray: 107;
          stroke-dashoffset: 107;
          animation: trx-rim-draw 850ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }

        .trx-notches-path {
          animation: trx-notches-fade 850ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }

        .trx-counter-path {
          stroke-dasharray: 16;
          stroke-dashoffset: 16;
          animation: trx-counter-draw 850ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }

        .trx-identity-path {
          stroke-dasharray: 36;
          stroke-dashoffset: 36;
          animation: trx-identity-draw 850ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }

        .trx-emblem-group {
          animation: trx-mark-settle 850ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .trx-tyre-path,
          .trx-rim-path,
          .trx-notches-path,
          .trx-counter-path,
          .trx-identity-path,
          .trx-emblem-group {
            animation: none !important;
            stroke-dashoffset: 0 !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      <g className="trx-emblem-group">
        {/* Step 1 (0–280ms): Outer Performance Tyre contour */}
        <circle
          cx="32"
          cy="32"
          r="23"
          stroke={tyreStroke}
          strokeWidth="3"
          transform="rotate(-90 32 32)"
          className="trx-tyre-path"
        />

        {/* Step 1b (0–280ms): Technical Tread / Alignment Notches */}
        <path
          d={TYRE_NOTCHES_PATH}
          stroke={tyreStroke}
          strokeWidth="2.4"
          strokeLinecap="round"
          className="trx-notches-path"
        />

        {/* Step 1c (0–280ms): Inner Wheel Rim Lip */}
        <circle
          cx="32"
          cy="32"
          r="17"
          stroke={rimStroke}
          strokeWidth="1.6"
          strokeOpacity={isBrand ? 0.85 : 0.6}
          transform="rotate(-90 32 32)"
          className="trx-rim-path"
        />

        {/* Step 2 (280–550ms): X Counter Strokes assemble inside frame */}
        <line
          x1={X_COUNTER_TOP.x1}
          y1={X_COUNTER_TOP.y1}
          x2={X_COUNTER_TOP.x2}
          y2={X_COUNTER_TOP.y2}
          stroke={counterStroke}
          strokeWidth="3.8"
          strokeLinecap="round"
          className="trx-counter-path"
        />
        <line
          x1={X_COUNTER_BOTTOM.x1}
          y1={X_COUNTER_BOTTOM.y1}
          x2={X_COUNTER_BOTTOM.x2}
          y2={X_COUNTER_BOTTOM.y2}
          stroke={counterStroke}
          strokeWidth="3.8"
          strokeLinecap="round"
          className="trx-counter-path"
        />

        {/* Step 3 (550–750ms): Trionyx Orange Identity Blade sweeps through hub */}
        <line
          x1={X_IDENTITY.x1}
          y1={X_IDENTITY.y1}
          x2={X_IDENTITY.x2}
          y2={X_IDENTITY.y2}
          stroke={identityStroke}
          strokeWidth="3.8"
          strokeLinecap="round"
          className="trx-identity-path"
        />
      </g>
    </svg>
  );
}
