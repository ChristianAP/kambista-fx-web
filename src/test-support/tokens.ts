import type { Session } from '@/core/auth/session';

const toBase64Url = (value: object): string =>
  btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export const makeToken = (expiresInSeconds: number, now: number = Date.now()): string => {
  const payload = { sub: 'user-1', role: 'user', exp: Math.floor(now / 1000) + expiresInSeconds };
  return `${toBase64Url({ alg: 'HS256', typ: 'JWT' })}.${toBase64Url(payload)}.signature`;
};

export const buildSession = (overrides: Partial<Session['user']> = {}): Session => ({
  token: makeToken(900),
  refreshToken: 'refresh-token',
  user: {
    id: 'user-1',
    nombre: 'Juan Pérez',
    email: 'juan@example.com',
    rol: 'user',
    ...overrides,
  },
});
