'use client';

import React, { useEffect, useState } from 'react';

/**
 * TRIONYX OPERATIONS EMBLEM & SYSTEM INITIALIZATION ANIMATION
 *
 * Custom brand identity symbol designed on a 64 × 64 master vector grid:
 * - Outer hex frame: 42 × 44 units, slightly softened corners.
 * - Inner X: 25 × 25 units (~59% of hex interior, within the 55–65% specification).
 * - Diagonal strokes: balanced stroke width (~4px, scales to 1.5px at 24px icon size).
 * - Intersection: engineered negative space notch separating counter arms from
 *   the rising Trionyx orange identity blade.
 *
 * Sequence (0–850ms):
 * 1. 0–250ms: Outer hexagonal frame draws into position.
 * 2. 250–550ms: Two custom X counter strokes assemble inside the frame.
 * 3. 550–750ms: Orange identity stroke draws into place.
 * 4. 750–850ms: Emblem settles into final static equilibrium.
 */

export interface TrionyxOpsMarkProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  variant?: 'brand' | 'monochrome';
  className?: string;
  animateOnce?: boolean;
  forceAnimate?: boolean;
}

const HEX_PATH = 'M32 10L53 21.5V42.5L32 54L11 42.5V21.5Z';
const X_COUNTER_TOP = { x1: 19.5, y1: 19.5, x2: 27.5, y2: 27.5 };
const X_COUNTER_BOTTOM = { x1: 36.5, y1: 36.5, x2: 44.5, y2: 44.5 };
const X_IDENTITY = { x1: 19.5, y1: 44.5, x2: 44.5, y2: 19.5 };

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
  const hexStroke = isBrand ? '#A9A59C' : 'currentColor';
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
      {/* Outer Hexagonal Frame */}
      <path
        d={HEX_PATH}
        stroke={hexStroke}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Inner X: Neutral Counter Arm (Top-Left segment) */}
      <line
        x1={X_COUNTER_TOP.x1}
        y1={X_COUNTER_TOP.y1}
        x2={X_COUNTER_TOP.x2}
        y2={X_COUNTER_TOP.y2}
        stroke={counterStroke}
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Inner X: Neutral Counter Arm (Bottom-Right segment) */}
      <line
        x1={X_COUNTER_BOTTOM.x1}
        y1={X_COUNTER_BOTTOM.y1}
        x2={X_COUNTER_BOTTOM.x2}
        y2={X_COUNTER_BOTTOM.y2}
        stroke={counterStroke}
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Inner X: Signature Orange Identity Stroke */}
      <line
        x1={X_IDENTITY.x1}
        y1={X_IDENTITY.y1}
        x2={X_IDENTITY.x2}
        y2={X_IDENTITY.y2}
        stroke={identityStroke}
        strokeWidth="4"
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
  const hexStroke = isBrand ? '#A9A59C' : 'currentColor';
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
        @keyframes trx-hex-draw {
          0% {
            stroke-dashoffset: 140;
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }

        @keyframes trx-counter-draw {
          0%, 29.4% {
            stroke-dashoffset: 16;
            opacity: 0;
          }
          32% {
            opacity: 1;
          }
          64.7% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }

        @keyframes trx-identity-draw {
          0%, 64.7% {
            stroke-dashoffset: 38;
            opacity: 0;
          }
          66% {
            opacity: 1;
          }
          88.2% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }

        @keyframes trx-mark-settle {
          0%, 88.2% {
            transform: scale(1.02);
            transform-origin: center;
          }
          100% {
            transform: scale(1.0);
            transform-origin: center;
          }
        }

        .trx-hex-path {
          stroke-dasharray: 140;
          stroke-dashoffset: 140;
          animation: trx-hex-draw 850ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }

        .trx-counter-path {
          stroke-dasharray: 16;
          stroke-dashoffset: 16;
          animation: trx-counter-draw 850ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }

        .trx-identity-path {
          stroke-dasharray: 38;
          stroke-dashoffset: 38;
          animation: trx-identity-draw 850ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }

        .trx-emblem-group {
          animation: trx-mark-settle 850ms cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .trx-hex-path,
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
        {/* Step 1 (0–250ms): Outer Hexagonal Frame draws into position */}
        <path
          d={HEX_PATH}
          stroke={hexStroke}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="trx-hex-path"
        />

        {/* Step 2 (250–550ms): X Counter Strokes assemble inside frame */}
        <line
          x1={X_COUNTER_TOP.x1}
          y1={X_COUNTER_TOP.y1}
          x2={X_COUNTER_TOP.x2}
          y2={X_COUNTER_TOP.y2}
          stroke={counterStroke}
          strokeWidth="4"
          strokeLinecap="round"
          className="trx-counter-path"
        />
        <line
          x1={X_COUNTER_BOTTOM.x1}
          y1={X_COUNTER_BOTTOM.y1}
          x2={X_COUNTER_BOTTOM.x2}
          y2={X_COUNTER_BOTTOM.y2}
          stroke={counterStroke}
          strokeWidth="4"
          strokeLinecap="round"
          className="trx-counter-path"
        />

        {/* Step 3 (550–750ms): Trionyx Orange Identity Stroke draws into place */}
        <line
          x1={X_IDENTITY.x1}
          y1={X_IDENTITY.y1}
          x2={X_IDENTITY.x2}
          y2={X_IDENTITY.y2}
          stroke={identityStroke}
          strokeWidth="4"
          strokeLinecap="round"
          className="trx-identity-path"
        />
      </g>
    </svg>
  );
}
