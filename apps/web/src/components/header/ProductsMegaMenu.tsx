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

// Only confirmed Trionyx product categories belong in this navigation menu.
const CONFIRMED_PRODUCTS = [
  { name: 'Ceramic Coating', href: '/products/ceramic-coating' },
  { name: 'Graphene Coating', href: '/products/graphene-coating' },
  { name: 'Borophene Coating', href: '/products/borophene-coating' },
];

const productLinkClass =
  'group flex min-h-10 items-center justify-between py-1 text-[15px] font-medium text-[#171714] transition-colors duration-150 hover:text-[#F26522] focus-visible:text-[#F26522] focus-visible:outline-none focus-visible:underline';

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
      aria-label="Products"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute top-full left-0 right-0 z-50 hidden border-b border-[rgba(23,23,20,0.08)] bg-[#F7F6F0] md:block animate-in fade-in slide-in-from-top-1 duration-150"
    >
      <div className="w-full px-4 py-5 sm:px-6 lg:px-8">
        <nav className="max-w-[560px]" aria-label="Product navigation">
          <p className="mb-2 text-[10px] font-mono font-bold tracking-[0.15em] text-[#77746C]">
            PRODUCTS
          </p>

          <ul className="divide-y divide-[rgba(23,23,20,0.045)]">
            {CONFIRMED_PRODUCTS.map((product) => (
              <li key={product.name}>
                <Link href={product.href} onClick={onClose} className={productLinkClass}>
                  <span>{product.name}</span>
                  <ChevronRightIcon
                    size={14}
                    color="muted"
                    className="-translate-x-1 opacity-0 transition-all duration-150 group-hover:translate-x-0 group-hover:text-[#F26522] group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                  />
                </Link>
              </li>
            ))}
            <li className="mt-1 border-t border-[rgba(23,23,20,0.07)] pt-1">
              <Link
                href="/products"
                onClick={onClose}
                className="group flex min-h-10 items-center justify-between py-1 text-[13px] font-semibold text-[#B84817] transition-colors duration-150 hover:text-[#F26522] focus-visible:outline-none focus-visible:underline"
              >
                <span>All Products</span>
                <ChevronRightIcon
                  size={13}
                  color="brandOrange"
                  className="transition-transform duration-150 group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5"
                />
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};
