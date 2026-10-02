import assert from 'node:assert/strict';
import test from 'node:test';
import { readThemePreference, resolveTheme } from './theme-utils';

test('retains each supported preference from storage', () => {
  assert.equal(readThemePreference('light'), 'light');
  assert.equal(readThemePreference('dark'), 'dark');
  assert.equal(readThemePreference('system'), 'system');
});

test('defaults missing or invalid stored preferences to system', () => {
  assert.equal(readThemePreference(null), 'system');
  assert.equal(readThemePreference('sepia'), 'system');
});

test('resolves explicit light and dark preferences independently of the OS', () => {
  assert.equal(resolveTheme('light', true), 'light');
  assert.equal(resolveTheme('light', false), 'light');
  assert.equal(resolveTheme('dark', true), 'dark');
  assert.equal(resolveTheme('dark', false), 'dark');
});

test('system preference follows both OS color schemes without changing preference', () => {
  const preference = readThemePreference('system');
  assert.equal(resolveTheme(preference, false), 'light');
  assert.equal(resolveTheme(preference, true), 'dark');
  assert.equal(preference, 'system');
});

import { appearanceStorageKey, readAppearance, defaultAppearance } from './theme-utils';
import { themeInitializationScript } from './theme-init-script';
import { runInNewContext } from 'node:vm';
import { readFileSync } from 'node:fs';

test('appearance rejects malformed storage and unsupported values', () => {
  for (const value of [null, 'broken', 'null', '{}', '{"mode":"neon","accent":"pink","density":"tiny","reduceMotion":"true"}']) {
    assert.deepEqual(readAppearance(value), defaultAppearance);
  }
});
test('prepaint initialization isolates accounts and matches validated preferences', () => {
  const saved = { mode: 'dark', accent: 'plum', density: 'compact', reduceMotion: true };
  for (const user of ['alice', 'bob']) {
    const element = { dataset: {} as Record<string, string>, style: {} as Record<string, string> };
    runInNewContext(themeInitializationScript(user), {
      document: { documentElement: element },
      localStorage: { getItem: (key: string) => key === appearanceStorageKey('alice') ? JSON.stringify(saved) : null },
      matchMedia: () => ({ matches: false }),
    });
    assert.equal(element.dataset.accent, user === 'alice' ? 'plum' : 'ember');
    assert.equal(element.dataset.theme, user === 'alice' ? 'dark' : 'light');
    assert.equal(element.dataset.density, user === 'alice' ? 'compact' : 'comfortable');
  }
});
test('prepaint follows OS even when storage is blocked', () => {
  const element = { dataset: {} as Record<string, string>, style: {} };
  runInNewContext(themeInitializationScript('alice'), {
    document: { documentElement: element }, localStorage: { getItem() { throw new Error('blocked'); } }, matchMedia: () => ({ matches: true }),
  });
  assert.equal(element.dataset.theme, 'dark');
  assert.equal(element.dataset.accent, 'ember');
});
test('all palette button foregrounds meet WCAG AA text contrast', () => {
  const css = readFileSync(new URL('../../app/appearance.css', import.meta.url), 'utf8');
  const luminance = (hex: string) => {
    const values = hex.slice(1).match(/../g)!.map(v => parseInt(v, 16) / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
    return values[0] * .2126 + values[1] * .7152 + values[2] * .0722;
  };
  for (const block of css.matchAll(/:root\[data-theme[^}]+}/g)) {
    const foreground = luminance(block[0].match(/--accent-foreground: (#[A-Fa-f0-9]+)/)![1]);
    for (const match of block[0].matchAll(/--accent-primary(?:-hover|-active)?: (#[A-Fa-f0-9]+)/g)) {
      const background = luminance(match[1]);
      assert.ok((Math.max(foreground, background) + .05) / (Math.min(foreground, background) + .05) >= 4.5, block[0]);
    }
  }
});
