'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useActiveOrg } from './OrgContext';
import type { SafeUser } from '@trionyx/types';

interface OrgSwitcherProps {
  user?: SafeUser;
  compact?: boolean;
}

export function OrgSwitcher({ user, compact = false }: OrgSwitcherProps) {
  const { activeOrg, memberships, isLoading, switchOrg } = useActiveOrg();
  const [isOpen, setIsOpen] = useState(false);
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const handleSelectOrg = async (orgId: string) => {
    if (orgId === activeOrg?.id || switchingId) return;
    setSwitchingId(orgId);
    try {
      await switchOrg(orgId);
    } catch (err) {
      console.error('[OrgSwitcher] Failed to switch organization:', err);
      setSwitchingId(null);
    }
  };

  const isTrionyx = activeOrg?.slug === 'trionyx';
  const orgMonogram = isTrionyx ? 'TX' : activeOrg ? 'LK' : 'OR';
  const orgName = activeOrg?.name || 'Trionyx';
  const canSwitch = memberships && memberships.length > 1;

  if (compact) {
    return (
      <div className="relative flex items-center justify-center w-full" ref={menuRef}>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-label={`Current Organization: ${orgName}`}
          title={`${orgName}${canSwitch ? ' (Click to switch)' : ''}`}
          className={`w-11 h-11 rounded-[6px] border flex flex-col items-center justify-center transition-all duration-150 relative focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2 ${
            isOpen
              ? 'bg-[var(--surface-subtle)] border-[var(--border-strong)] text-[var(--accent)]'
              : 'border-[var(--border)] bg-[var(--surface-raised)] text-[var(--text-primary)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-subtle)]'
          }`}
        >
          {/* Monogram Icon */}
          <span className="font-mono text-[11px] font-bold tracking-tight">
            {orgMonogram}
          </span>
          {/* Active organization status pip */}
          <span
            className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
              isTrionyx ? 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]' : 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]'
            }`}
          />
        </button>

        {/* Hover Tooltip (hidden when dialog is open) */}
        {!isOpen && (
          <div
            role="tooltip"
            className="absolute left-[calc(100%+12px)] px-2.5 py-1.5 bg-[var(--surface-raised)] text-[var(--text-primary)] text-[11px] font-semibold tracking-wide rounded-[4px] border border-[var(--border)] shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50"
          >
            {orgName} {canSwitch ? '▾' : ''}
          </div>
        )}

        {/* Dropdown Popover */}
        {isOpen && (
          <div
            role="dialog"
            aria-label="Organization switcher"
            className="absolute left-[calc(100%+12px)] top-0 w-64 rounded-[8px] border border-[var(--menu-border)] bg-[var(--menu-bg)] shadow-2xl py-2 z-50 focus:outline-none text-[var(--menu-text-primary)]"
          >
            <div className="px-3.5 py-1.5 border-b border-[var(--menu-divider)]">
              <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--menu-text-muted)] m-0">
                Active Organization
              </p>
              <p className="text-[13px] font-semibold text-[var(--menu-text-primary)] mt-0.5 truncate m-0">
                {orgName}
              </p>
            </div>

            <div className="px-1.5 py-1.5 space-y-1">
              {memberships.map((m) => {
                const org = m.organization;
                const mOrgId = m.organizationId;
                const mSlug = org?.slug || (mOrgId.includes('trionyx') ? 'trionyx' : 'lakshmi');
                const mName = org?.name || (mSlug === 'trionyx' ? 'Trionyx' : 'Lakshmi Distributions');
                const isSelected = activeOrg?.id === mOrgId || activeOrg?.slug === mSlug;
                const isCurrentSwitching = switchingId === mOrgId;

                return (
                  <button
                    key={m.id || mOrgId}
                    type="button"
                    onClick={() => handleSelectOrg(mOrgId)}
                    disabled={isSelected || Boolean(switchingId)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-[5px] text-left transition-colors text-[12.5px] ${
                      isSelected
                        ? 'bg-[var(--menu-theme-track)] font-medium text-[var(--text-primary)] cursor-default'
                        : 'text-[var(--menu-text-secondary)] hover:text-[var(--menu-text-primary)] hover:bg-[var(--surface-subtle)] cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-[4px] border font-mono text-[10px] font-bold flex items-center justify-center shrink-0 ${
                          mSlug === 'trionyx'
                            ? 'border-amber-500/30 text-amber-500 bg-amber-500/10'
                            : 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10'
                        }`}
                      >
                        {mSlug === 'trionyx' ? 'TX' : 'LK'}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-[12px] truncate m-0">{mName}</p>
                        <p className="text-[10.5px] text-[var(--menu-text-muted)] truncate m-0">
                          {m.role || 'Member'}
                        </p>
                      </div>
                    </div>

                    <div>
                      {isCurrentSwitching ? (
                        <span className="text-[10px] text-[var(--accent)] animate-pulse">Switching...</span>
                      ) : isSelected ? (
                        <span className="text-[10px] font-semibold text-[var(--accent)] px-1.5 py-0.5 rounded bg-[var(--accent)]/10">
                          Active
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>

            {memberships.length <= 1 && (
              <div className="px-3 py-1.5 border-t border-[var(--menu-divider)]">
                <p className="text-[11px] text-[var(--menu-text-muted)] m-0">
                  Single organization profile
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Expanded / Mobile variant
  return (
    <div className="relative w-full" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between p-2.5 rounded-[6px] border border-[var(--border)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-raised)] transition-colors text-left"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={`w-8 h-8 rounded-[4px] border font-mono text-[11px] font-bold flex items-center justify-center shrink-0 ${
              isTrionyx
                ? 'border-amber-500/30 text-amber-500 bg-amber-500/10'
                : 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10'
            }`}
          >
            {orgMonogram}
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-[var(--text-secondary)] m-0">
              Organization
            </p>
            <p className="text-[13px] font-semibold text-[var(--text-primary)] truncate m-0">
              {orgName}
            </p>
          </div>
        </div>

        {canSwitch && (
          <svg
            className={`w-4 h-4 text-[var(--text-secondary)] transition-transform duration-150 ${
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
        )}
      </button>

      {/* Expanded Dropdown */}
      {isOpen && canSwitch && (
        <div
          role="dialog"
          aria-label="Select organization"
          className="mt-2 w-full rounded-[6px] border border-[var(--menu-border)] bg-[var(--menu-bg)] shadow-xl p-1.5 space-y-1 z-50 text-[var(--menu-text-primary)]"
        >
          {memberships.map((m) => {
            const org = m.organization;
            const mOrgId = m.organizationId;
            const mSlug = org?.slug || (mOrgId.includes('trionyx') ? 'trionyx' : 'lakshmi');
            const mName = org?.name || (mSlug === 'trionyx' ? 'Trionyx' : 'Lakshmi Distributions');
            const isSelected = activeOrg?.id === mOrgId || activeOrg?.slug === mSlug;
            const isCurrentSwitching = switchingId === mOrgId;

            return (
              <button
                key={m.id || mOrgId}
                type="button"
                onClick={() => handleSelectOrg(mOrgId)}
                disabled={isSelected || Boolean(switchingId)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-[5px] text-left transition-colors text-[13px] ${
                  isSelected
                    ? 'bg-[var(--menu-theme-track)] font-medium text-[var(--text-primary)]'
                    : 'text-[var(--menu-text-secondary)] hover:text-[var(--menu-text-primary)] hover:bg-[var(--surface-subtle)]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-[4px] border font-mono text-[10px] font-bold flex items-center justify-center shrink-0 ${
                      mSlug === 'trionyx'
                        ? 'border-amber-500/30 text-amber-500 bg-amber-500/10'
                        : 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10'
                    }`}
                  >
                    {mSlug === 'trionyx' ? 'TX' : 'LK'}
                  </span>
                  <div>
                    <p className="font-semibold text-[12.5px] m-0">{mName}</p>
                    <p className="text-[11px] text-[var(--menu-text-muted)] m-0">{m.role || 'Member'}</p>
                  </div>
                </div>

                <div>
                  {isCurrentSwitching ? (
                    <span className="text-[11px] text-[var(--accent)] animate-pulse">Switching...</span>
                  ) : isSelected ? (
                    <span className="text-[11px] font-semibold text-[var(--accent)] px-1.5 py-0.5 rounded bg-[var(--accent)]/10">
                      Active
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
