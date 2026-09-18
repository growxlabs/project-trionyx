import React from 'react';

export interface ContentGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

/**
 * TRIONYX 12-COLUMN INTERNAL CONTENT GRID
 * 
 * Strict architectural grid:
 * - 12 columns (grid-cols-12 on desktop)
 * - 32px outer internal padding (px-8 on desktop, px-6 on tablet, px-4 on mobile)
 * - 24px column gaps (gap-6)
 */
export const ContentGrid: React.FC<ContentGridProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`w-full px-5 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
