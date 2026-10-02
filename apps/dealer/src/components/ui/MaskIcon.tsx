import React from 'react';

/**
 * Renders an SVG glyph as a monochrome mask so it inherits `currentColor`.
 * Works in both server and client components.
 */
export function MaskIcon({ src, className = 'w-5 h-5' }: { src: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`block bg-current ${className}`}
      style={{
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
      }}
    />
  );
}
