import { describe, expect, it } from 'vitest';
import { makeToken } from '@/test-support/tokens';
import { isTokenExpired } from './jwt';

describe('isTokenExpired', () => {
  it('accepts a token that has not reached its expiration', () => {
    expect(isTokenExpired(makeToken(60))).toBe(false);
  });

  it('rejects a token whose expiration has passed', () => {
    expect(isTokenExpired(makeToken(-1))).toBe(true);
  });

  it('uses the provided clock', () => {
    const token = makeToken(60, 0);

    expect(isTokenExpired(token, 59_000)).toBe(false);
    expect(isTokenExpired(token, 60_000)).toBe(true);
  });

  it.each(['', 'sin-puntos', 'a.b.c', 'a.%%%.c'])(
    'treats the malformed token "%s" as expired',
    (token) => {
      expect(isTokenExpired(token)).toBe(true);
    },
  );
});
