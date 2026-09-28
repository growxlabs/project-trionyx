'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { SafeUser } from '@trionyx/types';

interface SidebarProps {
  user: SafeUser;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Overview',
      href: '/overview',
      active: pathname === '/overview',
      icon: (
        <svg
          className="w-4 h-4 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
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
        <svg
          className="w-4 h-4 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
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
        <svg
          className="w-4 h-4 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
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
        <svg
          className="w-4 h-4 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
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
        <svg
          className="w-4 h-4 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      ),
    },
    ...(user.role !== 'DISTRIBUTOR'
      ? [
          {
            name: 'Warranty',
            href: '/warranty',
            active: pathname.startsWith('/warranty'),
            icon: (
              <svg
                className="w-4 h-4 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            ),
          },
          {
            name: 'Enquiries',
            href: '/enquiries',
            active: pathname.startsWith('/enquiries'),
            icon: (
              <svg
                className="w-4 h-4 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            ),
          },
        ]
      : []),
  ];

  return (
    <aside
      aria-label="Sidebar navigation"
      className="hidden lg:flex w-[240px] shrink-0 border-r border-[var(--border)] bg-[var(--surface-raised)] min-h-screen flex-col sticky top-0 h-screen select-none"
    >
      {/* Brand Header */}
      <div className="px-6 py-5 border-b border-[var(--border)]">
        <Link href="/overview" className="block focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] rounded">
          <div className="h-7 w-auto relative flex items-center">
            <Image
              src="/brand/trionyx-logo-dark.png"
              alt="Trionyx"
              width={2092}
              height={752}
              priority
              className="theme-logo-light h-7 w-auto object-contain"
            />
            <Image
              src="/brand/trionyx-logo-light.png"
              alt=""
              aria-hidden="true"
              width={2092}
              height={752}
              priority
              className="theme-logo-dark h-7 w-auto object-contain"
            />
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-[var(--text-secondary)]">
              OPERATIONS PORTAL
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Section */}
      <div className="px-3 py-5 flex-1">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-[4px] text-[13px] transition-colors duration-150 ${
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
    </aside>
  );
}
