import React from 'react';

export interface PageFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

/** Full-width page wrapper on the warm-black canvas. Sections constrain their own content width. */
export const PageFrame: React.FC<PageFrameProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`relative flex w-full flex-1 flex-col bg-[var(--color-background)] ${className}`} {...props}>
      {children}
    </div>
  );
};
