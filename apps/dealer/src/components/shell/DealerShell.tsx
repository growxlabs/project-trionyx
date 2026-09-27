'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { SafeDealerUser, DealerWithRelations } from '@trionyx/types';

interface DealerShellProps {
  user: SafeDealerUser;
  dealer: DealerWithRelations;
  children: React.ReactNode;
}

export function DealerShell({ user, dealer, children }: DealerShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const navItems = [
    { label: 'Overview', href: '/overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { label: 'Products', href: '/products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { label: 'Availability', href: '/availability', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'My Requests', href: '/requests', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
    { label: 'My Account', href: '/account', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
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
    <div className="min-h-screen bg-[#F5F5EE] flex flex-col md:flex-row text-[#171714]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#FCFBF7] border-r border-[#171714]/10 h-screen sticky top-0 select-none">
        {/* Brand Header */}
        <div className="p-6 border-b border-[#171714]/08">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#171714] flex items-center justify-center text-white font-bold text-sm tracking-wider">
              TRX
            </div>
            <div>
              <span className="text-[13px] font-bold tracking-[0.14em] uppercase text-[#171714] block leading-none">
                TRIONYX
              </span>
              <span className="text-[11px] font-semibold text-[#F26522] tracking-wider uppercase block mt-1">
                Dealer Portal
              </span>
            </div>
          </div>
        </div>

        {/* Dealer Identity Badge */}
        <div className="px-6 py-4 bg-[#EFECE3]/50 border-b border-[#171714]/08">
          <div className="text-[12px] font-bold text-[#171714] truncate" title={dealer.businessName}>
            {dealer.businessName}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10.5px] font-mono text-[#68665F] font-semibold">{dealer.dealerCode}</span>
            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
              ACTIVE
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/overview' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded text-[13.5px] font-medium transition-colors ${
                  isActive
                    ? 'bg-[#171714] text-white shadow-sm'
                    : 'text-[#68665F] hover:text-[#171714] hover:bg-[#EFECE3]'
                }`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={item.icon} />
                </svg>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Footer & Sign Out */}
        <div className="p-4 border-t border-[#171714]/08 bg-[#FCFBF7]">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-semibold text-[#171714] truncate">{user.name}</p>
              <p className="text-[11px] text-[#68665F] truncate">{user.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              title="Sign Out"
              className="p-1.5 rounded hover:bg-[#EFECE3] text-[#68665F] hover:text-[#D9362B] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-[#FCFBF7] border-b border-[#171714]/10 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-[#171714] flex items-center justify-center text-white font-bold text-xs">
            TRX
          </div>
          <div>
            <span className="text-[12px] font-bold tracking-widest uppercase text-[#171714]">
              TRIONYX
            </span>
            <span className="text-[10px] font-semibold text-[#F26522] block leading-none">
              Dealer Portal
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded border border-[#171714]/15 bg-[#FCFBF7] text-[#171714]"
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

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#FCFBF7] border-b border-[#171714]/10 p-4 space-y-2 sticky top-[61px] z-30 shadow-lg">
          <div className="pb-3 mb-2 border-b border-[#171714]/10">
            <p className="text-[13px] font-bold text-[#171714]">{dealer.businessName}</p>
            <p className="text-[11px] font-mono text-[#68665F]">{dealer.dealerCode}</p>
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/overview' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded text-[14px] font-medium ${
                  isActive ? 'bg-[#171714] text-white' : 'text-[#68665F] hover:bg-[#EFECE3]'
                }`}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-3 border-t border-[#171714]/10 flex items-center justify-between">
            <span className="text-[12px] text-[#68665F]">{user.name}</span>
            <button
              onClick={handleSignOut}
              className="text-[12px] font-semibold text-[#D9362B] px-2 py-1 rounded bg-[#FEF2F2] border border-[#FECACA]"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
