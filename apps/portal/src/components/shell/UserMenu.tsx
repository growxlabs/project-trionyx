'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { SafeUser } from '@trionyx/types';
import { formatRoleLabel } from '@trionyx/types';
import { useThemePreference } from './ThemeProvider';

interface UserMenuProps {
  user: SafeUser;
}

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { preference, setPreference } = useThemePreference();

  const roleLabel = formatRoleLabel(user.role);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Trigger Button: Sai Managing Director ▾ */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px] hover:bg-[var(--surface-subtle)] text-[13px] font-medium text-[var(--text-primary)] transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
      >
        <span>{user.name}</span>
        <svg
          className={`w-3.5 h-3.5 text-[var(--text-secondary)] transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Account menu"
          className="absolute right-0 mt-1.5 w-60 rounded-[6px] border border-[var(--border)] bg-[var(--surface-raised)] shadow-[0_4px_16px_rgba(23,23,20,0.08)] py-1.5 z-50 focus:outline-none"
        >
          {/* Operator Details */}
          <div className="px-4 py-2 border-b border-[var(--border)]">
            <p className="text-[13px] font-semibold text-[var(--text-primary)] truncate m-0">
              {user.name}
            </p>
            <p className="text-[12px] text-[var(--text-muted)] mt-0.5 m-0">
              {roleLabel}
            </p>
          </div>

          {/* Theme Switcher */}
          <fieldset className="border-0 m-0 px-3 py-2.5 border-b border-[var(--border)]">
            <legend className="px-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
              Theme
            </legend>
            <div className="mt-1.5 grid grid-cols-3 gap-1 rounded-[4px] bg-[var(--surface-subtle)] p-0.5">
              {([
                ['light', 'Light'],
                ['dark', 'Dark'],
                ['system', 'System'],
              ] as const).map(([value, label]) => (
                <label
                  key={value}
                  className={`relative flex min-h-7 cursor-pointer items-center justify-center rounded-[3px] px-1 text-[11.5px] font-medium transition-colors ${
                    preference === value
                      ? 'bg-[var(--surface-raised)] text-[var(--text-primary)] shadow-2xs font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <input
                    className="sr-only"
                    type="radio"
                    name="ops-theme"
                    value={value}
                    checked={preference === value}
                    onChange={() => setPreference(value)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Action: Sign Out */}
          <div className="p-1">
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-[4px] text-[12.5px] font-medium text-[var(--status-danger)] hover:bg-[var(--status-danger-soft)] transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSigningOut ? (
                <span>Signing out...</span>
              ) : (
                <>
                  <svg
                    className="w-3.5 h-3.5 text-[var(--status-danger)]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span>Sign out</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
