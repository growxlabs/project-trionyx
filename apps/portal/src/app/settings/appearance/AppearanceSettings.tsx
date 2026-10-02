'use client';

import React from 'react';
import { useThemePreference } from '../../../components/shell/ThemeProvider';
import { accentThemes, type AccentTheme, type ThemePreference } from '../../../components/shell/theme-utils';

const MODES: { id: ThemePreference; label: string; desc: string }[] = [
  { id: 'system', label: 'System', desc: 'Sync with operating system' },
  { id: 'light', label: 'Light', desc: 'Crisp high-contrast day palette' },
  { id: 'dark', label: 'Dark', desc: 'Deep industrial night palette' },
];

const ACCENTS: { id: AccentTheme; label: string; character: string }[] = [
  { id: 'ember', label: 'Ember', character: 'Warm orange · Burnt copper' },
  { id: 'plum', label: 'Plum', character: 'Muted violet · Deep plum' },
  { id: 'rosewood', label: 'Rosewood', character: 'Muted rose · Deep burgundy' },
  { id: 'moss', label: 'Moss', character: 'Subdued olive · Forest grey' },
  { id: 'slate', label: 'Slate', character: 'Technical steel blue · Slate' },
  { id: 'mono', label: 'Mono', character: 'Graphite · Neutral monochrome' },
];

const DENSITIES: { id: 'comfortable' | 'compact'; label: string; desc: string }[] = [
  { id: 'comfortable', label: 'Comfortable', desc: 'Standard spacious operational layout' },
  { id: 'compact', label: 'Compact', desc: 'Condensed tables and higher data density' },
];

export function AppearanceSettings() {
  const { appearance, setAppearance } = useThemePreference();

  return (
    <main className="flex-1 p-6 sm:p-10 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2">
          <span>Settings</span>
          <span className="text-[var(--border-strong)]">/</span>
          <span className="text-[var(--text-secondary)]">Appearance</span>
        </div>
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
                  className={`appearance-choice relative flex items-center justify-between p-3.5 rounded-[6px] border cursor-pointer transition-all select-none ${
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
                  <div className="flex flex-col">
                    <span className="text-[13.5px] font-medium text-[var(--text-primary)]">
                      {m.label}
                    </span>
                    <span className="text-[11.5px] text-[var(--text-secondary)] mt-0.5">
                      {m.desc}
                    </span>
                  </div>
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
                  className={`appearance-choice relative flex items-center justify-between p-3.5 rounded-[6px] border cursor-pointer transition-all select-none ${
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
                  <div className="flex items-center gap-3 min-w-0">
                    <i
                      aria-hidden="true"
                      className="appearance-swatch shrink-0 w-3.5 h-3.5 rounded-full ring-2 ring-black/10 dark:ring-white/10"
                      data-preview-accent={acc.id}
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[13.5px] font-medium text-[var(--text-primary)] truncate">
                        {acc.label}
                      </span>
                      <span className="text-[11px] text-[var(--text-secondary)] truncate mt-0.5">
                        {acc.character}
                      </span>
                    </div>
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
                  className={`appearance-choice relative flex items-center justify-between p-3.5 rounded-[6px] border cursor-pointer transition-all select-none ${
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
                  <div className="flex flex-col">
                    <span className="text-[13.5px] font-medium text-[var(--text-primary)]">
                      {den.label}
                    </span>
                    <span className="text-[11.5px] text-[var(--text-secondary)] mt-0.5">
                      {den.desc}
                    </span>
                  </div>
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
          <label className="flex items-center justify-between p-3.5 rounded-[6px] border border-[var(--border-strong)] bg-[var(--surface)] cursor-pointer hover:border-[var(--text-secondary)] transition-colors select-none">
            <div className="flex flex-col">
              <span className="text-[13.5px] font-medium text-[var(--text-primary)]">
                Reduce Motion
              </span>
              <span className="text-[11.5px] text-[var(--text-secondary)] mt-0.5">
                Disable non-essential transitions, animations, and smooth scrolling
              </span>
            </div>
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
