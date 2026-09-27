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
