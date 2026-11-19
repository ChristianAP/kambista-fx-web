import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { isTokenExpired } from '@/core/auth/jwt';
import type { Session } from '@/core/auth/session';
import { clearSession, loadSession, saveSession } from '@/core/storage/session-storage';
import { authApi, type Credentials, type Registration } from '../api/auth.api';

const restoreSession = (): Session | null => {
  const stored = loadSession();

  if (stored && !isTokenExpired(stored.token)) {
    return stored;
  }

  clearSession();
  return null;
};

export const useSessionStore = defineStore('session', () => {
  const session = ref<Session | null>(restoreSession());

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

  const logout = (): void => {
    session.value = null;
    clearSession();
  };

  return { user, isAuthenticated, isAdmin, login, register, logout };
});
