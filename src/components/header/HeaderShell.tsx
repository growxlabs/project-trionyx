'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { TrionyxLogo } from '../ui/TrionyxLogo';
import { NavLink } from '../navigation';
import { Button } from '../ui/Button';
import { ProductsMegaMenu } from './ProductsMegaMenu';
import { MenuIcon, CloseIcon, ChevronDownIcon } from '../ui/Icons';

export const HeaderShell = () => {
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);

  const productsButtonRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Forgiving hover interaction
  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsProductsOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsProductsOpen(false);
    }, 220); // Safe transition buffer
  };

  const toggleProducts = () => {
    setIsProductsOpen((prev) => !prev);
  };

  // Keyboard navigation & outside click handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isProductsOpen) {
        setIsProductsOpen(false);
        productsButtonRef.current?.focus();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setIsProductsOpen(false);
      }
    };

    if (isProductsOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProductsOpen]);

  return (
    <>
      <header
        ref={headerRef}
        className="sticky top-0 z-50 w-full bg-[#F5F5EE]/90 lg:bg-transparent border-b border-[rgba(23,23,20,0.07)] transition-colors"
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Official Brand Logo */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center group py-1"
              aria-label="Trionyx Home"
              onClick={() => setIsProductsOpen(false)}
            >
              <TrionyxLogo size="md" />
            </Link>
          </div>

          {/* 
            MAIN DESKTOP NAVIGATION
            - Products (Mega Menu Trigger)
            - Installer Network
            - About
          */}
          <nav className="hidden md:flex items-center gap-1.5" aria-label="Main Navigation">
            {/* Products Interaction Trigger */}
            <div
              className="relative inline-flex items-center"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                ref={productsButtonRef}
                type="button"
                onClick={toggleProducts}
                aria-expanded={isProductsOpen}
                aria-haspopup="true"
                aria-controls="products-mega-menu"
                className={`text-[14px] font-medium transition-colors duration-150 inline-flex items-center gap-1.5 py-2 px-3 rounded-[3px] cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-[#F26522] ${
                  isProductsOpen
                    ? 'text-[#F26522] font-semibold bg-[#EFECE3]'
                    : 'text-[#171714] hover:text-[#171714] hover:bg-[#EFECE3]'
                }`}
              >
                <span>Products</span>
                <ChevronDownIcon
                  size={14}
                  color={isProductsOpen ? 'brandOrange' : 'default'}
                  className={`transition-transform duration-200 ${
                    isProductsOpen ? 'rotate-180 text-[#F26522]' : ''
                  }`}
                />
              </button>
            </div>

            <NavLink href="/installer-network">Installer Network</NavLink>
            <NavLink href="/about">About</NavLink>
          </nav>

          {/* 
            RIGHT UTILITY & ACTIONS CLUSTER
            - Contact: Restrained neutral secondary action
            - Dealer Access: Visually distinct primary utility action (concentrated orange)
          */}
          <div className="hidden sm:flex items-center gap-3">
            <Link href="/contact" tabIndex={-1}>
              <Button variant="outline" size="sm">
                Contact
              </Button>
            </Link>
            <Link href="/dealer-access" tabIndex={-1}>
              <Button
                variant="primary"
                size="sm"
              >
                Dealer Access
              </Button>
            </Link>
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link href="/dealer-access" tabIndex={-1} className="sm:hidden">
              <Button variant="primary" size="sm">
                Dealer Access
              </Button>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              className="w-10 h-10 rounded-[4px] border border-[rgba(23,23,20,0.12)] bg-[#F5F5EE] flex items-center justify-center text-[#171714] hover:bg-[#EFECE3] transition-colors"
            >
              {mobileMenuOpen ? <CloseIcon size={18} /> : <MenuIcon size={18} />}
            </button>
          </div>
        </div>

        {/* 
          DESKTOP PRODUCTS MEGA MENU PANEL
          Attaches directly underneath the header using Elevated Surface (#FCFBF7)
        */}
        <ProductsMegaMenu
          isOpen={isProductsOpen}
          onClose={() => setIsProductsOpen(false)}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />

        {/* MOBILE EXPANDABLE MENU */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[rgba(23,23,20,0.07)] bg-[#F5F5EE] px-6 py-5 shadow-[0_12px_24px_rgba(23,23,20,0.04)] animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex flex-col space-y-1">
              {/* Products Expandable Group */}
              <div>
                <button
                  type="button"
                  onClick={() => setMobileProductsOpen(!mobileProductsOpen)}
                  className="w-full flex items-center justify-between py-2.5 px-3 rounded-[3px] text-[15px] font-semibold text-[#171714] hover:bg-[#EFECE3] transition-colors"
                >
                  <span>Products</span>
                  <ChevronDownIcon
                    size={16}
                    color={mobileProductsOpen ? 'brandOrange' : 'default'}
                    className={`transition-transform duration-200 ${
                      mobileProductsOpen ? 'rotate-180 text-[#F26522]' : 'text-[#171714]'
                    }`}
                  />
                </button>

                {mobileProductsOpen && (
                  <div className="pl-4 pr-2 py-2 space-y-1 border-l-2 border-[#F26522]/40 ml-4 mt-1 mb-2">
                    <Link
                      href="/products/ceramic-coating"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-[14px] font-medium text-[#171714] hover:text-[#F26522] transition-colors"
                    >
                      Ceramic Coating
                    </Link>
                    <Link
                      href="/products/graphene-coating"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-[14px] font-medium text-[#171714] hover:text-[#F26522] transition-colors"
                    >
                      Graphene Coating
                    </Link>
                    <Link
                      href="/products/borophene-coating"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-[14px] font-medium text-[#171714] hover:text-[#F26522] transition-colors"
                    >
                      Borophene Coating
                    </Link>
                    <Link
                      href="/products"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1.5 text-[12px] font-mono font-semibold uppercase text-[#F26522] mt-1"
                    >
                      All Products →
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href="/installer-network"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-[3px] text-[15px] font-medium text-[#171714] hover:bg-[#EFECE3] hover:text-[#171714] transition-colors"
              >
                Installer Network
              </Link>

              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-[3px] text-[15px] font-medium text-[#171714] hover:bg-[#EFECE3] hover:text-[#171714] transition-colors"
              >
                About
              </Link>

              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-[3px] text-[15px] font-medium text-[#171714] hover:bg-[#EFECE3] hover:text-[#171714] transition-colors"
              >
                Contact
              </Link>
            </div>

            <div className="mt-5 pt-4 border-t border-[rgba(23,23,20,0.07)] flex flex-col gap-2.5">
              <Link href="/dealer-access" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                >
                  Dealer Access
                </Button>
              </Link>
              <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <Button variant="outline" size="md" fullWidth>
                  Contact Trionyx
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 
        SUBTLE BACKDROP TREATMENT
        De-emphasizes underlying page content while mega menu is open without heavily darkening it
      */}
      {isProductsOpen && (
        <div
          className="fixed inset-0 top-20 bg-[#171714]/[0.05] backdrop-blur-[2px] transition-opacity duration-200 z-40 pointer-events-auto"
          onClick={() => setIsProductsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};
