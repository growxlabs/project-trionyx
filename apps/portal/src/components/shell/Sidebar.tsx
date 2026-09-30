'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { SafeUser } from '@trionyx/types';
import { useThemePreference } from './ThemeProvider';
import { UserMenu } from './UserMenu';

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

interface SidebarProps {
  user: SafeUser;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const { preference, setPreference } = useThemePreference();

  // Custom Trionyx Operations Icon Family (24x24 canvas, 1.5px stroke, technical/industrial, squared)
  const navItems = [
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
          {
            name: 'Warranty',
            href: '/warranty',
            active: pathname.startsWith('/warranty'),
            icon: <VerifiedShieldIcon className="w-6 h-6 shrink-0" />,
          },
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
      className="hidden lg:flex w-[72px] shrink-0 bg-[#000000] min-h-screen h-screen sticky top-0 flex-col items-center justify-between pt-4 pb-4 select-none z-40"
    >
      {/* 1. MAIN NAV ICON STACK (Gap 10px / space-y-2.5) */}
      <nav aria-label="Primary navigation" className="flex flex-col items-center gap-2.5 w-full px-3">
        {navItems.map((item) => (
          <div key={item.name} className="relative group flex items-center justify-center w-full">
            <Link
              href={item.href}
              aria-label={item.name}
              aria-current={item.active ? 'page' : undefined}
              title={item.name}
              className={`w-11 h-11 rounded-[5px] border flex items-center justify-center transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[#F26522] focus-visible:outline-offset-2 ${
                item.active
                  ? 'border-transparent text-[#F26522]'
                  : 'border-transparent text-[#A3A3A3] hover:text-[#FAFAFA] hover:bg-[#161616]/60 hover:border-[rgba(255,255,255,0.06)]'
              }`}
            >
              {item.icon}
            </Link>

            {/* Hover Tooltip (Plain English module name) */}
            <div role="tooltip" className="absolute left-[calc(100%+12px)] px-2.5 py-1.5 bg-[#161616] text-[#FAFAFA] text-[11px] font-semibold tracking-wide rounded-[4px] border border-[rgba(255,255,255,0.08)] shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50">
              {item.name}
            </div>
          </div>
        ))}
      </nav>

      {/* 3. BOTTOM SECTION: Profile / Theme / Settings */}
      <div className="flex flex-col items-center gap-3 w-full px-3">
        {/* Operator profile / account menu */}
        <div className="relative flex items-center justify-center w-full">
          <UserMenu user={user} compact />
        </div>

        {/* Settings / Industrial Control Sliders */}
        <div className="relative group flex items-center justify-center w-full">
          <button
            type="button"
            onClick={() => setPreference(preference === 'dark' ? 'light' : 'dark')}
            aria-label={`Switch to ${preference === 'dark' ? 'light' : 'dark'} theme`}
            className="w-11 h-11 rounded-[5px] border border-transparent flex items-center justify-center text-[#A3A3A3] hover:text-[#FAFAFA] hover:bg-[#161616]/60 hover:border-[rgba(255,255,255,0.06)] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[#F26522] focus-visible:outline-offset-2"
            title="Settings"
          >
            <ControlSlidersIcon className="w-6 h-6 shrink-0" />
          </button>
          <div role="tooltip" className="absolute left-[calc(100%+12px)] px-2.5 py-1.5 bg-[#161616] text-[#FAFAFA] text-[11px] font-semibold tracking-wide rounded-[4px] border border-[rgba(255,255,255,0.08)] shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50">
            Settings
          </div>
        </div>
      </div>
    </aside>
  );
}
