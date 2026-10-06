'use client';

import React, { ComponentProps, memo } from 'react';
import { cn } from '@/lib/utils';

export type ShimmerProps = ComponentProps<'div'> & {
  children?: React.ReactNode;
  duration?: number;
};

export const Shimmer = memo(({
  children,
  className,
  duration = 1.6,
  ...props
}: ShimmerProps) => {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2.5 py-1 text-sm font-medium text-[var(--text-secondary)]',
        className
      )}
      role="status"
      {...props}
    >
      <span className="relative flex size-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent,#F26522)] opacity-75" />
        <span className="relative inline-flex rounded-full size-2.5 bg-[var(--accent,#F26522)]" />
      </span>
      <span className="animate-pulse">{children}</span>
    </div>
  );
});

Shimmer.displayName = 'Shimmer';
