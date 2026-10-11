'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { SafeUser } from '@trionyx/types';
import { UserMenu } from './UserMenu';
import { OrgSwitcher } from './OrgSwitcher';
import { useActiveOrg } from './OrgContext';

import {
  ControlBoardIcon,
  WorkshopFrontageIcon,
  SerialStockTraysIcon,
  LayeredCoatingSheetsIcon,
  ConnectedNodesIcon,
  VerifiedShieldIcon,
  OperationalLedgerIcon,
  ControlSlidersIcon,
} from './OperationsIcons';
import { TrixNavIcon } from './TrixNavIcon';

interface SidebarProps {
  user: SafeUser;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const { activeOrg } = useActiveOrg();
  const isTrionyx = !activeOrg || activeOrg.slug === 'trionyx';

  // Custom Trionyx Operations Icon Family (24x24 canvas, 1.5px stroke, technical/industrial, squared)
  const navItems = [
    ...(user.role === 'MANAGING_DIRECTOR' ? [{ name: 'TRIX', href: '/trix', active: pathname.startsWith('/trix'), icon: <TrixNavIcon className="w-6 h-6 shrink-0" /> }] : []),
    {
      name: 'Overview',
      href: '/overview',
      active: pathname === '/overview',
      icon: <ControlBoardIcon className="w-6 h-6 shrink-0" />,
    },
    {
      name: 'Studios',
      href: '/dealers',
      active: pathname.startsWith('/dealers'),
      icon: <LayeredCoatingSheetsIcon className="w-6 h-6 shrink-0" />,
    },
    {
      name: 'Inventory',
      href: '/inventory',
      active: pathname.startsWith('/inventory'),
      icon: <WorkshopFrontageIcon className="w-6 h-6 shrink-0" />,
    },
    {
      name: 'Products',
      href: '/products',
      active: pathname.startsWith('/products'),
      icon: <SerialStockTraysIcon className="w-6 h-6 shrink-0" />,
    },
    {
      name: 'Distributor Hub',
      href: '/distributors',
      active: pathname.startsWith('/distributors'),
      icon: <ConnectedNodesIcon className="w-6 h-6 shrink-0" />,
    },
    ...(user.role !== 'DISTRIBUTOR'
      ? [
          ...(isTrionyx
            ? [
                {
                  name: 'Warranty',
                  href: '/warranty',
                  active: pathname.startsWith('/warranty'),
                  icon: <VerifiedShieldIcon className="w-6 h-6 shrink-0" />,
                },
              ]
            : []),
          {
            name: 'Records / Logs',
            href: '/enquiries',
            active: pathname.startsWith('/enquiries'),
            icon: <OperationalLedgerIcon className="w-6 h-6 shrink-0" />,
          },
        ]
      : []),
  ];

  return (
    <aside
      aria-label="Navigation Rail"
      className="hidden lg:flex w-[72px] shrink-0 bg-[var(--surface-raised)] border-r border-[var(--border)] min-h-screen h-screen sticky top-0 flex-col items-center justify-between pt-4 pb-4 select-none z-40"
    >
      <div className="flex flex-col items-center gap-3 w-full px-3">
        {/* Top Slot: Active Organization Indicator & Switcher */}
        <OrgSwitcher user={user} compact />
        <div className="w-8 h-[1px] bg-[var(--border)] my-1" />

        {/* 1. MAIN NAV ICON STACK (Gap 10px / space-y-2.5) */}
        <nav aria-label="Primary navigation" className="flex flex-col items-center gap-2.5 w-full">
          {navItems.map((item) => (
            <div key={item.name} className="relative group flex items-center justify-center w-full">
              <Link
                href={item.href}
                aria-label={item.name}
                aria-current={item.active ? 'page' : undefined}
                title={item.name}
                className={`w-11 h-11 rounded-[5px] border flex items-center justify-center transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2 ${
                  item.active
                    ? 'border-transparent text-[var(--accent)]'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]'
                }`}
              >
                {item.icon}
              </Link>

              {/* Hover Tooltip (Plain English module name) */}
              <div role="tooltip" className="absolute left-[calc(100%+12px)] px-2.5 py-1.5 bg-[var(--surface-raised)] text-[var(--text-primary)] text-[11px] font-semibold tracking-wide rounded-[4px] border border-[var(--border)] shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50">
                {item.name}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* 3. BOTTOM SECTION: Profile / Theme / Settings */}
      <div className="flex flex-col items-center gap-3 w-full px-3">
        {/* Operator profile / account menu */}
        <div className="relative flex items-center justify-center w-full">
          <UserMenu user={user} compact />
        </div>

        {/* Settings / Industrial Control Sliders */}
        <div className="relative group flex items-center justify-center w-full">
          <Link
            href="/settings/appearance"
            aria-label="Settings: Appearance"
            aria-current={pathname.startsWith("/settings") ? "page" : undefined}
            className="w-11 h-11 rounded-[5px] border border-transparent flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
            title="Settings"
          >
            <ControlSlidersIcon className="w-6 h-6 shrink-0" />
          </Link>
          <div role="tooltip" className="absolute left-[calc(100%+12px)] px-2.5 py-1.5 bg-[var(--surface-raised)] text-[var(--text-primary)] text-[11px] font-semibold tracking-wide rounded-[4px] border border-[var(--border)] shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50">
            Settings
          </div>
        </div>
      </div>
    </aside>
  );
}
