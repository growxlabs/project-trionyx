import type { ReactNode } from 'react';

export function SectionEyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`section-eyebrow ${className}`}>
      <span className="section-eyebrow-rule" aria-hidden="true" />
      {children}
    </p>
  );
}
