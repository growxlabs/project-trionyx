'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { SafeUser, DistributorWithRelations } from '@trionyx/types';

export interface DistributorShellProps {
  user: SafeUser;
  distributor: DistributorWithRelations;
  children: React.ReactNode;
}

export function DistributorShell({ user, distributor, children }: DistributorShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const navItems = [
    {
      label: 'Overview',
      href: '/overview',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    },
    {
      label: 'Products',
      href: '/products',
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    },
    {
      label: 'Availability',
      href: '/availability',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      label: 'My Dealers',
      href: '/dealers',
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    },
    {
      label: 'Dealer Requests',
      href: '/requests',
      icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
    },
    {
      label: 'Warranty',
      href: '/warranty',
      icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    },
    {
      label: 'My Account',
      href: '/account',
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    },
  ];

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Continue redirect even if API errors
    } finally {
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F0] flex flex-col md:flex-row text-[#171714]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#FCFBF7] border-r border-[#171714]/10 h-screen sticky top-0 select-none">
        {/* Brand Header */}
        <div className="p-6 border-b border-[#171714]/10">
          <div className="text-[14px] font-bold tracking-[0.14em] uppercase text-[#171714] leading-tight">
            TRIONYX
          </div>
          <div className="text-[11px] font-semibold text-[#F26522] tracking-[0.12em] uppercase mt-1">
            DISTRIBUTOR WORKSPACE
          </div>
        </div>

        {/* Distributor Identity Block */}
        <div className="px-6 py-4 border-b border-[#171714]/10">
          <div className="text-[13.5px] font-bold text-[#171714] truncate" title={distributor.businessName}>
            {distributor.businessName}
          </div>
          <div className="text-[11.5px] text-[#68665F] truncate mt-0.5">
            {distributor.city}, {distributor.state}
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[11px] font-mono text-[#68665F] font-semibold">
              {distributor.distributorCode}
            </span>
            <span className="inline-flex items-center px-1.5 py-0.2 rounded-[2px] text-[9.5px] font-bold uppercase tracking-wider bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
              {distributor.status || 'ACTIVE'}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/overview' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-6 py-2.5 text-[13.5px] transition-colors border-l-2 ${
                  isActive
                    ? 'border-[#F26522] bg-[#171714]/05 text-[#171714] font-semibold'
                    : 'border-transparent text-[#68665F] hover:text-[#171714] hover:bg-[#171714]/03 font-medium'
                }`}
              >
                <svg className="w-4 h-4 shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                </svg>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Footer & Sign Out */}
        <div className="p-6 border-t border-[#171714]/10 bg-[#FCFBF7]">
          <div className="text-[11px] text-[#68665F]">Signed in as</div>
          <div className="text-[13px] font-semibold text-[#171714] truncate mt-0.5">{user.name}</div>
          <div className="text-[11px] text-[#68665F] truncate">{user.email}</div>
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="text-[12px] font-medium text-[#F26522] hover:underline mt-2 inline-block cursor-pointer disabled:opacity-50"
          >
            {isSigningOut ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-[#FCFBF7] border-b border-[#171714]/10 sticky top-0 z-40">
        <div>
          <span className="text-[13px] font-bold tracking-widest uppercase text-[#171714]">
            TRIONYX
          </span>
          <span className="text-[10.5px] font-semibold text-[#F26522] block leading-none mt-0.5">
            DISTRIBUTOR WORKSPACE
          </span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded border border-[#171714]/15 bg-[#FCFBF7] text-[#171714] cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </header>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-[#171714]/10 bg-[#FCFBF7] px-4 py-3 space-y-1">
          <div className="pb-2 mb-2 border-b border-[#171714]/10">
            <div className="text-[13px] font-bold text-[#171714]">{distributor.businessName}</div>
            <div className="text-[11px] font-mono text-[#68665F]">{distributor.distributorCode}</div>
          </div>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded text-[13px] font-medium text-[#171714] hover:bg-[#171714]/05"
            >
              <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
              </svg>
              <span>{item.label}</span>
            </Link>
          ))}
          <div className="pt-2 border-t border-[#171714]/10 mt-2">
            <button
              onClick={handleSignOut}
              className="w-full text-left px-3 py-2 text-[13px] font-medium text-[#F26522] hover:bg-[#171714]/05 rounded"
            >
              Sign out
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-6xl w-full">
        {children}
      </main>
    </div>
  );
}

// Retain DealerShell alias for compatibility
export const DealerShell = DistributorShell as any;
