import type { NavigationGuard } from 'vue-router';
import { useSessionStore } from '@/features/auth/stores/session.store';

export const authGuard: NavigationGuard = (to) => {
  const session = useSessionStore();

  if (to.meta.requiresAuth && !session.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  if (to.meta.guestOnly && session.isAuthenticated) {
    return { name: 'exchange' };
  }

  return true;
};
