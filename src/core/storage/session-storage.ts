import type { Session } from '@/core/auth/session';

const STORAGE_KEY = 'kambista-fx.session';

const safely = <T>(action: () => T, fallback: T): T => {
  try {
    return action();
  } catch {
    return fallback;
  }
};

export const loadSession = (): Session | null =>
  safely(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  }, null);

export const saveSession = (session: Session): void =>
  safely(() => window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session)), undefined);

export const clearSession = (): void =>
  safely(() => window.localStorage.removeItem(STORAGE_KEY), undefined);
