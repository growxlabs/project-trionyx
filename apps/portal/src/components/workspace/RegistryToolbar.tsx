'use client';

import React, { useState } from 'react';

interface FilterOption {
  label: string;
  value: string;
}

export interface RegistryFilter {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: FilterOption[];
}

interface RegistryToolbarProps {
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  filters?: RegistryFilter[];
  totalCount?: number;
  filteredCount?: number;
  unitLabel?: string;
  children?: React.ReactNode;
  className?: string;
}

export function RegistryToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filters = [],
  children,
  className = '',
}: RegistryToolbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const hasSearch = onSearchChange !== undefined;

  return (
    <div className={`flex items-center flex-wrap gap-2 ${className}`}>
      {/* Search: a single icon that expands into the field on demand */}
      {hasSearch &&
        (searchOpen ? (
          <div className="relative flex items-center">
            <svg
              className="w-4 h-4 absolute left-2.5 text-[var(--text-muted)] pointer-events-none shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              autoFocus
              value={searchValue || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-64 pl-8 pr-8 py-1.5 rounded-[4px] border border-[var(--border-strong)] bg-[var(--surface-raised)] text-[13px] font-normal text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
            />
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                setSearchOpen(false);
              }}
              aria-label="Close search"
              className="absolute right-2 flex items-center justify-center w-4 h-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="flex items-center justify-center w-8 h-8 rounded-[4px] border border-[var(--border-strong)] bg-[var(--surface-raised)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer shrink-0"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        ))}

      {filters.map((f) => (
        <div key={f.id} className="relative">
          <select
            value={f.value}
            onChange={(e) => f.onChange(e.target.value)}
            aria-label={f.label}
            className="px-2.5 py-1.5 rounded-[4px] border border-[var(--border-strong)] bg-[var(--surface-raised)] text-[13px] font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] cursor-pointer"
          >
            {f.options.map((opt, optIndex) => (
              <option key={`${f.id}-${opt.value}-${optIndex}`} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      ))}

      {children}
    </div>
  );
}
