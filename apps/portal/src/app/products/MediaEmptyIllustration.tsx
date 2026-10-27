import React, { type SVGProps } from 'react';

export function MediaEmptyIllustration({ className = 'w-28 h-28', ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <defs>
        <radialGradient id="mediaGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
        <filter id="mediaCardShadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.08" />
        </filter>
      </defs>

      {/* Ambient background glow */}
      <circle cx="80" cy="80" r="68" fill="url(#mediaGlow)" />

      {/* Background Technical Document Sheet (TDS/MSDS/PDF) */}
      <g filter="url(#mediaCardShadow)">
        {/* Document Body */}
        <path
          d="M60 28H106L124 46V116C124 120.418 120.418 124 116 124H60C55.5817 124 52 120.418 52 116V36C52 31.5817 55.5817 28 60 28Z"
          fill="var(--surface-raised)"
          stroke="var(--border-strong)"
          strokeWidth="1.5"
        />
        {/* Folded Corner Tab */}
        <path
          d="M106 28V42C106 44.2091 107.791 46 110 46H124"
          fill="var(--surface-subtle)"
          stroke="var(--border-strong)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Document Schematic Text Lines */}
        <line x1="64" y1="56" x2="98" y2="56" stroke="var(--border-strong)" strokeWidth="2" strokeLinecap="round" />
        <line x1="64" y1="66" x2="112" y2="66" stroke="var(--border)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="64" y1="74" x2="108" y2="74" stroke="var(--border)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="64" y1="82" x2="92" y2="82" stroke="var(--border)" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* Foreground Multimedia Photo / Blueprint Card */}
      <g filter="url(#mediaCardShadow)">
        <rect
          x="32"
          y="58"
          width="76"
          height="58"
          rx="8"
          fill="var(--surface)"
          stroke="var(--border-strong)"
          strokeWidth="1.75"
        />
        {/* Card Screen / Image Preview Area */}
        <rect
          x="38"
          y="64"
          width="64"
          height="40"
          rx="4"
          fill="var(--surface-subtle)"
        />
        {/* Mountain Landscape / Graphic Vector inside photo */}
        <path
          d="M44 96L56 82L67 93L79 78L96 96H44Z"
          fill="var(--accent)"
          fillOpacity="0.25"
        />
        <path
          d="M58 84L68 94L80 79L95 96"
          stroke="var(--accent)"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Sun / Moon Orb */}
        <circle cx="84" cy="74" r="4.5" fill="var(--accent)" fillOpacity="0.75" />
      </g>

      {/* Accent Upload Indicator Badge */}
      <g filter="url(#mediaCardShadow)">
        <circle cx="112" cy="104" r="18" fill="var(--accent)" />
        {/* Upload Arrow */}
        <path
          d="M112 112V96M112 96L106 102M112 96L118 102"
          stroke="var(--accent-foreground)"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Floating Accent Sparkles / Decorative Elements */}
      <circle cx="28" cy="46" r="2" fill="var(--accent)" fillOpacity="0.5" />
      <circle cx="132" cy="72" r="1.5" fill="var(--accent)" fillOpacity="0.4" />
      <path
        d="M36 34L37 38L41 39L37 40L36 44L35 40L31 39L35 38L36 34Z"
        fill="var(--accent)"
        fillOpacity="0.6"
      />
      <path
        d="M128 134L129 137L132 138L129 139L128 142L127 139L124 138L127 137L128 134Z"
        fill="var(--accent)"
        fillOpacity="0.6"
      />
    </svg>
  );
}
