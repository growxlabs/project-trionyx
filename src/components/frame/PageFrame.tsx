import React from 'react';

export interface PageFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

/**
 * TRIONYX PERSISTENT GLOBAL PAGE FRAME
 * 
 * Direct implementation of the Stripe-style architectural framing:
 * - Desktop: width: min(calc(100% - 64px), 1440px); margin-inline: auto;
 * - Tablet: width: calc(100% - 48px); margin-inline: auto;
 * - Mobile: width: calc(100% - 32px); margin-inline: auto;
 * - 1px left and right vertical rails: #E8E1DA
 * - Persistent centered alignment across all viewport widths.
 * - Main Canvas: #FBF8F4
 */
export const PageFrame: React.FC<PageFrameProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`relative mx-auto bg-[#F5F5EE] w-full border-x-0 md:w-[calc(100%-48px)] md:border-l md:border-r md:border-[rgba(23,23,20,0.07)] lg:w-[min(calc(100%-64px),1440px)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
