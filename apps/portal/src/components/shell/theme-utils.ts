export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = Exclude<ThemePreference, 'system'>;

const validPreferences: ThemePreference[] = ['light', 'dark', 'system'];

export function readThemePreference(value: string | null): ThemePreference {
  return validPreferences.includes(value as ThemePreference) ? (value as ThemePreference) : 'system';
}

export function resolveTheme(preference: ThemePreference, systemDark: boolean): ResolvedTheme {
  return preference === 'system' ? (systemDark ? 'dark' : 'light') : preference;
}

export const accentThemes = ['ember', 'plum', 'rosewood', 'moss', 'slate', 'mono'] as const;
export type AccentTheme = typeof accentThemes[number];
export interface AppearancePreferences {
  mode: ThemePreference;
  accent: AccentTheme;
  density: 'comfortable' | 'compact';
  reduceMotion: boolean;
}
export const defaultAppearance: AppearancePreferences = { mode: 'system', accent: 'ember', density: 'comfortable', reduceMotion: false };
export function readAppearance(value: string | null): AppearancePreferences {
  try {
    const parsed = JSON.parse(value ?? '{}');
    return {
      mode: readThemePreference(parsed?.mode),
      accent: accentThemes.includes(parsed?.accent) ? parsed.accent : 'ember',
      density: parsed?.density === 'compact' ? 'compact' : 'comfortable',
      reduceMotion: parsed?.reduceMotion === true,
    };
  } catch { return { ...defaultAppearance }; }
}
export function appearanceStorageKey(userId: string | null) {
  return `trionyx-ops-appearance:${userId ?? 'guest'}`;
}
