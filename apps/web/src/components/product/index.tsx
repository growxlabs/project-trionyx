/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { ShieldCheckIcon, DropletIcon, ChevronRightIcon } from '../ui/Icons';

/* =========================================================================
   1. PRODUCT IMAGE FRAME
   Clean frame with aspect ratio support, zoom on hover, and light surface.
   ========================================================================= */

export interface ProductImageFrameProps {
  src?: string;
  alt?: string;
  aspectRatio?: '4/3' | '1/1' | '16/9';
  className?: string;
  children?: React.ReactNode;
}

export const ProductImageFrame = ({
  src,
  alt = 'Trionyx Product',
  aspectRatio = '4/3',
  className = '',
  children,
}: ProductImageFrameProps) => {
  const aspectClass = {
    '4/3': 'aspect-[4/3]',
    '1/1': 'aspect-square',
    '16/9': 'aspect-video',
  }[aspectRatio];

  return (
    <div
      className={`relative w-full ${aspectClass} bg-[#FAF8F6] border border-[#EFEDEB] rounded-[6px] overflow-hidden flex items-center justify-center p-6 group ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-[#626262] gap-2">
          <div className="w-16 h-16 rounded-full bg-white border border-[#EFEDEB] flex items-center justify-center shadow-xs">
            <ShieldCheckIcon size={28} color="brandOrange" strokeWidth={1.5} />
          </div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#626262]">
            LAB TESTED SPEC
          </span>
        </div>
      )}
      {children}
    </div>
  );
};

/* =========================================================================
   2. PRODUCT SPECIFICATION ROW
   Technical key-value row for automotive protection specifications.
   ========================================================================= */

export interface ProductSpecRowProps {
  label: string;
  value: string;
  unit?: string;
  testStandard?: string;
  className?: string;
}

export const ProductSpecRow = ({
  label,
  value,
  unit,
  testStandard,
  className = '',
}: ProductSpecRowProps) => {
  return (
    <div
      className={`flex items-center justify-between py-2.5 border-b border-[#EFEDEB] text-[13px] last:border-b-0 ${className}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-[#626262] font-medium">{label}</span>
        {testStandard && (
          <span className="text-[10px] font-mono uppercase bg-[#EFEDEB] text-[#2A2A2A] px-1.5 py-0.5 rounded-[2px]">
            {testStandard}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1 font-mono font-semibold text-[#151515]">
        <span>{value}</span>
        {unit && <span className="text-[11px] text-[#626262] font-normal">{unit}</span>}
      </div>
    </div>
  );
};

/* =========================================================================
   3. PRODUCT ATTRIBUTE BADGE
   Highlighting technical features (e.g. 9H Hardness, Hydrophobic, Self-Healing)
   ========================================================================= */

export interface ProductAttributeBadgeProps {
  icon?: React.ReactNode;
  label: string;
  value: string;
  className?: string;
}

export const ProductAttributeBadge = ({
  icon,
  label,
  value,
  className = '',
}: ProductAttributeBadgeProps) => {
  return (
    <div
      className={`inline-flex items-center gap-2.5 px-3 py-2 bg-[#FAF8F6] border border-[#EFEDEB] rounded-[4px] ${className}`}
    >
      {icon && <span className="shrink-0 text-[#FF6A00]">{icon}</span>}
      <div className="flex flex-col text-left leading-tight">
        <span className="text-[10px] uppercase font-mono tracking-wider text-[#626262]">{label}</span>
        <span className="text-[12px] font-bold text-[#151515] font-mono">{value}</span>
      </div>
    </div>
  );
};

/* =========================================================================
   4. PRODUCT GALLERY THUMBNAIL
   State-driven thumbnail selector for multi-view automotive product galleries.
   ========================================================================= */

export interface ProductGalleryThumbnailProps {
  active?: boolean;
  src?: string;
  label?: string;
  onClick?: () => void;
  className?: string;
}

export const ProductGalleryThumbnail = ({
  active = false,
  src,
  label = 'View',
  onClick,
  className = '',
}: ProductGalleryThumbnailProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-16 h-16 rounded-[4px] border overflow-hidden p-1.5 bg-[#FAF8F6] transition-all cursor-pointer flex items-center justify-center shrink-0 ${
        active
          ? 'border-[#FF6A00] ring-2 ring-[#FF6A00]/20 bg-white'
          : 'border-[#EFEDEB] hover:border-[#D8D5D0]'
      } ${className}`}
    >
      {src ? (
        <img src={src} alt={label} className="w-full h-full object-contain" />
      ) : (
        <span className="text-[10px] font-mono text-[#626262] uppercase">{label}</span>
      )}
    </button>
  );
};

/* =========================================================================
   5. PRODUCT RELATED ITEM
   Compact horizontal card for cross-sells or related category items.
   ========================================================================= */

export interface ProductRelatedItemProps {
  title: string;
  category: string;
  onClick?: () => void;
  className?: string;
}

export const ProductRelatedItem = ({
  title,
  category,
  onClick,
  className = '',
}: ProductRelatedItemProps) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between p-3 bg-white border border-[#EFEDEB] rounded-[4px] hover:border-[#D8D5D0] cursor-pointer transition-colors ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-[3px] bg-[#FAF8F6] border border-[#EFEDEB] flex items-center justify-center shrink-0">
          <DropletIcon size={18} color="brandOrange" />
        </div>
        <div>
          <span className="text-[10px] font-mono uppercase text-[#626262] block">{category}</span>
          <h5 className="text-[13px] font-semibold text-[#151515] leading-tight">{title}</h5>
        </div>
      </div>
      <div className="flex items-center gap-2 pl-3">
        <ChevronRightIcon size={14} color="muted" />
      </div>
    </div>
  );
};
