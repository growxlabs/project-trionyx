'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { SafeUser, DistributorWithRelations } from '@trionyx/types';
import { MaskIcon } from '@/components/ui/MaskIcon';

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

  const navItems: { label: string; href: string; src: string }[] = [
    { label: 'Overview', href: '/overview', src: '/icons/overview.svg' },
    { label: 'Products', href: '/products', src: '/icons/products.svg' },
    { label: 'Availability', href: '/availability', src: '/icons/availability.svg' },
    { label: 'My Dealers', href: '/dealers', src: '/icons/dealers.svg' },
    { label: 'Dealer Requests', href: '/requests', src: '/icons/requests.svg' },
    { label: 'Warranty', href: '/warranty', src: '/icons/warranty.svg' },
    { label: 'My Account', href: '/account', src: '/icons/account.svg' },
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
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col md:flex-row text-[#171717]">
      {/* Desktop Sidebar — icon-only rail */}
      <aside
        aria-label="Navigation rail"
        className="hidden md:flex flex-col w-[72px] shrink-0 items-center justify-between py-4 bg-[#FFFFFF] border-r border-[#171717]/10 h-screen sticky top-0 select-none z-40"
      >
        <nav aria-label="Primary navigation" className="flex flex-col items-center gap-2 w-full px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/overview' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                title={item.label}
                className={`w-11 h-11 rounded-[6px] flex items-center justify-center transition-colors ${
                  isActive
                    ? 'text-[#F26522]'
                    : 'text-[#737373] hover:text-[#171717] hover:bg-[#F5F5F5]'
                }`}
              >
                <MaskIcon src={item.src} />
              </Link>
            );
          })}
        </nav>

        <div className="flex justify-center w-full px-3">
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            aria-label="Sign out"
            title="Sign out"
            className="w-11 h-11 rounded-[6px] flex items-center justify-center text-[#737373] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors cursor-pointer disabled:opacity-50"
          >
            <MaskIcon src="/icons/signout.svg" />
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-[#FFFFFF] border-b border-[#171717]/10 sticky top-0 z-40">
        <div>
          <span className="text-[13px] font-bold tracking-widest text-[#171717]">
            TRIONYX
          </span>
          <span className="text-[10.5px] font-semibold text-[#F26522] block leading-none mt-0.5">
            Distributor Workspace
          </span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded border border-[#171717]/15 bg-[#FFFFFF] text-[#171717] cursor-pointer"
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
        <div className="md:hidden border-b border-[#171717]/10 bg-[#FFFFFF] px-4 py-3 space-y-1">
          <div className="pb-2 mb-2 border-b border-[#171717]/10">
            <div className="text-[13px] font-bold text-[#171717]">{distributor.businessName}</div>
            <div className="text-[11px] font-mono text-[#737373]">{distributor.distributorCode}</div>
            <div className="text-[11.5px] text-[#737373] mt-1">Signed in as {user.name}</div>
          </div>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded text-[13px] font-medium text-[#171717] hover:bg-[#171717]/05"
            >
              <MaskIcon src={item.src} className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          ))}
          <div className="pt-2 border-t border-[#171717]/10 mt-2">
            <button
              onClick={handleSignOut}
              className="w-full text-left px-3 py-2 text-[13px] font-medium text-[#F26522] hover:bg-[#171717]/05 rounded"
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
