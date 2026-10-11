'use client';

import React from 'react';
import Link from 'next/link';

export interface ProductsMegaMenuProps {
  isOpen: boolean;
  appearance?: 'default' | 'overlay';
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

// Confirmed Trionyx product categories
const CONFIRMED_PRODUCTS = [
  { name: 'Ceramic Coating', href: '/products/ceramic-coating' },
  { name: 'Graphene Coating', href: '/products/graphene-coating' },
  { name: 'Borophene Coating', href: '/products/borophene-coating' },
];

export const ProductsMegaMenu: React.FC<ProductsMegaMenuProps> = ({
  isOpen,
  appearance = 'default',
  onClose,
  onMouseEnter,
  onMouseLeave,
}) => {
  if (!isOpen) return null;

  const isOverlay = appearance === 'overlay';

  return (
    <div
      id="products-mega-menu"
      role="region"
      aria-label="Products"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute top-full left-0 pt-2 z-50 hidden md:block animate-in fade-in slide-in-from-top-1 duration-150"
    >
      <div
        className={`w-56 rounded-[4px] py-1.5 px-1 shadow-xl transition-all duration-150 ${
          isOverlay
            ? 'bg-[#121418]/95 backdrop-blur-md border border-[rgba(255,255,255,0.14)] shadow-[0_12px_32px_rgba(0,0,0,0.5)]'
            : 'bg-[#FFFFEB] border border-[rgba(23,23,20,0.1)] shadow-[0_10px_25px_rgba(23,23,20,0.08)]'
        }`}
      >
        <ul className="space-y-0.5">
          {CONFIRMED_PRODUCTS.map((product) => (
            <li key={product.name}>
              <Link
                href={product.href}
                onClick={onClose}
                className={`flex items-center justify-between px-3 py-2 rounded-[3px] text-[13.5px] font-medium transition-colors duration-150 ${
                  isOverlay
                    ? '!text-[#FCFBF7] hover:!text-[#FF985F] hover:bg-[rgba(255,255,255,0.08)]'
                    : '!text-[#171714] hover:!text-[#F26522] hover:bg-[#EFECE3]'
                }`}
              >
                <span>{product.name}</span>
              </Link>
            </li>
          ))}
          <li
            className={`pt-1 mt-1 border-t ${
              isOverlay
                ? 'border-[rgba(255,255,255,0.1)]'
                : 'border-[rgba(23,23,20,0.08)]'
            }`}
          >
            <Link
              href="/products"
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2 rounded-[3px] text-[12.5px] font-semibold transition-colors duration-150 ${
                isOverlay
                  ? '!text-[#FF985F] hover:!text-[#FFB288] hover:bg-[rgba(255,255,255,0.08)]'
                  : '!text-[#B84817] hover:!text-[#F26522] hover:bg-[#EFECE3]'
              }`}
            >
              <span>All Products</span>
              <span aria-hidden="true" className="text-[12px]">→</span>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

