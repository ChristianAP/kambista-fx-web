import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadSession, saveSession } from '@/core/storage/session-storage';
import { buildSession, makeToken } from '@/test-support/tokens';
import { authApi } from '../api/auth.api';
import { useSessionStore } from './session.store';

vi.mock('../api/auth.api', () => ({
  authApi: { login: vi.fn(), register: vi.fn() },
}));

const credentials = { email: 'juan@example.com', password: 'contraseña123' };

describe('session store', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetAllMocks();
    setActivePinia(createPinia());
  });

  it('starts without a session', () => {
    const store = useSessionStore();

    expect(store.isAuthenticated).toBe(false);
    expect(store.user).toBeNull();
  });

  it('stores and persists the session after a login', async () => {
    const session = buildSession();
    vi.mocked(authApi.login).mockResolvedValue(session);
    const store = useSessionStore();

    await store.login(credentials);

    expect(store.isAuthenticated).toBe(true);
    expect(store.user).toEqual(session.user);
    expect(loadSession()).toEqual(session);
  });

  it('logs the user in right after registering', async () => {
    vi.mocked(authApi.register).mockResolvedValue(buildSession().user);
    vi.mocked(authApi.login).mockResolvedValue(buildSession());
    const store = useSessionStore();

    await store.register({ nombre: 'Juan Pérez', ...credentials });

    expect(authApi.register).toHaveBeenCalledOnce();
    expect(authApi.login).toHaveBeenCalledWith(credentials);
    expect(store.isAuthenticated).toBe(true);
  });

  it('does not log in when registration fails', async () => {
    vi.mocked(authApi.register).mockRejectedValue(new Error('conflicto'));
    const store = useSessionStore();

    await expect(store.register({ nombre: 'Juan Pérez', ...credentials })).rejects.toThrow();

    expect(authApi.login).not.toHaveBeenCalled();
    expect(store.isAuthenticated).toBe(false);
  });

  it('clears memory and storage on logout', async () => {
    vi.mocked(authApi.login).mockResolvedValue(buildSession());
    const store = useSessionStore();
    await store.login(credentials);

    store.logout();

    expect(store.isAuthenticated).toBe(false);
    expect(loadSession()).toBeNull();
  });

  it('restores a valid stored session', () => {
    const session = buildSession();
    saveSession(session);

    expect(useSessionStore().user).toEqual(session.user);
  });

  it('discards a stored session whose token has expired', () => {
    saveSession({ ...buildSession(), token: makeToken(-10) });

    const store = useSessionStore();

    expect(store.isAuthenticated).toBe(false);
    expect(loadSession()).toBeNull();
  });

  it('recognizes administrators', async () => {
    vi.mocked(authApi.login).mockResolvedValue(buildSession({ rol: 'admin' }));
    const store = useSessionStore();

    await store.login(credentials);

    expect(store.isAdmin).toBe(true);
  });
});
