'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useThemePreference } from '../../../components/shell/ThemeProvider';
import { accentThemes, type AccentTheme, type ThemePreference } from '../../../components/shell/theme-utils';

const MODES: { id: ThemePreference; label: string }[] = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
];

const ACCENTS: { id: AccentTheme; label: string }[] = [
  { id: 'ember', label: 'Ember' },
  { id: 'plum', label: 'Plum' },
  { id: 'rosewood', label: 'Rosewood' },
  { id: 'moss', label: 'Moss' },
  { id: 'slate', label: 'Slate' },
  { id: 'mono', label: 'Mono' },
];

const DENSITIES: { id: 'comfortable' | 'compact'; label: string }[] = [
  { id: 'comfortable', label: 'Comfortable' },
  { id: 'compact', label: 'Compact' },
];

interface AppearanceDropdownProps<T extends string> {
  value: T;
  options: { id: T; label: string }[];
  onChange: (val: T) => void;
  isAccent?: boolean;
}

function AppearanceDropdown<T extends string>({
  value,
  options,
  onChange,
  isAccent = false,
}: AppearanceDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.id === value) || options[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="w-full h-[40px] px-3.5 rounded-[6px] border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text-primary)] text-[13.5px] font-normal hover:border-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors cursor-pointer flex items-center justify-between select-none"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {isAccent && (
            <span
              aria-hidden="true"
              className="appearance-swatch shrink-0 w-3.5 h-3.5 rounded-full ring-2 ring-black/10 dark:ring-white/10"
              data-preview-accent={value}
            />
          )}
          <span className="font-medium truncate">{selectedOption?.label}</span>
        </div>
        <svg
          className={`w-4 h-4 text-[var(--text-secondary)] shrink-0 ml-2 transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 bg-[var(--surface-raised)] border border-[var(--border-strong)] rounded-[6px] shadow-2xl py-1 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100"
        >
          {options.map((opt) => {
            const isSelected = opt.id === value;
            return (
              <button
                key={opt.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2 text-[13.5px] text-left cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[var(--accent-subtle)] text-[var(--accent-text)] font-semibold'
                    : 'text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {isAccent && (
                    <span
                      aria-hidden="true"
                      className="appearance-swatch shrink-0 w-3.5 h-3.5 rounded-full ring-2 ring-black/10 dark:ring-white/10"
                      data-preview-accent={opt.id}
                    />
                  )}
                  <span className="truncate">{opt.label}</span>
                </div>
                {isSelected && (
                  <svg
                    className="w-4 h-4 text-[var(--accent-text)] shrink-0 ml-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AppearanceSettings() {
  const { appearance, setAppearance } = useThemePreference();

  return (
    <main className="flex-1 p-6 sm:p-10 max-w-4xl">
      <div className="mb-7">
        <h1 className="text-[24px] sm:text-[26px] font-semibold text-[var(--text-primary)] tracking-tight m-0">
          Appearance
        </h1>
      </div>

      <div className="max-w-2xl divide-y divide-[var(--border)] border-t border-b border-[var(--border)]">
        {/* MODE */}
        <div className="py-4.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <label className="text-[11px] font-mono font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)] select-none">
            MODE
          </label>
          <div className="w-full sm:w-[260px]">
            <AppearanceDropdown
              value={appearance.mode}
              options={MODES}
              onChange={(mode) => setAppearance({ mode })}
            />
          </div>
        </div>

        {/* ACCENT */}
        <div className="py-4.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <label className="text-[11px] font-mono font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)] select-none">
            ACCENT
          </label>
          <div className="w-full sm:w-[260px]">
            <AppearanceDropdown
              value={appearance.accent}
              options={ACCENTS}
              onChange={(accent) => setAppearance({ accent })}
              isAccent
            />
          </div>
        </div>

        {/* DENSITY */}
        <div className="py-4.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <label className="text-[11px] font-mono font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)] select-none">
            DENSITY
          </label>
          <div className="w-full sm:w-[260px]">
            <AppearanceDropdown
              value={appearance.density}
              options={DENSITIES}
              onChange={(density) => setAppearance({ density })}
            />
          </div>
        </div>

        {/* ACCESSIBILITY */}
        <div className="py-4.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <label className="text-[11px] font-mono font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)] select-none">
            ACCESSIBILITY
          </label>
          <div className="w-full sm:w-[260px] flex items-center justify-between h-[40px] px-3.5 rounded-[6px] border border-[var(--border-strong)] bg-[var(--surface)] select-none">
            <span className="text-[13.5px] font-medium text-[var(--text-primary)]">
              Reduce Motion
            </span>
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                {appearance.reduceMotion ? 'On' : 'Off'}
              </span>
              <input
                type="checkbox"
                role="switch"
                aria-label="Reduce Motion"
                aria-checked={appearance.reduceMotion}
                className="appearance-switch shrink-0"
                checked={appearance.reduceMotion}
                onChange={(e) => setAppearance({ reduceMotion: e.target.checked })}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
