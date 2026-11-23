import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/core/http/api-error';
import { loadSession, saveSession } from '@/core/storage/session-storage';
import { buildSession, makeToken } from '@/test-support/tokens';
import { authApi } from '../api/auth.api';
import { useSessionStore } from './session.store';

vi.mock('../api/auth.api', () => ({
  authApi: { login: vi.fn(), register: vi.fn(), refresh: vi.fn(), logout: vi.fn() },
}));

const credentials = { email: 'juan@example.com', password: 'contraseña123' };

describe('session store', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetAllMocks();
    vi.mocked(authApi.logout).mockResolvedValue(undefined);
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

  it('recognizes administrators', async () => {
    vi.mocked(authApi.login).mockResolvedValue(buildSession({ rol: 'admin' }));
    const store = useSessionStore();

    await store.login(credentials);

    expect(store.isAdmin).toBe(true);
  });

  describe('restoring a session', () => {
    it('restores a stored session', () => {
      const session = buildSession();
      saveSession(session);

      expect(useSessionStore().user).toEqual(session.user);
    });

    it('keeps a session whose access token expired because it can be renewed', () => {
      saveSession({ ...buildSession(), token: makeToken(-10) });

      const store = useSessionStore();

      expect(store.isAuthenticated).toBe(true);
    });

    it('discards a stored session that has no refresh token', () => {
      const { token, user } = buildSession();
      localStorage.setItem('kambista-fx.session', JSON.stringify({ token, user }));

      const store = useSessionStore();

      expect(store.isAuthenticated).toBe(false);
      expect(loadSession()).toBeNull();
    });
  });

  describe('renewing the session', () => {
    it('exchanges the refresh token and stores the new tokens', async () => {
      saveSession(buildSession());
      const renewed = { ...buildSession({ rol: 'admin' }), refreshToken: 'refresh-nuevo' };
      vi.mocked(authApi.refresh).mockResolvedValue(renewed);
      const store = useSessionStore();

      const result = await store.renewSession();

      expect(result).toBe(true);
      expect(authApi.refresh).toHaveBeenCalledWith('refresh-token');
      expect(store.isAdmin).toBe(true);
      expect(loadSession()).toEqual(renewed);
    });

    it('shares one request between simultaneous renewals', async () => {
      saveSession(buildSession());
      vi.mocked(authApi.refresh).mockResolvedValue(buildSession());
      const store = useSessionStore();

      const results = await Promise.all([
        store.renewSession(),
        store.renewSession(),
        store.renewSession(),
      ]);

      expect(results).toEqual([true, true, true]);
      expect(authApi.refresh).toHaveBeenCalledOnce();
    });

    it('can renew again after a previous renewal finished', async () => {
      saveSession(buildSession());
      vi.mocked(authApi.refresh).mockResolvedValue(buildSession());
      const store = useSessionStore();

      await store.renewSession();
      await store.renewSession();

      expect(authApi.refresh).toHaveBeenCalledTimes(2);
    });

    it('reports false when the server rejects the refresh token', async () => {
      saveSession(buildSession());
      vi.mocked(authApi.refresh).mockRejectedValue(
        new ApiError(401, 'INVALID_REFRESH_TOKEN', 'Expirado'),
      );
      const store = useSessionStore();

      await expect(store.renewSession()).resolves.toBe(false);
    });

    it('propagates the failures that are not an authentication error', async () => {
      saveSession(buildSession());
      vi.mocked(authApi.refresh).mockRejectedValue(ApiError.network());
      const store = useSessionStore();

      await expect(store.renewSession()).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
      expect(store.isAuthenticated).toBe(true);
    });

    it('does nothing without a session', async () => {
      const store = useSessionStore();

      await expect(store.renewSession()).resolves.toBe(false);
      expect(authApi.refresh).not.toHaveBeenCalled();
    });
  });

  describe('logging out', () => {
    it('clears memory and storage', async () => {
      vi.mocked(authApi.login).mockResolvedValue(buildSession());
      const store = useSessionStore();
      await store.login(credentials);

      store.logout();

      expect(store.isAuthenticated).toBe(false);
      expect(loadSession()).toBeNull();
    });

    it('revokes the refresh token on the server', async () => {
      saveSession(buildSession());
      const store = useSessionStore();

      store.logout();

      expect(authApi.logout).toHaveBeenCalledWith('refresh-token');
    });

    it('closes the session even when the server cannot be reached', async () => {
      saveSession(buildSession());
      vi.mocked(authApi.logout).mockRejectedValue(ApiError.network());
      const store = useSessionStore();

      store.logout();

      expect(store.isAuthenticated).toBe(false);
      expect(loadSession()).toBeNull();
    });
  });
});
