import type { ReactNode } from 'react';

export function SectionEyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`section-eyebrow ${className}`}>
      {children}
    </p>
  );
}
