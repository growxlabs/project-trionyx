'use client';

import React from 'react';
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

export function AppearanceSettings() {
  const { appearance, setAppearance } = useThemePreference();

  return (
    <main className="flex-1 p-6 sm:p-10 max-w-4xl">
      <div className="mb-7">
        <h1 className="text-[24px] sm:text-[26px] font-semibold text-[var(--text-primary)] tracking-tight m-0">
          Appearance
        </h1>
      </div>

      <div className="divide-y divide-[var(--border)] border-t border-[var(--border)]">
        {/* MODE */}
        <fieldset className="py-6 border-0 m-0 p-0">
          <legend className="text-[11px] font-mono font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)] mb-3">
            MODE
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {MODES.map((m) => {
              const isChecked = appearance.mode === m.id;
              return (
                <label
                  key={m.id}
                  className={`appearance-choice relative flex items-center justify-between h-[44px] px-3.5 rounded-[6px] border cursor-pointer transition-all select-none ${
                    isChecked
                      ? 'border-[var(--accent-text)] bg-[var(--accent-subtle)] shadow-xs'
                      : 'border-[var(--border-strong)] bg-[var(--surface)] hover:border-[var(--text-secondary)]'
                  }`}
                >
                  <input
                    type="radio"
                    name="appearance-mode"
                    value={m.id}
                    checked={isChecked}
                    onChange={() => setAppearance({ mode: m.id })}
                    className="sr-only"
                  />
                  <span className="text-[13.5px] font-medium text-[var(--text-primary)]">
                    {m.label}
                  </span>
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-3 transition-colors ${
                      isChecked
                        ? 'border-[var(--accent-text)] bg-[var(--accent-text)]'
                        : 'border-[var(--border-strong)] bg-transparent'
                    }`}
                  >
                    {isChecked && <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-foreground)]" />}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* ACCENT */}
        <fieldset className="py-6 border-0 m-0 p-0">
          <legend className="text-[11px] font-mono font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)] mb-3">
            ACCENT
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {ACCENTS.map((acc) => {
              const isChecked = appearance.accent === acc.id;
              return (
                <label
                  key={acc.id}
                  className={`appearance-choice relative flex items-center justify-between h-[44px] px-3.5 rounded-[6px] border cursor-pointer transition-all select-none ${
                    isChecked
                      ? 'border-[var(--accent-text)] bg-[var(--accent-subtle)] shadow-xs'
                      : 'border-[var(--border-strong)] bg-[var(--surface)] hover:border-[var(--text-secondary)]'
                  }`}
                >
                  <input
                    type="radio"
                    name="appearance-accent"
                    value={acc.id}
                    checked={isChecked}
                    onChange={() => setAppearance({ accent: acc.id })}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-2.5 min-w-0">
                    <i
                      aria-hidden="true"
                      className="appearance-swatch shrink-0 w-3.5 h-3.5 rounded-full ring-2 ring-black/10 dark:ring-white/10"
                      data-preview-accent={acc.id}
                    />
                    <span className="text-[13.5px] font-medium text-[var(--text-primary)] truncate">
                      {acc.label}
                    </span>
                  </div>
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-2 transition-colors ${
                      isChecked
                        ? 'border-[var(--accent-text)] bg-[var(--accent-text)]'
                        : 'border-[var(--border-strong)] bg-transparent'
                    }`}
                  >
                    {isChecked && <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-foreground)]" />}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* DENSITY */}
        <fieldset className="py-6 border-0 m-0 p-0">
          <legend className="text-[11px] font-mono font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)] mb-3">
            DENSITY
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {DENSITIES.map((den) => {
              const isChecked = appearance.density === den.id;
              return (
                <label
                  key={den.id}
                  className={`appearance-choice relative flex items-center justify-between h-[44px] px-3.5 rounded-[6px] border cursor-pointer transition-all select-none ${
                    isChecked
                      ? 'border-[var(--accent-text)] bg-[var(--accent-subtle)] shadow-xs'
                      : 'border-[var(--border-strong)] bg-[var(--surface)] hover:border-[var(--text-secondary)]'
                  }`}
                >
                  <input
                    type="radio"
                    name="appearance-density"
                    value={den.id}
                    checked={isChecked}
                    onChange={() => setAppearance({ density: den.id })}
                    className="sr-only"
                  />
                  <span className="text-[13.5px] font-medium text-[var(--text-primary)]">
                    {den.label}
                  </span>
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-3 transition-colors ${
                      isChecked
                        ? 'border-[var(--accent-text)] bg-[var(--accent-text)]'
                        : 'border-[var(--border-strong)] bg-transparent'
                    }`}
                  >
                    {isChecked && <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-foreground)]" />}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* ACCESSIBILITY */}
        <section className="py-6 border-b border-[var(--border)]" aria-labelledby="accessibility-heading">
          <h2
            id="accessibility-heading"
            className="text-[11px] font-mono font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)] mb-3"
          >
            ACCESSIBILITY
          </h2>
          <label className="flex items-center justify-between h-[48px] px-3.5 rounded-[6px] border border-[var(--border-strong)] bg-[var(--surface)] cursor-pointer hover:border-[var(--text-secondary)] transition-colors select-none">
            <span className="text-[13.5px] font-medium text-[var(--text-primary)]">
              Reduce Motion
            </span>
            <div className="flex items-center gap-3 shrink-0 ml-4">
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
          </label>
        </section>
      </div>
    </main>
  );
}
