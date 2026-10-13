'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TrionyxLogo } from '../ui/TrionyxLogo';
import { ProductsMegaMenu } from './ProductsMegaMenu';
import styles from './HeaderShell.module.css';

export interface HeaderShellProps {
  /** `overlay` sits transparently over a full-bleed hero until the page scrolls. */
  appearance?: 'default' | 'overlay';
}

const links = [
  { href: '/installer-network', label: 'Installer Network' },
  { href: '/warranty', label: 'Warranty' },
  { href: '/#about', label: 'About' },
];

const productLinks = [
  { href: '/products/ceramic-coating', label: 'Ceramic Coating' },
  { href: '/products/graphene-coating', label: 'Graphene Coating' },
  { href: '/products/borophene-coating', label: 'Borophene Coating' },
];

export const HeaderShell = ({ appearance = 'default' }: HeaderShellProps = {}) => {
  const pathname = usePathname();
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const productsButtonRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isActive = (href: string) => href !== '/#about' && (pathname === href || pathname.startsWith(`${href}/`));
  const closeAll = () => {
    setIsProductsOpen(false);
    setMobileMenuOpen(false);
  };

  // Forgiving hover so the pointer can travel from the trigger into the menu.
  const openProducts = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setIsProductsOpen(true);
  };
  const scheduleCloseProducts = () => {
    closeTimeoutRef.current = setTimeout(() => setIsProductsOpen(false), 220);
  };

  useEffect(() => {
    if (!isProductsOpen && !mobileMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (isProductsOpen) productsButtonRef.current?.focus();
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
  }, [isProductsOpen, mobileMenuOpen]);

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

        <nav className={styles.desktopNav} aria-label="Main navigation">
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
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${isActive(link.href) ? styles.active : ''}`}
              aria-current={isActive(link.href) ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}
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
            {links.map((link) => (
              <Link key={link.href} href={link.href} className={styles.mobileLink} onClick={closeAll}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};
