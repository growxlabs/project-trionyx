import React from 'react';

export interface SectionFrameProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
  hasBottomBorder?: boolean;
  as?: 'section' | 'div' | 'header' | 'footer' | 'main';
}

/**
 * TRIONYX SECTION FRAME PRIMITIVE
 * 
 * Enforces horizontal boundary rules terminating against the global vertical rails:
 * - border-bottom: 1px solid #E8E1DA
 */
export const SectionFrame: React.FC<SectionFrameProps> = ({
  children,
  className = '',
  hasBottomBorder = true,
  as: Component = 'section',
  ...props
}) => {
  return (
    <Component
      className={`relative w-full ${
        hasBottomBorder ? 'border-b border-[var(--section-divider)]' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};
