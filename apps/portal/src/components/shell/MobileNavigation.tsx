'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import type { SafeUser } from '@trionyx/types';
import { formatRoleLabel } from '@trionyx/types';
import { useThemePreference } from './ThemeProvider';

interface MobileNavigationProps {
  user: SafeUser;
}

export function MobileNavigation({ user }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { preference, setPreference } = useThemePreference();

  const roleLabel = formatRoleLabel(user.role);
  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : 'O';

  const navItems = [
    {
      name: 'Overview',
      href: '/overview',
      active: pathname === '/overview',
      icon: (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
    },
    {
      name: 'Products',
      href: '/products',
      active: pathname.startsWith('/products'),
      icon: (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      ),
    },
    {
      name: 'Inventory',
      href: '/inventory',
      active: pathname.startsWith('/inventory'),
      icon: (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
    },
    {
      name: 'Dealers',
      href: '/dealers',
      active: pathname.startsWith('/dealers'),
      icon: (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      name: 'Distributors',
      href: '/distributors',
      active: pathname.startsWith('/distributors'),
      icon: (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      ),
    },
    ...(user.role !== 'DISTRIBUTOR'
      ? [
          {
            name: 'Enquiries',
            href: '/enquiries',
            active: pathname.startsWith('/enquiries'),
            icon: (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            ),
          },
        ]
      : []),
  ];

  const roleBadgeStyles: Record<string, string> = {
    DISTRIBUTOR: 'bg-[var(--status-info-soft)] text-[var(--status-info)] border-[var(--status-info-border)]',
    MANAGING_DIRECTOR: 'bg-[var(--status-warning-soft)] text-[var(--status-warning)] border-[var(--status-warning-border)]',
    ADMIN: 'bg-[var(--status-info-soft)] text-[var(--status-info)] border-[var(--status-info-border)]',
    STAFF: 'bg-[var(--surface-subtle)] text-[var(--text-secondary)] border-[var(--border)]',
  };

  const badgeClass =
    roleBadgeStyles[user.role] || 'bg-[var(--surface-subtle)] text-[var(--text-primary)] border-[var(--border)]';

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);

    try {
      await fetch('/api/v1/internal/auth/logout', {
        method: 'POST',
      });
    } catch {
      // Proceed even on network error
    }

    router.push('/login');
    router.refresh();
  };

  return (
    <>
      {/* Mobile Topbar */}
      <header className="lg:hidden flex items-center justify-between h-14 px-4 sm:px-6 border-b border-[var(--border)] bg-[var(--surface-raised)] sticky top-0 z-40 select-none">
        <Link href="/overview" className="flex items-center gap-2.5">
          <div className="h-6 w-auto relative flex items-center">
            <Image src="/brand/trionyx-logo-dark.png" alt="Trionyx" width={2092} height={752} priority className="theme-logo-light h-6 w-auto object-contain" />
            <Image src="/brand/trionyx-logo-light.png" alt="" aria-hidden="true" width={2092} height={752} priority className="theme-logo-dark h-6 w-auto object-contain" />
          </div>
          <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-[var(--text-secondary)] px-1.5 py-0.5 rounded bg-[var(--background)] border border-[var(--border)]">
            Ops
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open menu"
          aria-expanded={isOpen}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[var(--border)] bg-[var(--surface-raised)] hover:bg-[var(--background)] active:bg-[var(--surface-subtle)] text-[var(--text-primary)] text-[13px] font-medium transition-colors cursor-pointer"
        >
          <svg
            className="w-4 h-4 text-[var(--text-primary)]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
          <span>Menu</span>
        </button>
      </header>

      {/* Slide-out Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div
                role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
            className="relative w-[280px] sm:w-[320px] max-w-[85vw] bg-[var(--surface-raised)] h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200"
          >
            {/* Drawer Top */}
            <div>
              {/* Header with Close Button */}
              <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-auto relative flex items-center">
                    <Image src="/brand/trionyx-logo-dark.png" alt="Trionyx" width={2092} height={752} priority className="theme-logo-light h-6 w-auto object-contain" />
                    <Image src="/brand/trionyx-logo-light.png" alt="" aria-hidden="true" width={2092} height={752} priority className="theme-logo-dark h-6 w-auto object-contain" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close menu"
                  className="p-1.5 rounded-[4px] hover:bg-[var(--surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Navigation Items (ONLY Overview) */}
              <div className="p-4">
                <div className="px-2 mb-2">
                  <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-[var(--text-muted)]">
                    Operations Menu
                  </span>
                </div>
                <nav className="space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-[6px] text-[14px] transition-colors ${
                        item.active
                          ? 'bg-[var(--background)] border-l-[3px] border-[var(--accent)] text-[var(--text-primary)] font-semibold'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--background)] hover:text-[var(--text-primary)] font-medium'
                      }`}
                    >
                      <span className={item.active ? 'text-[var(--accent-text)]' : 'text-[var(--text-secondary)]'}>
                        {item.icon}
                      </span>
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </nav>
              </div>
            </div>

            {/* Drawer Bottom: Operator Profile & Sign Out */}
            <div className="p-4 border-t border-[var(--border)] bg-[var(--surface)]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-[var(--surface-subtle)] border border-[var(--border)] flex items-center justify-center text-[13px] font-bold text-[var(--text-primary)] shrink-0">
                  {userInitial}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-semibold text-[var(--text-primary)] truncate m-0">
                    {user.name}
                  </p>
                  <p className="text-[11.5px] text-[var(--text-secondary)] truncate m-0">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="mb-3">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-[4px] border text-[11px] font-semibold uppercase tracking-wider ${badgeClass}`}
                >
                  {roleLabel}
                </span>
              </div>

              <fieldset className="mb-3 border-0 p-0">
                <legend className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">Appearance</legend>
                <div className="grid grid-cols-3 gap-1 rounded-[6px] bg-[var(--surface-subtle)] p-1">
                  {([
                    ['light', 'Light'],
                    ['dark', 'Dark'],
                    ['system', 'System'],
                  ] as const).map(([value, label]) => (
                    <label key={value} className={`theme-choice relative flex min-h-10 cursor-pointer items-center justify-center rounded-[4px] px-1 text-[12px] font-medium transition-colors ${preference === value ? 'bg-[var(--surface-raised)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)]'}`}>
                      <input className="sr-only" type="radio" name="ops-mobile-theme" value={value} checked={preference === value} onChange={() => setPreference(value)} />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-[6px] border border-[var(--status-danger-border)] bg-[var(--status-danger-soft)] hover:bg-[var(--status-danger-soft)] text-[var(--status-danger)] text-[13px] font-semibold transition-colors duration-150 cursor-pointer disabled:opacity-50"
              >
                {isSigningOut ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-[var(--status-danger)]" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Signing out...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-3.5 h-3.5 text-[var(--status-danger)]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span>Sign Out</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
