/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { Button } from '../ui/Button';
import { ArrowRightIcon, ChevronRightIcon, ShieldCheckIcon, EyeIcon } from '../ui/Icons';

/* =========================================================================
   1. PRODUCT CARD
   Purpose-built for automotive product discovery and enquiry.
   Not an ecommerce card: No price, SKU, stock/availability, discount,
   ratings, add-to-cart, or commerce badges.
   Hierarchy:
     1. Product Image (dominant element with generous whitespace)
     2. Product Name
     3. Optional Product Category (when not established by surrounding page)
     4. View Product action
   ========================================================================= */

export interface ProductCardProps {
  name: string;
  category?: string;
  imageUrl?: string;
  imageAlt?: string;
  onViewProduct?: () => void;
  className?: string;
}

export const ProductCard = ({
  name,
  category,
  imageUrl,
  imageAlt,
  onViewProduct,
  className = '',
}: ProductCardProps) => {
  return (
    <div
      onClick={onViewProduct}
      className={`group flex flex-col bg-white border border-[#EFEDEB] rounded-[4px] p-4 transition-all duration-200 hover:border-[#D8D5D0] cursor-pointer ${className}`}
    >
      {/* 1. Dominant Product Image Frame with Generous Whitespace */}
      <div className="relative w-full aspect-[4/3] bg-[#FAF8F6] rounded-[2px] flex items-center justify-center p-8 overflow-hidden transition-colors group-hover:bg-[#F5F3F0]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={imageAlt || name}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-[#626262] transition-transform duration-300 group-hover:scale-[1.03]">
            <div className="w-16 h-16 rounded-full bg-white border border-[#EFEDEB] flex items-center justify-center shadow-xs">
              <ShieldCheckIcon size={30} color="brandOrange" strokeWidth={1.5} />
            </div>
          </div>
        )}
      </div>

      {/* 2 & 3. Typography Hierarchy: Optional Category & Product Name */}
      <div className="pt-4 pb-2 flex flex-col">
        {category && (
          <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#626262] mb-1">
            {category}
          </span>
        )}
        <h3 className="text-[16px] font-semibold text-[#151515] leading-snug group-hover:text-[#FF6A00] transition-colors">
          {name}
        </h3>
      </div>

      {/* 4. Clean "View Product" Action */}
      <div className="mt-auto pt-2 flex items-center text-[13px] font-semibold text-[#151515] group-hover:text-[#FF6A00] transition-colors">
        <span>View Product</span>
        <ChevronRightIcon size={14} color="inherit" className="ml-1 transition-transform group-hover:translate-x-0.5" />
      </div>
    </div>
  );
};

/* =========================================================================
   2. PRODUCT CATEGORY CARD
   High-impact visual card for overarching lines (PPF, Ceramic, Lighting, etc.)
   ========================================================================= */

export interface ProductCategoryCardProps {
  title: string;
  productCount: number;
  description: string;
  featuredSpec: string;
  onClick?: () => void;
  className?: string;
}

export const ProductCategoryCard = ({
  title,
  productCount,
  description,
  featuredSpec,
  onClick,
  className = '',
}: ProductCategoryCardProps) => {
  return (
    <div
      onClick={onClick}
      className={`group relative p-6 bg-white border border-[#EFEDEB] rounded-[6px] transition-all duration-200 hover:border-[#FF6A00] hover:shadow-[0_4px_20px_rgba(21,21,21,0.06)] cursor-pointer flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#626262] bg-[#FAF8F6] px-2.5 py-1 rounded-[3px] border border-[#EFEDEB]">
            {productCount} Products
          </span>
          <span className="text-[11px] font-mono uppercase text-[#FF6A00] font-semibold">
            {featuredSpec}
          </span>
        </div>
        <h3 className="text-[20px] font-bold text-[#151515] group-hover:text-[#FF6A00] transition-colors">
          {title}
        </h3>
        <p className="text-[13px] text-[#626262] mt-2 leading-relaxed">{description}</p>
      </div>

      <div className="mt-6 pt-4 border-t border-[#EFEDEB] flex items-center justify-between">
        <span className="text-[13px] font-semibold text-[#151515] group-hover:text-[#FF6A00] transition-colors">
          Explore Series
        </span>
        <div className="w-8 h-8 rounded-[4px] bg-[#FAF8F6] border border-[#EFEDEB] flex items-center justify-center group-hover:bg-[#FF6A00] group-hover:border-[#FF6A00] group-hover:text-white transition-all">
          <ChevronRightIcon size={16} color="inherit" />
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   3. MEDIA CARD
   Automotive photography, video frames, technical showcase media.
   ========================================================================= */

export interface MediaCardProps {
  title: string;
  category: string;
  durationOrDate?: string;
  aspectRatio?: 'video' | 'square' | 'wide';
  onClick?: () => void;
  className?: string;
}

export const MediaCard = ({
  title,
  category,
  durationOrDate,
  aspectRatio = 'video',
  onClick,
  className = '',
}: MediaCardProps) => {
  const ratioStyles = {
    video: 'aspect-[16/9]',
    square: 'aspect-square',
    wide: 'aspect-[21/9]',
  }[aspectRatio];

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-[6px] border border-[#EFEDEB] bg-[#FAF8F6] cursor-pointer transition-all hover:border-[#D8D5D0] ${className}`}
    >
      <div className={`relative w-full ${ratioStyles} flex items-center justify-center bg-[#151515] overflow-hidden`}>
        {/* Dark subtle overlay with automotive technical lines */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#EFEDEB_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="z-10 flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <EyeIcon size={20} color="inverse" />
          </div>
          <span className="text-[11px] font-mono tracking-widest text-white/80 uppercase">
            TRIONYX MEDIA
          </span>
        </div>
      </div>

      <div className="p-4 bg-white border-t border-[#EFEDEB] flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6A00] block">
            {category}
          </span>
          <h4 className="text-[14px] font-semibold text-[#151515] mt-0.5">{title}</h4>
        </div>
        {durationOrDate && (
          <span className="text-[11px] font-mono text-[#626262] shrink-0">{durationOrDate}</span>
        )}
      </div>
    </div>
  );
};

/* =========================================================================
   4. INFORMATION CARD
   Technical specifications, lab certifications, warranty standards.
   ========================================================================= */

export interface InfoCardProps {
  label: string;
  metric: string;
  description: string;
  subtext?: string;
  className?: string;
}

export const InfoCard = ({
  label,
  metric,
  description,
  subtext,
  className = '',
}: InfoCardProps) => {
  return (
    <div
      className={`p-5 bg-white border border-[#EFEDEB] rounded-[6px] transition-all hover:border-[#D8D5D0] ${className}`}
    >
      <span className="text-[11px] font-mono uppercase tracking-wider text-[#626262] block">
        {label}
      </span>
      <div className="text-[28px] font-bold text-[#151515] font-mono tracking-tight my-1.5">
        {metric}
      </div>
      <p className="text-[13px] text-[#2A2A2A] leading-relaxed">{description}</p>
      {subtext && (
        <span className="text-[11px] text-[#626262] mt-3 block pt-2 border-t border-[#EFEDEB]">
          {subtext}
        </span>
      )}
    </div>
  );
};

/* =========================================================================
   5. FEATURE CARD
   Precision technical benefits with clean iconography.
   ========================================================================= */

export interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  className?: string;
}

