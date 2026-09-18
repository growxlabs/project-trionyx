'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRightIcon } from '../ui/Icons';

export interface ProductsMegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

// ONLY confirmed Trionyx products — strictly NO invented products or placeholders
const CONFIRMED_PRODUCTS = [
  {
    name: 'Ceramic Coating',
    href: '/products/ceramic-coating',
  },
  {
    name: 'Graphene Coating',
    href: '/products/graphene-coating',
  },
  {
    name: 'Borophene Coating',
    href: '/products/borophene-coating',
  },
];

export const ProductsMegaMenu: React.FC<ProductsMegaMenuProps> = ({
  isOpen,
  onClose,
  onMouseEnter,
  onMouseLeave,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="products-mega-menu"
      role="region"
      aria-label="Products Mega Menu"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute top-full left-0 right-0 w-full bg-[#F5F5EE] border-b border-[rgba(23,23,20,0.07)] shadow-[0_20px_40px_rgba(23,23,20,0.04)] z-50 animate-in fade-in slide-in-from-top-1 duration-150"
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        {/* Strict 3-Column Architecture with Generous Whitespace & Subtle Separators */}
        <div className="grid grid-cols-12 gap-6 lg:gap-8">
          
          {/* COLUMN 1: PRODUCTS (Confirmed Coatings) */}
          <div className="col-span-5 pr-6 lg:pr-8 border-r border-[rgba(23,23,20,0.07)]">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F26522]" aria-hidden="true" />
              <span className="text-[11px] font-mono font-bold tracking-[0.14em] uppercase text-[#68665F]">
                PRODUCTS
              </span>
            </div>

            <ul className="space-y-4" role="menu" aria-label="Confirmed Products">
              {CONFIRMED_PRODUCTS.map((product) => (
                <li key={product.name} role="none">
                  <Link
                    href={product.href}
                    onClick={onClose}
                    role="menuitem"
                    className="group flex items-center justify-between py-1 text-[15px] font-semibold text-[#171714] hover:text-[#F26522] transition-colors cursor-pointer outline-none focus-visible:text-[#F26522] focus-visible:underline"
                  >
                    <span>{product.name}</span>
                    <ChevronRightIcon
                      size={14}
                      color="muted"
                      className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-[#F26522] transition-all"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 2: EXPLORE (Catalog Entry Point) */}
          <div className="col-span-3 pr-6 lg:pr-8 border-r border-[rgba(23,23,20,0.07)]">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-[11px] font-mono font-bold tracking-[0.14em] uppercase text-[#68665F]">
                EXPLORE
              </span>
            </div>

            <ul className="space-y-4" role="menu" aria-label="Explore Catalog">
              <li role="none">
                <Link
                  href="/products"
                  onClick={onClose}
                  role="menuitem"
                  className="group flex items-center justify-between py-1 text-[15px] font-semibold text-[#171714] hover:text-[#F26522] transition-colors cursor-pointer outline-none focus-visible:text-[#F26522] focus-visible:underline"
                >
                  <span>All Products</span>
                  <ChevronRightIcon
                    size={14}
                    color="muted"
                    className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-[#F26522] transition-all"
                  />
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: PARTNER ACCESS (Network & Commercial Channels) */}
          <div className="col-span-4 pl-2 lg:pl-4">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-[11px] font-mono font-bold tracking-[0.14em] uppercase text-[#68665F]">
                PARTNER ACCESS
              </span>
            </div>

            <ul className="space-y-4" role="menu" aria-label="Partner Access">
              <li role="none">
                <Link
                  href="/installer-network"
                  onClick={onClose}
                  role="menuitem"
                  className="group flex items-center justify-between py-1 text-[15px] font-semibold text-[#171714] hover:text-[#F26522] transition-colors cursor-pointer outline-none focus-visible:text-[#F26522] focus-visible:underline"
                >
                  <span>Installer Network</span>
                  <ChevronRightIcon
                    size={14}
                    color="muted"
                    className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-[#F26522] transition-all"
                  />
                </Link>
              </li>
              <li role="none">
                <Link
                  href="/dealer-access"
                  onClick={onClose}
                  role="menuitem"
                  className="group flex items-center justify-between py-1 text-[15px] font-semibold text-[#171714] hover:text-[#F26522] transition-colors cursor-pointer outline-none focus-visible:text-[#F26522] focus-visible:underline"
                >
                  <span>Dealer Access</span>
                  <ChevronRightIcon
                    size={14}
                    color="muted"
                    className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-[#F26522] transition-all"
                  />
                </Link>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};
