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
  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : 'O';

  // Role badge styling
  const roleBadgeStyles: Record<string, string> = {
    DISTRIBUTOR: 'bg-[var(--status-info-soft)] text-[var(--status-info)] border-[var(--status-info-border)]',
    MANAGING_DIRECTOR: 'bg-[var(--status-warning-soft)] text-[var(--status-warning)] border-[var(--status-warning-border)]',
    ADMIN: 'bg-[var(--status-info-soft)] text-[var(--status-info)] border-[var(--status-info-border)]',
    STAFF: 'bg-[var(--surface-subtle)] text-[var(--text-secondary)] border-[var(--border)]',
  };

  const badgeClass =
    roleBadgeStyles[user.role] || 'bg-[var(--surface-subtle)] text-[var(--text-primary)] border-[var(--border)]';

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
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-[6px] border border-[var(--border)] bg-[var(--surface-raised)] hover:bg-[var(--background)] active:bg-[var(--surface-subtle)] transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
      >
        <div className="w-7 h-7 rounded-full bg-[var(--surface-subtle)] border border-[var(--border)] flex items-center justify-center text-[12px] font-bold text-[var(--text-primary)] shrink-0">
          {userInitial}
        </div>
        <span className="hidden sm:inline-block text-[13px] font-medium text-[var(--text-primary)]">
          {user.name}
        </span>
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
          className="absolute right-0 mt-2 w-64 rounded-[8px] border border-[var(--border)] bg-[var(--surface-raised)] shadow-[0_4px_20px_rgba(23,23,20,0.08)] py-2 z-50 focus:outline-none animate-in fade-in zoom-in-95 duration-100"
        >
          {/* Operator Details */}
          <div className="px-4 py-2.5 border-b border-[var(--border)]">
            <p className="text-[13.5px] font-semibold text-[var(--text-primary)] truncate m-0">
              {user.name}
            </p>
            <p className="text-[12px] text-[var(--text-secondary)] truncate mt-0.5 m-0" title={user.email}>
              {user.email}
            </p>
            <div className="mt-2">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-[4px] border text-[11px] font-semibold uppercase tracking-wider ${badgeClass}`}
              >
                {roleLabel}
              </span>
            </div>
          </div>

          <fieldset className="border-0 m-0 px-3 py-3">
            <legend className="px-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--text-secondary)]">
              Appearance
            </legend>
            <div className="mt-2 grid grid-cols-3 gap-1 rounded-[6px] bg-[var(--surface-subtle)] p-1">
              {([
                ['light', 'Light'],
                ['dark', 'Dark'],
                ['system', 'System'],
              ] as const).map(([value, label]) => (
                <label key={value} className={`theme-choice relative flex min-h-9 cursor-pointer items-center justify-center rounded-[4px] px-1 text-[12px] font-medium transition-colors ${preference === value ? 'bg-[var(--surface-raised)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                  <input className="sr-only" type="radio" name="ops-theme" value={value} checked={preference === value} onChange={() => setPreference(value)} />
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
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[4px] text-[13px] font-medium text-[var(--status-danger)] hover:bg-[var(--status-danger-soft)] active:bg-[var(--status-danger-soft)] transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSigningOut ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-[var(--status-danger)]" viewBox="0 0 24 24" fill="none">
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
                    className="w-4 h-4 text-[var(--status-danger)]"
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
                  <span>Sign Out</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
