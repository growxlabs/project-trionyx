'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { SafeUser } from '@trionyx/types';
import { formatRoleLabel } from '@trionyx/types';
import { useThemePreference } from './ThemeProvider';

interface SidebarProps {
  user: SafeUser;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { preference, setPreference } = useThemePreference();

  const roleLabel = formatRoleLabel(user.role);

  // User initials for compact avatar (e.g. "SM" for Sai Managing)
  const initials = user.name
    ? user.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'OP';

  // Close popup on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // Close popup on Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
      }
    }
    if (isUserMenuOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isUserMenuOpen]);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await fetch('/api/v1/internal/auth/logout', { method: 'POST' });
    } catch {
      // Proceed even on network error
    }
    router.push('/login');
    router.refresh();
  };

  // 7 Trionyx Sketch / Technical Line Icons (24x24 artboard, 1.75px stroke, rounded joints/caps)
  const navItems = [
    {
      name: 'Overview',
      href: '/overview',
      active: pathname === '/overview',
      // Control grid / dashboard telemetry panel (not generic home)
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 shrink-0"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="9" x2="9" y2="21" />
          <circle cx="6" cy="6" r="0.8" fill="currentColor" />
          <circle cx="12" cy="6" r="0.8" fill="currentColor" />
          <circle cx="18" cy="6" r="0.8" fill="currentColor" />
          <line x1="12" y1="13" x2="18" y2="13" />
          <line x1="12" y1="17" x2="16" y2="17" />
        </svg>
      ),
    },
    {
      name: 'Products',
      href: '/products',
      active: pathname.startsWith('/products'),
      // Formula bottle / coating chemistry bottle with volume strata
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 shrink-0"
        >
          <rect x="10" y="2" width="4" height="2.5" rx="0.5" />
          <line x1="11" y1="4.5" x2="11" y2="6.5" />
          <line x1="13" y1="4.5" x2="13" y2="6.5" />
          <path d="M7 6.5h10l1.5 3v10.5a2 2 0 0 1-2 2H7.5a2 2 0 0 1-2-2V9.5L7 6.5z" />
          <line x1="8" y1="11.5" x2="10.5" y2="11.5" />
          <line x1="8" y1="14.5" x2="11.5" y2="14.5" />
          <line x1="8" y1="17.5" x2="10.5" y2="17.5" />
          <path d="M11 16c1.5-0.8 3.5-0.8 5 0" />
        </svg>
      ),
    },
    {
      name: 'Inventory',
      href: '/inventory',
      active: pathname.startsWith('/inventory'),
      // Storage crate + discrete serial scan barcode tag
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 shrink-0"
        >
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <polyline points="3 8.5 12 12 21 8.5" />
          <line x1="12" y1="12" x2="12" y2="20" />
          <line x1="6" y1="14.5" x2="6" y2="17.5" />
          <line x1="8" y1="14.5" x2="8" y2="17.5" strokeWidth="2.4" />
          <line x1="10" y1="14.5" x2="10" y2="17.5" />
        </svg>
      ),
    },
    {
      name: 'Dealers',
      href: '/dealers',
      active: pathname.startsWith('/dealers'),
      // Authorized detailing studio storefront / applicator service bay
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 shrink-0"
        >
          <polygon points="3 8 6 3 18 3 21 8 3 8" />
          <rect x="4" y="8" width="16" height="13" rx="0.5" />
          <path d="M8 21v-7a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v7" />
          <line x1="10.5" y1="15.5" x2="13.5" y2="15.5" />
          <line x1="10.5" y1="18" x2="13.5" y2="18" />
        </svg>
      ),
    },
    {
      name: 'Distributors',
      href: '/distributors',
      active: pathname.startsWith('/distributors'),
      // Central hub node + routing transfer network
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 shrink-0"
        >
          <circle cx="12" cy="12" r="2.5" />
          <circle cx="5" cy="6" r="1.75" />
          <circle cx="19" cy="6" r="1.75" />
          <circle cx="12" cy="20" r="1.75" />
          <line x1="10" y1="10.5" x2="6.5" y2="7.5" />
          <line x1="14" y1="10.5" x2="17.5" y2="7.5" />
          <line x1="12" y1="14.5" x2="12" y2="18.25" />
        </svg>
      ),
    },
    ...(user.role !== 'DISTRIBUTOR'
      ? [
          {
            name: 'Warranty',
            href: '/warranty',
            active: pathname.startsWith('/warranty'),
            // Cryptographic certificate shield + checkmark + serial baseline
            icon: (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 shrink-0"
              >
                <path d="M12 2.5L4 6v6.5c0 5 3.5 8.5 8 9.5 4.5-1 8-4.5 8-9.5V6l-8-3.5z" />
                <polyline points="9 11.5 11.5 14 15.5 9.5" />
                <line x1="9" y1="17" x2="15" y2="17" />
              </svg>
            ),
          },
          {
            name: 'Enquiries',
            href: '/enquiries',
            active: pathname.startsWith('/enquiries'),
            // Commercial lead intake docket board + clamp
            icon: (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 shrink-0"
              >
                <path d="M9 3h6v2.5H9z" />
                <rect x="4" y="4.5" width="16" height="17" rx="1.5" />
                <line x1="8" y1="9.5" x2="16" y2="9.5" />
                <line x1="8" y1="13" x2="14" y2="13" />
                <line x1="8" y1="16.5" x2="12" y2="16.5" />
              </svg>
            ),
          },
        ]
      : []),
  ];

  return (
    <aside
      aria-label="Navigation Rail"
      className="hidden lg:flex w-[72px] shrink-0 bg-[#161616] min-h-screen h-screen sticky top-0 flex-col items-center justify-between pt-4 pb-4 select-none z-40"
    >
      {/* 1. TOP SECTION: Compact Trionyx Geometric Mark + Mode Badge */}
      <div className="flex flex-col items-center gap-1.5">
        <Link
          href="/overview"
          className="flex flex-col items-center gap-1 focus:outline-none group"
          title="Trionyx Operations Portal"
        >
          {/* Engineered Hexagonal X Emblem */}
          <div className="w-10 h-10 rounded-[4px] bg-[#1F1F1F] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[#F97316] group-hover:border-[rgba(249,115,22,0.4)] transition-colors">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-5 h-5 text-[#F97316]"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 20 6.8 20 17.2 12 22 4 17.2 4 6.8" stroke="currentColor" strokeWidth="1.5" />
              <line x1="8" y1="8" x2="16" y2="16" stroke="#FFFFFF" strokeWidth="2" />
              <line x1="16" y1="8" x2="8" y2="16" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          <span className="font-mono text-[9px] font-bold tracking-[0.14em] uppercase text-[#9CA3AF] px-1 py-0.2 rounded-[2px] bg-[#222222] border border-[rgba(255,255,255,0.08)]">
            OPS
          </span>
        </Link>
      </div>

      {/* 2. MAIN NAV ICON STACK (Gap 10px / space-y-2.5) */}
      <nav className="flex flex-col items-center gap-2.5 w-full px-3">
        {navItems.map((item) => (
          <div key={item.name} className="relative group flex items-center justify-center w-full">
            {/* Active Left Indicator Notch */}
            {item.active && (
              <span className="absolute left-[-12px] w-1 h-5 rounded-r bg-[#F97316]" />
            )}

            <Link
              href={item.href}
              className={`w-10 h-10 rounded-[4px] flex items-center justify-center transition-colors duration-150 ${
                item.active
                  ? 'bg-[rgba(255,255,255,0.08)] text-[#F97316]'
                  : 'text-[rgba(255,255,255,0.45)] hover:text-white hover:bg-[rgba(255,255,255,0.04)]'
              }`}
            >
              {item.icon}
            </Link>

            {/* Hover Tooltip (Appears to the right) */}
            <div className="absolute left-[calc(100%+12px)] px-2.5 py-1 bg-[#1E1E1E] text-white text-[11px] font-medium tracking-wide rounded-[3px] border border-[rgba(255,255,255,0.12)] shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50">
              {item.name}
            </div>
          </div>
        ))}
      </nav>

      {/* 3. BOTTOM SECTION: Theme/Settings + Operator Avatar Menu */}
      <div className="flex flex-col items-center gap-3 w-full px-3" ref={menuRef}>
        {/* Settings / Precision Calibration Control */}
        <div className="relative group flex items-center justify-center w-full">
          <button
            type="button"
            onClick={() => setPreference(preference === 'dark' ? 'light' : 'dark')}
            className="w-10 h-10 rounded-[4px] flex items-center justify-center text-[rgba(255,255,255,0.45)] hover:text-white hover:bg-[rgba(255,255,255,0.04)] transition-colors duration-150"
            title="Toggle Theme"
          >
            {/* Precision Caliper / Tuning Calibration Icon */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 shrink-0"
            >
              <line x1="4" y1="7" x2="20" y2="7" />
              <path d="M4 7V16a1 1 0 0 0 1 1h1.5" />
              <rect x="12" y="4" width="5" height="6" rx="0.5" />
              <path d="M12 10v6a1 1 0 0 0 1 1h1.5" />
              <line x1="8" y1="5" x2="8" y2="7" />
              <line x1="10" y1="5" x2="10" y2="7" />
              <line x1="18" y1="5" x2="18" y2="7" />
            </svg>
          </button>
          <div className="absolute left-[calc(100%+12px)] px-2.5 py-1 bg-[#1E1E1E] text-white text-[11px] font-medium tracking-wide rounded-[3px] border border-[rgba(255,255,255,0.12)] shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50">
            Theme: {preference === 'dark' ? 'Dark' : 'Light'}
          </div>
        </div>

        {/* Operator Avatar Button */}
        <div className="relative group flex items-center justify-center w-full">
          <button
            type="button"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            aria-expanded={isUserMenuOpen}
            aria-label="User Account Menu"
            className="w-10 h-10 rounded-[4px] bg-[#222222] border border-[rgba(255,255,255,0.12)] text-[#F3F4F6] text-[12px] font-mono font-bold flex items-center justify-center hover:border-[#F97316] hover:text-[#F97316] transition-colors duration-150 cursor-pointer"
          >
            {initials}
          </button>

          {/* Hover Tooltip (Only visible when menu is closed) */}
          {!isUserMenuOpen && (
            <div className="absolute left-[calc(100%+12px)] px-2.5 py-1.5 bg-[#1E1E1E] text-white text-[11px] rounded-[3px] border border-[rgba(255,255,255,0.12)] shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50">
              <div className="font-semibold">{user.name}</div>
              <div className="text-[9.5px] font-mono text-[#9CA3AF] uppercase">{roleLabel}</div>
            </div>
          )}

          {/* Operator Popout Menu */}
          {isUserMenuOpen && (
            <div
              role="dialog"
              aria-label="Account Menu"
              className="absolute left-[calc(100%+12px)] bottom-0 w-64 bg-[#1E1E1E] border border-[rgba(255,255,255,0.12)] rounded-[4px] shadow-2xl z-50 overflow-hidden divide-y divide-[rgba(255,255,255,0.08)] text-[12px]"
            >
              <div className="px-3.5 py-3">
                <div className="font-semibold text-white truncate">{user.name}</div>
                <div className="text-[11px] text-[#9CA3AF] truncate mt-0.5">{user.email}</div>
                <div className="mt-2 inline-block font-mono text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-[2px] bg-[#2A2A2A] border border-[rgba(255,255,255,0.08)] text-[#F97316]">
                  {roleLabel}
                </div>
              </div>

              <div className="p-1.5">
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="w-full text-left px-2.5 py-1.5 rounded-[2px] text-[#EF4444] hover:bg-[rgba(239,68,68,0.1)] transition-colors flex items-center justify-between"
                >
                  <span>{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
                  <span className="font-mono text-[10px]">→</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
