'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from 'react';
import { readThemePreference, resolveTheme, type ThemePreference } from './theme-utils';

interface ThemeContextValue {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = 'trionyx-ops-theme';
let memoryPreference: ThemePreference | null = null;
let storageUnavailable = false;

function readPreference(): ThemePreference {
  if (storageUnavailable) return memoryPreference ?? 'system';
  try {
    return readThemePreference(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    storageUnavailable = true;
    return 'system';
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const preference = useSyncExternalStore<ThemePreference>(subscribePreference, readPreference, () => 'system');
  const setPreference = useCallback((next: ThemePreference) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
      storageUnavailable = false;
      memoryPreference = null;
    } catch {
      // The in-memory preference still applies when storage is unavailable.
      storageUnavailable = true;
      memoryPreference = next;
    }
    const theme = resolveTheme(next, window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.themePreference = next;
    document.documentElement.style.colorScheme = theme;
    document.dispatchEvent(new Event('trionyx-theme-change'));
  }, []);

  useEffect(() => {
    // The head initializer already applied the stored choice. During hydration,
    // wait until the external-store snapshot matches it instead of briefly
    // replacing that choice with the server's deterministic `system` snapshot.
    if (document.documentElement.dataset.themePreference !== preference) return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const theme = resolveTheme(preference, media.matches);
      document.documentElement.dataset.theme = theme;
      document.documentElement.dataset.themePreference = preference;
      document.documentElement.style.colorScheme = theme;
    };
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [preference]);

  const value = useMemo(() => ({ preference, setPreference }), [preference, setPreference]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

function subscribePreference(onChange: () => void) {
  document.addEventListener('trionyx-theme-change', onChange);
  window.addEventListener('storage', onChange);
  return () => {
    document.removeEventListener('trionyx-theme-change', onChange);
    window.removeEventListener('storage', onChange);
  };
}

export function useThemePreference() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useThemePreference must be used within ThemeProvider');
  return context;
}
