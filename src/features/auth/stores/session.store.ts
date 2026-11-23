import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { Session } from '@/core/auth/session';
import { ApiError } from '@/core/http/api-error';
import { clearSession, loadSession, saveSession } from '@/core/storage/session-storage';
import { authApi, type Credentials, type Registration } from '../api/auth.api';

const restoreSession = (): Session | null => {
  const stored = loadSession();

  if (stored?.refreshToken) {
    return stored;
  }

  clearSession();
  return null;
};

export const useSessionStore = defineStore('session', () => {
  const session = ref<Session | null>(restoreSession());
  let pendingRenewal: Promise<boolean> | null = null;

  const user = computed(() => session.value?.user ?? null);
  const isAuthenticated = computed(() => session.value !== null);
  const isAdmin = computed(() => user.value?.rol === 'admin');

  const start = (next: Session): void => {
    session.value = next;
    saveSession(next);
  };

  const login = async (credentials: Credentials): Promise<void> => {
    start(await authApi.login(credentials));
  };

  const register = async (registration: Registration): Promise<void> => {
    await authApi.register(registration);
    await login({ email: registration.email, password: registration.password });
  };

  const renew = async (): Promise<boolean> => {
    const current = session.value;

    if (!current) {
      return false;
    }

    try {
      start(await authApi.refresh(current.refreshToken));
      return true;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        return false;
      }
      throw error;
    }
  };

  const renewSession = (): Promise<boolean> => {
    pendingRenewal ??= renew().finally(() => {
      pendingRenewal = null;
    });
    return pendingRenewal;
  };

  const logout = (): void => {
    const refreshToken = session.value?.refreshToken;
    session.value = null;
    clearSession();

    if (refreshToken) {
      void authApi.logout(refreshToken).catch(() => undefined);
    }
  };

  return { user, isAuthenticated, isAdmin, login, register, renewSession, logout };
});
