'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TrionyxLogo } from '../ui/TrionyxLogo';
import { ProductsMegaMenu } from './ProductsMegaMenu';
import { ExploreDropdown, exploreLinks } from './ExploreDropdown';
import styles from './HeaderShell.module.css';

export interface HeaderShellProps {
  /** `overlay` sits transparently over a full-bleed hero until the page scrolls. */
  appearance?: 'default' | 'overlay';
}

const productLinks = [
  { href: '/products/ceramic-coating', label: 'Ceramic Coating' },
  { href: '/products/graphene-coating', label: 'Graphene Coating' },
  { href: '/products/borophene-coating', label: 'Borophene Coating' },
];

export const HeaderShell = ({ appearance = 'default' }: HeaderShellProps = {}) => {
  const pathname = usePathname();
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const productsButtonRef = useRef<HTMLButtonElement>(null);
  const exploreButtonRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const closeProductsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeExploreTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isActive = (href: string) => href !== '/#about' && (pathname === href || pathname.startsWith(`${href}/`));
  const isExploreActive = pathname === '/blog' || pathname.startsWith('/blog/') || pathname === '/gallery' || pathname.startsWith('/gallery/');

  const closeAll = () => {
    setIsProductsOpen(false);
    setIsExploreOpen(false);
    setMobileMenuOpen(false);
  };

  // Hover handlers for Products dropdown
  const openProducts = () => {
    if (closeProductsTimeoutRef.current) clearTimeout(closeProductsTimeoutRef.current);
    setIsProductsOpen(true);
  };
  const scheduleCloseProducts = () => {
    closeProductsTimeoutRef.current = setTimeout(() => setIsProductsOpen(false), 220);
  };

  // Hover handlers for Explore dropdown
  const openExplore = () => {
    if (closeExploreTimeoutRef.current) clearTimeout(closeExploreTimeoutRef.current);
    setIsExploreOpen(true);
  };
  const scheduleCloseExplore = () => {
    closeExploreTimeoutRef.current = setTimeout(() => setIsExploreOpen(false), 220);
  };

  useEffect(() => {
    if (!isProductsOpen && !isExploreOpen && !mobileMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (isProductsOpen) productsButtonRef.current?.focus();
      if (isExploreOpen) exploreButtonRef.current?.focus();
      closeAll();
    };
    const onPointerDown = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) closeAll();
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [isProductsOpen, isExploreOpen, mobileMenuOpen]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const transparent = appearance === 'overlay' && !isScrolled && !mobileMenuOpen;

  return (
    <header
      ref={headerRef}
      className={`${styles.header} ${appearance === 'overlay' ? styles.overlay : ''} ${transparent ? styles.transparent : ''}`}
    >
      <div className={`site-container ${styles.inner}`}>
        <Link href="/" className={styles.brand} aria-label="Trionyx home" onClick={closeAll}>
          <TrionyxLogo variant="light" size="md" className={styles.logo} />
        </Link>

        {/* Final Navigation: Products | Distributors | Warranty | Explore | About */}
        <nav className={styles.desktopNav} aria-label="Main navigation">
          {/* 1. Products */}
          <div className={styles.productsTrigger} onMouseEnter={openProducts} onMouseLeave={scheduleCloseProducts}>
            <button
              ref={productsButtonRef}
              type="button"
              className={`${styles.navLink} ${isProductsOpen || pathname.startsWith('/products') ? styles.active : ''}`}
              aria-expanded={isProductsOpen}
              aria-haspopup="true"
              aria-controls="products-mega-menu"
              onClick={() => setIsProductsOpen((open) => !open)}
            >
              Products
              <svg className={`${styles.chevron} ${isProductsOpen ? styles.chevronOpen : ''}`} viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
                <path d="M3 4.5 6 7.5l3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <ProductsMegaMenu
              isOpen={isProductsOpen}
              links={productLinks}
              onClose={() => setIsProductsOpen(false)}
              onMouseEnter={openProducts}
              onMouseLeave={scheduleCloseProducts}
            />
          </div>

          {/* 2. Distributors */}
          <Link
            href="/distributors"
            className={`${styles.navLink} ${isActive('/distributors') ? styles.active : ''}`}
            aria-current={isActive('/distributors') ? 'page' : undefined}
          >
            Distributors
          </Link>

          {/* 3. Warranty */}
          <Link
            href="/warranty"
            className={`${styles.navLink} ${isActive('/warranty') ? styles.active : ''}`}
            aria-current={isActive('/warranty') ? 'page' : undefined}
          >
            Warranty
          </Link>

          {/* 4. Explore */}
          <div className={styles.productsTrigger} onMouseEnter={openExplore} onMouseLeave={scheduleCloseExplore}>
            <button
              ref={exploreButtonRef}
              type="button"
              className={`${styles.navLink} ${isExploreOpen || isExploreActive ? styles.active : ''}`}
              aria-expanded={isExploreOpen}
              aria-haspopup="true"
              aria-controls="explore-dropdown-menu"
              onClick={() => setIsExploreOpen((open) => !open)}
            >
              Explore
              <svg className={`${styles.chevron} ${isExploreOpen ? styles.chevronOpen : ''}`} viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
                <path d="M3 4.5 6 7.5l3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <ExploreDropdown
              isOpen={isExploreOpen}
              onClose={() => setIsExploreOpen(false)}
              onMouseEnter={openExplore}
              onMouseLeave={scheduleCloseExplore}
            />
          </div>

          {/* 5. About */}
          <Link
            href="/#about"
            className={`${styles.navLink} ${isActive('/#about') ? styles.active : ''}`}
          >
            About
          </Link>
        </nav>

        <button
          type="button"
          className={styles.menuToggle}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          {mobileMenuOpen ? 'Close' : 'Menu'}
        </button>
      </div>

      {mobileMenuOpen && (
        <div id="mobile-menu" className={styles.mobileMenu}>
          <nav className="site-container" aria-label="Mobile navigation">
            <p className={styles.mobileGroupLabel}>Products</p>
            {productLinks.map((link) => (
              <Link key={link.href} href={link.href} className={`${styles.mobileLink} ${styles.mobileSubLink}`} onClick={closeAll}>
                {link.label}
              </Link>
            ))}
            <Link href="/products" className={`${styles.mobileLink} ${styles.mobileSubLink}`} onClick={closeAll}>
              All Products
            </Link>

            <Link href="/distributors" className={styles.mobileLink} onClick={closeAll}>
              Distributors
            </Link>
            <Link href="/warranty" className={styles.mobileLink} onClick={closeAll}>
              Warranty
            </Link>

            <p className={styles.mobileGroupLabel}>Explore</p>
            {exploreLinks.map((link) => (
              <Link key={link.href} href={link.href} className={`${styles.mobileLink} ${styles.mobileSubLink}`} onClick={closeAll}>
                {link.label}
              </Link>
            ))}

            <Link href="/#about" className={styles.mobileLink} onClick={closeAll}>
              About
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
