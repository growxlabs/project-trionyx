import React from 'react';
import Image from 'next/image';

export interface TrionyxLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  priority?: boolean;
}

const sizeClasses = {
  sm: 'h-9 w-auto',
  md: 'h-11 sm:h-12 w-auto',
  lg: 'h-14 sm:h-16 w-auto',
  xl: 'h-20 w-auto',
};

export const TrionyxLogo = ({
  className = '',
  size = 'md',
  priority = true,
}: TrionyxLogoProps) => {
  return (
    <div className={`relative inline-flex items-center shrink-0 ${sizeClasses[size]} ${className}`}>
      <Image
        src="/trionyx-logo-orange.png"
        alt="Trionyx — Always Exceed Expectations"
        width={519}
        height={187}
        priority={priority}
        className="h-full w-auto object-contain"
      />
    </div>
  );
};

