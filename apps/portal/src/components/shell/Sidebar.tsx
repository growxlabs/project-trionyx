'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { SafeUser } from '@trionyx/types';
import { formatRoleLabel } from '@trionyx/types';
import { useThemePreference } from './ThemeProvider';
import {
  IconBuildingStore,
  IconClipboardList,
  IconHierarchy2,
  IconLayoutDashboard,
  IconPackages,
  IconLayersIntersect,
  IconShieldCheck,
} from '@tabler/icons-react';

import {
  ControlSlidersIcon,
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

  // Tabler outline icon preview for the primary rail navigation.
  const navItems = [
    {
      name: 'Overview',
      href: '/overview',
      active: pathname === '/overview',
      icon: <IconLayoutDashboard className="w-5 h-5 shrink-0" stroke={1.6} />,
    },
    {
      name: 'Studios',
      href: '/dealers',
      active: pathname.startsWith('/dealers'),
      icon: <IconBuildingStore className="w-5 h-5 shrink-0" stroke={1.6} />,
    },
    {
      name: 'Inventory',
      href: '/inventory',
      active: pathname.startsWith('/inventory'),
      icon: <IconPackages className="w-5 h-5 shrink-0" stroke={1.6} />,
    },
    {
      name: 'Products',
      href: '/products',
      active: pathname.startsWith('/products'),
      icon: <IconLayersIntersect className="w-5 h-5 shrink-0" stroke={1.6} />,
    },
    {
      name: 'Distributor Hub',
      href: '/distributors',
      active: pathname.startsWith('/distributors'),
      icon: <IconHierarchy2 className="w-5 h-5 shrink-0" stroke={1.6} />,
    },
    ...(user.role !== 'DISTRIBUTOR'
      ? [
          {
            name: 'Warranty',
            href: '/warranty',
            active: pathname.startsWith('/warranty'),
            icon: <IconShieldCheck className="w-5 h-5 shrink-0" stroke={1.6} />,
          },
          {
            name: 'Records / Logs',
            href: '/enquiries',
            active: pathname.startsWith('/enquiries'),
            icon: <IconClipboardList className="w-5 h-5 shrink-0" stroke={1.6} />,
          },
        ]
      : []),
  ];

  return (
    <aside
      aria-label="Navigation Rail"
      className="hidden lg:flex w-[72px] shrink-0 bg-[var(--surface-raised)] border-r border-[var(--border)] min-h-screen h-screen sticky top-0 flex-col items-center justify-between pt-4 pb-4 select-none z-40 transition-colors duration-150"
    >
      {/* 1. TOP SECTION: Compact Trionyx Geometric Mark + Mode Badge */}
      <div className="flex flex-col items-center gap-1.5">
        <Link
          href="/overview"
          className="flex flex-col items-center gap-1 focus-visible:outline-none group"
          title="Trionyx Operations Portal"
        >
          {/* Compact brand mark: the Trionyx X with its signature orange arc. */}
          <div className="w-11 h-11 rounded-[5px] bg-[var(--surface-subtle)] border border-[var(--border)] group-hover:border-[var(--accent)]/55 group-hover:bg-[var(--surface-subtle)]/80 group-focus-visible:border-[var(--accent)] flex items-center justify-center transition-colors">
            <svg
              viewBox="0 0 48 48"
              className="w-8 h-8 shrink-0"
              fill="none"
              role="img"
              aria-label="Trionyx"
            >
              <path
                d="M7 19.5C15.5 10.5 30.8 7.5 42 12.2C39.1 15.1 35.8 18.3 32.4 21.7"
                stroke="#F26522"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17.2 19.2L30.6 33.5M30.4 19.2L17 33.5"
                stroke="currentColor"
                className="text-[var(--text-primary)]"
                strokeWidth="3.8"
                strokeLinecap="square"
              />
              <path
                d="M30.4 19.2L17 33.5"
                stroke="#F26522"
                strokeWidth="3.8"
                strokeLinecap="square"
              />
            </svg>
          </div>
          <span className="font-mono text-[9px] font-bold tracking-[0.12em] text-[var(--text-secondary)] px-1.5 py-0.5 rounded-[2px] bg-[var(--surface-subtle)] border border-[var(--border)]">
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
              className={`w-11 h-11 rounded-[5px] border flex items-center justify-center transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2 ${
                item.active
                  ? 'bg-[var(--accent-soft)] border-[var(--accent-soft-border)] text-[var(--accent)] font-semibold'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] hover:border-[var(--border)]'
              }`}
            >
              {item.icon}
            </Link>

            {/* Hover Tooltip (Plain English module name) */}
            <div role="tooltip" className="absolute left-[calc(100%+12px)] px-2.5 py-1.5 bg-[var(--surface-raised)] text-[var(--text-primary)] text-[11px] font-semibold tracking-wide rounded-[4px] border border-[var(--border)] shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50">
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
            className="w-11 h-11 rounded-[5px] border border-transparent flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] hover:border-[var(--border)] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2 cursor-pointer"
            title="Settings"
          >
            <ControlSlidersIcon className="w-5 h-5 shrink-0" />
          </button>
          <div role="tooltip" className="absolute left-[calc(100%+12px)] px-2.5 py-1.5 bg-[var(--surface-raised)] text-[var(--text-primary)] text-[11px] font-semibold tracking-wide rounded-[4px] border border-[var(--border)] shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50">
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
            className="w-10 h-10 rounded-[4px] bg-[var(--surface-subtle)] border border-[var(--border)] text-[var(--text-primary)] text-[12px] font-mono font-bold flex items-center justify-center hover:border-[var(--border-strong)] transition-colors duration-150 cursor-pointer"
          >
            {initials}
          </button>

          {/* Hover Tooltip (Only visible when menu is closed) */}
          {!isUserMenuOpen && (
            <div className="absolute left-[calc(100%+12px)] px-2.5 py-1.5 bg-[var(--surface-raised)] text-[var(--text-primary)] text-[11px] rounded-[3px] border border-[var(--border)] shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50">
              <div className="font-semibold">{user.name}</div>
              <div className="text-[9.5px] font-mono text-[var(--text-muted)] uppercase">{roleLabel}</div>
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
