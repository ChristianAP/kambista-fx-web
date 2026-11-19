import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import { saveSession } from '@/core/storage/session-storage';
import { buildSession } from '@/test-support/tokens';
import { authGuard } from './guards';

const Stub = { render: () => null };

const buildRouter = () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/login', name: 'login', component: Stub, meta: { guestOnly: true } },
      { path: '/exchange', name: 'exchange', component: Stub, meta: { requiresAuth: true } },
      { path: '/history', name: 'history', component: Stub, meta: { requiresAuth: true } },
    ],
  });
  router.beforeEach(authGuard);
  return router;
};

describe('authGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
  });

  it('sends anonymous visitors to the login keeping the requested page', async () => {
    const router = buildRouter();

    await router.push('/history');

    expect(router.currentRoute.value.name).toBe('login');
    expect(router.currentRoute.value.query.redirect).toBe('/history');
  });

  it('lets authenticated users reach protected pages', async () => {
    saveSession(buildSession());
    setActivePinia(createPinia());
    const router = buildRouter();

    await router.push('/history');

    expect(router.currentRoute.value.name).toBe('history');
  });

  it('keeps authenticated users away from the login page', async () => {
    saveSession(buildSession());
    setActivePinia(createPinia());
    const router = buildRouter();

    await router.push('/login');

    expect(router.currentRoute.value.name).toBe('exchange');
  });
});
