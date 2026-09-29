'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { SafeUser } from '@trionyx/types';
import { formatRoleLabel } from '@trionyx/types';
import { useThemePreference } from './ThemeProvider';

import {
  ControlBoardIcon,
  WorkshopFrontageIcon,
  SerialStockTraysIcon,
  LayeredCoatingSheetsIcon,
  ConnectedNodesIcon,
  VerifiedShieldIcon,
  OperationalLedgerIcon,
  ControlSlidersIcon,
  TrionyxOpsMarkAnimated,
} from './OperationsIcons';

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

  // Custom Trionyx Operations Icon Family (24x24 canvas, 1.5px stroke, technical/industrial, squared)
  const navItems = [
    {
      name: 'Overview',
      href: '/overview',
      active: pathname === '/overview',
      icon: <ControlBoardIcon className="w-5 h-5 shrink-0" />,
    },
    {
      name: 'Studios',
      href: '/dealers',
      active: pathname.startsWith('/dealers'),
      icon: <WorkshopFrontageIcon className="w-5 h-5 shrink-0" />,
    },
    {
      name: 'Inventory',
      href: '/inventory',
      active: pathname.startsWith('/inventory'),
      icon: <SerialStockTraysIcon className="w-5 h-5 shrink-0" />,
    },
    {
      name: 'Products',
      href: '/products',
      active: pathname.startsWith('/products'),
      icon: <LayeredCoatingSheetsIcon className="w-5 h-5 shrink-0" />,
    },
    {
      name: 'Distributor Hub',
      href: '/distributors',
      active: pathname.startsWith('/distributors'),
      icon: <ConnectedNodesIcon className="w-5 h-5 shrink-0" />,
    },
    ...(user.role !== 'DISTRIBUTOR'
      ? [
          {
            name: 'Warranty',
            href: '/warranty',
            active: pathname.startsWith('/warranty'),
            icon: <VerifiedShieldIcon className="w-5 h-5 shrink-0" />,
          },
          {
            name: 'Records / Logs',
            href: '/enquiries',
            active: pathname.startsWith('/enquiries'),
            icon: <OperationalLedgerIcon className="w-5 h-5 shrink-0" />,
          },
        ]
      : []),
  ];

  return (
    <aside
      aria-label="Navigation Rail"
      className="hidden lg:flex w-[72px] shrink-0 bg-[#171714] min-h-screen h-screen sticky top-0 flex-col items-center justify-between pt-4 pb-4 select-none z-40"
    >
      {/* 1. TOP SECTION: Compact Trionyx Geometric Mark + Mode Badge */}
      <div className="flex flex-col items-center gap-1.5">
        <Link
          href="/overview"
          className="flex flex-col items-center gap-1 focus-visible:outline-none group"
          title="Trionyx Operations Portal"
        >
          {/* Performance Tyre & Wheel Rim Chassis: Trionyx Operations Emblem */}
          <div className="w-11 h-11 rounded-[5px] bg-[#22221E] border border-[rgba(255,255,255,0.10)] group-hover:border-[#F26522]/55 group-hover:bg-[#252520] group-focus-visible:border-[#F26522] flex items-center justify-center transition-colors">
            <TrionyxOpsMarkAnimated size={28} className="w-7 h-7" />
          </div>
          <span className="font-mono text-[9px] font-medium tracking-[0.12em] text-[#A9A59C] px-1 py-0.2 rounded-[2px] bg-[#22221E] border border-[rgba(255,255,255,0.06)]">
            OPS
          </span>
        </Link>
      </div>

      {/* 2. MAIN NAV ICON STACK (Gap 10px / space-y-2.5) */}
      <nav aria-label="Primary navigation" className="flex flex-col items-center gap-2.5 w-full px-3">
        {navItems.map((item) => (
          <div key={item.name} className="relative group flex items-center justify-center w-full">
            {/* Active Left Indicator: One restrained 2px orange vertical line */}
            {item.active && (
              <span aria-hidden="true" className="absolute left-[-12px] w-[3px] h-6 rounded-r bg-[#F26522]" />
            )}

            <Link
              href={item.href}
              aria-label={item.name}
              aria-current={item.active ? 'page' : undefined}
              title={item.name}
              className={`w-11 h-11 rounded-[5px] border flex items-center justify-center transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[#F26522] focus-visible:outline-offset-2 ${
                item.active
                  ? 'bg-[#F26522]/[0.10] border-[#F26522]/25 text-[#F26522]'
                  : 'border-transparent text-[#B7B2A8] hover:text-[#F5F3EC] hover:bg-[#22221E]/60 hover:border-[rgba(255,255,255,0.06)]'
              }`}
            >
              {item.icon}
            </Link>

            {/* Hover Tooltip (Plain English module name) */}
            <div role="tooltip" className="absolute left-[calc(100%+12px)] px-2.5 py-1.5 bg-[#22221E] text-[#F5F3EC] text-[11px] font-semibold tracking-wide rounded-[4px] border border-[rgba(255,255,255,0.08)] shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50">
              {item.name}
            </div>
          </div>
        ))}
      </nav>

      {/* 3. BOTTOM SECTION: Theme/Settings + Operator Avatar Menu */}
      <div className="flex flex-col items-center gap-3 w-full px-3" ref={menuRef}>
        {/* Settings / Industrial Control Sliders */}
        <div className="relative group flex items-center justify-center w-full">
          <button
            type="button"
            onClick={() => setPreference(preference === 'dark' ? 'light' : 'dark')}
            aria-label={`Switch to ${preference === 'dark' ? 'light' : 'dark'} theme`}
            className="w-11 h-11 rounded-[5px] border border-transparent flex items-center justify-center text-[#B7B2A8] hover:text-[#F5F3EC] hover:bg-[#22221E]/60 hover:border-[rgba(255,255,255,0.06)] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[#F26522] focus-visible:outline-offset-2"
            title="Settings"
          >
            <ControlSlidersIcon className="w-5 h-5 shrink-0" />
          </button>
          <div role="tooltip" className="absolute left-[calc(100%+12px)] px-2.5 py-1.5 bg-[#22221E] text-[#F5F3EC] text-[11px] font-semibold tracking-wide rounded-[4px] border border-[rgba(255,255,255,0.08)] shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50">
            Settings
          </div>
        </div>

        {/* Operator Avatar Button */}
        <div className="relative group flex items-center justify-center w-full">
          <button
            type="button"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            aria-expanded={isUserMenuOpen}
            aria-label="User Account Menu"
            className="w-10 h-10 rounded-[4px] bg-[#22221E] border border-[rgba(255,255,255,0.08)] text-[#F7F6F0] text-[12px] font-mono font-bold flex items-center justify-center hover:border-[#A9A59C] hover:text-[#F7F6F0] transition-colors duration-150 cursor-pointer"
          >
            {initials}
          </button>

          {/* Hover Tooltip (Only visible when menu is closed) */}
          {!isUserMenuOpen && (
            <div className="absolute left-[calc(100%+12px)] px-2.5 py-1.5 bg-[#22221E] text-[#F7F6F0] text-[11px] rounded-[3px] border border-[rgba(255,255,255,0.08)] shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50">
              <div className="font-semibold">{user.name}</div>
              <div className="text-[9.5px] font-mono text-[#A9A59C] uppercase">{roleLabel}</div>
            </div>
          )}

          {/* Operator Popout Menu */}
          {isUserMenuOpen && (
            <div
              role="dialog"
              aria-label="Account Menu"
              className="absolute left-[calc(100%+12px)] bottom-0 w-64 bg-[var(--menu-bg)] border border-[var(--menu-border)] rounded-[4px] shadow-2xl z-50 overflow-hidden divide-y divide-[var(--menu-divider)] text-[12px] text-[var(--menu-text-primary)]"
            >
              <div className="px-3.5 py-3">
                <div className="font-semibold text-[var(--menu-text-primary)] truncate">{user.name}</div>
                <div className="text-[11px] text-[var(--menu-text-secondary)] truncate mt-0.5">{user.email}</div>
                <div className="mt-2 inline-block font-mono text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-[2px] bg-[var(--context-strip-badge-bg)] border border-[var(--context-strip-badge-border)] text-[var(--context-strip-badge-text)]">
                  {roleLabel}
                </div>
              </div>

              <div className="p-1.5">
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="w-full text-left px-2.5 py-1.5 rounded-[2px] text-[var(--menu-signout-text)] hover:bg-[var(--menu-signout-hover-bg)] transition-colors flex items-center justify-between"
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
