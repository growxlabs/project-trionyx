'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from 'react';
import { appearanceStorageKey, defaultAppearance, readAppearance, resolveTheme, type AppearancePreferences, type ThemePreference } from './theme-utils';

interface ThemeContextValue {
  preference: ThemePreference;
  appearance: AppearancePreferences;
  setPreference: (mode: ThemePreference) => void;
  setAppearance: (patch: Partial<AppearancePreferences>) => void;
}
const ThemeContext = createContext<ThemeContextValue | null>(null);
const memory = new Map<string, string>();
function read(key: string) {
  if (memory.has(key)) return memory.get(key)!;
  try { return localStorage.getItem(key); } catch { return null; }
}
function apply(p: AppearancePreferences) {
  const root = document.documentElement;
  const theme = resolveTheme(p.mode, matchMedia('(prefers-color-scheme: dark)').matches);
  root.dataset.theme = theme;
  root.dataset.themePreference = p.mode;
  root.dataset.accent = p.accent;
  root.dataset.density = p.density;
  root.dataset.reduceMotion = String(p.reduceMotion);
  root.style.colorScheme = theme;
}
function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange);
  document.addEventListener('trionyx-theme-change', onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    document.removeEventListener('trionyx-theme-change', onChange);
  };
}
export function ThemeProvider({ children, userId }: { children: React.ReactNode; userId: string | null }) {
  const key = appearanceStorageKey(userId);
  const snapshot = useSyncExternalStore(subscribe, () => read(key), () => null);
  const appearance = useMemo(() => snapshot ? readAppearance(snapshot) : defaultAppearance, [snapshot]);
  const setAppearance = useCallback((patch: Partial<AppearancePreferences>) => {
    const next = readAppearance(JSON.stringify({ ...readAppearance(read(key)), ...patch }));
    const serialized = JSON.stringify(next);
    try { localStorage.setItem(key, serialized); memory.delete(key); } catch { memory.set(key, serialized); }
    apply(next);
    document.dispatchEvent(new Event('trionyx-theme-change'));
  }, [key]);
  useEffect(() => {
    // Read the cache directly here, avoiding the server snapshot during hydration.
    const update = () => apply(readAppearance(read(key)));
    const media = matchMedia('(prefers-color-scheme: dark)');
    update();
    media.addEventListener('change', update);
    window.addEventListener('storage', update);
    return () => { media.removeEventListener('change', update); window.removeEventListener('storage', update); };
  }, [key]);
  const setPreference = useCallback((mode: ThemePreference) => setAppearance({ mode }), [setAppearance]);
  const value = useMemo(() => ({ appearance, preference: appearance.mode, setPreference, setAppearance }), [appearance, setPreference, setAppearance]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export function useThemePreference() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useThemePreference must be used within ThemeProvider');
  return context;
}
