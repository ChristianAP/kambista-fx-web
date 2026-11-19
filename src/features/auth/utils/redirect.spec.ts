import { describe, expect, it } from 'vitest';
import { DEFAULT_REDIRECT, resolveRedirect } from './redirect';

describe('resolveRedirect', () => {
  it('keeps internal paths', () => {
    expect(resolveRedirect('/history?range=30')).toBe('/history?range=30');
  });

  it.each([
    undefined,
    null,
    '',
    'history',
    '//evil.example.com',
    'https://evil.example.com',
    ['/a'],
  ])('falls back to the default for %s', (target) => {
    expect(resolveRedirect(target)).toBe(DEFAULT_REDIRECT);
  });
});