export const FeatureCard = ({
  icon,
  title,
  description,
  badge,
  className = '',
}: FeatureCardProps) => {
  return (
    <div
      className={`p-6 bg-white border border-[#EFEDEB] rounded-[6px] transition-all hover:border-[#D8D5D0] hover:shadow-[0_2px_12px_rgba(21,21,21,0.04)] ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-[4px] bg-[#FAF8F6] border border-[#EFEDEB] flex items-center justify-center">
          {icon}
        </div>
        {badge && (
          <span className="text-[10px] font-mono uppercase font-semibold text-[#FF6A00] bg-[#FFF7ED] px-2 py-0.5 rounded-[2px] border border-[#FFEDD5]">
            {badge}
          </span>
        )}
      </div>
      <h4 className="text-[16px] font-semibold text-[#151515]">{title}</h4>
      <p className="text-[13px] text-[#626262] mt-2 leading-relaxed">{description}</p>
    </div>
  );
};

/* =========================================================================
   6. ARTICLE / CONTENT CARD
   Technical installation guides, case studies, product release notes.
   ========================================================================= */

export interface ArticleCardProps {
  category: string;
  date: string;
  readTime: string;
  title: string;
  excerpt: string;
  onClick?: () => void;
  className?: string;
}

export const ArticleCard = ({
  category,
  date,
  readTime,
  title,
  excerpt,
  onClick,
  className = '',
}: ArticleCardProps) => {
  return (
    <article
      onClick={onClick}
      className={`group p-5 bg-white border border-[#EFEDEB] rounded-[6px] transition-all duration-150 hover:border-[#D8D5D0] cursor-pointer flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-[#626262] mb-2">
          <span className="text-[#FF6A00] font-semibold uppercase">{category}</span>
          <span>•</span>
          <span>{date}</span>
          <span>•</span>
          <span>{readTime}</span>
        </div>
        <h3 className="text-[16px] font-bold text-[#151515] leading-snug group-hover:text-[#FF6A00] transition-colors">
          {title}
        </h3>
        <p className="text-[13px] text-[#626262] mt-2 line-clamp-2 leading-relaxed">{excerpt}</p>
      </div>
      <div className="mt-4 pt-3 border-t border-[#EFEDEB] flex items-center text-[13px] font-semibold text-[#151515] group-hover:text-[#FF6A00] transition-colors">
        <span>Read Technical Guide</span>
        <ArrowRightIcon size={14} color="inherit" className="ml-1.5 transition-transform group-hover:translate-x-0.5" />
      </div>
    </article>
  );
};

/* =========================================================================
   7. CONTACT / ENQUIRY CARD
   Dealer application, wholesale distribution, technical support.
   ========================================================================= */

export interface ContactCardProps {
  title: string;
  description: string;
  buttonText: string;
  onAction?: () => void;
  supportNote?: string;
  className?: string;
}

export const ContactCard = ({
  title,
  description,
  buttonText,
  onAction,
  supportNote,
  className = '',
}: ContactCardProps) => {
  return (
    <div
      className={`p-6 bg-[#FAF8F6] border border-[#EFEDEB] rounded-[6px] flex flex-col justify-between ${className}`}
    >
      <div>
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#FF6A00] font-semibold block mb-1">
          Dealer & Certified Installer Network
        </span>
        <h3 className="text-[18px] font-bold text-[#151515]">{title}</h3>
        <p className="text-[13px] text-[#626262] mt-2 leading-relaxed">{description}</p>
      </div>
      <div className="mt-6">
        <Button variant="secondary" size="md" onClick={onAction} fullWidth>
          {buttonText}
        </Button>
        {supportNote && (
          <p className="text-[11px] text-center text-[#626262] mt-2.5 font-mono">{supportNote}</p>
        )}
      </div>
    </div>
  );
};
