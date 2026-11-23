import { flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import { loadSession, saveSession } from '@/core/storage/session-storage';
import { authApi } from '@/features/auth/api/auth.api';
import { buildSession } from '@/test-support/tokens';
import AppHeader from './AppHeader.vue';

vi.mock('@/features/auth/api/auth.api', () => ({
  authApi: { login: vi.fn(), register: vi.fn(), refresh: vi.fn(), logout: vi.fn() },
}));

const mountHeader = async (overrides: Parameters<typeof buildSession>[0] = {}) => {
  const Stub = { render: () => null };
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/exchange', name: 'exchange', component: Stub },
      { path: '/history', name: 'history', component: Stub },
      { path: '/login', name: 'login', component: Stub },
    ],
  });
  saveSession(buildSession(overrides));
  const pinia = createPinia();
  setActivePinia(pinia);
  await router.push('/exchange');
  const wrapper = mount(AppHeader, { global: { plugins: [pinia, router] } });
  return { wrapper, router };
};

describe('AppHeader', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetAllMocks();
    vi.mocked(authApi.logout).mockResolvedValue(undefined);
  });

  it('shows the name and the email of the user', async () => {
    const { wrapper } = await mountHeader();

    expect(wrapper.text()).toContain('Juan Pérez');
    expect(wrapper.text()).toContain('juan@example.com');
  });

  it('identifies administrators', async () => {
    const { wrapper } = await mountHeader({ rol: 'admin' });

    expect(wrapper.text()).toContain('Administrador');
  });

  it('highlights the current section', async () => {
    const { wrapper } = await mountHeader();

    const current = wrapper.find('nav a[aria-current="page"]');

    expect(current.text()).toBe('Cambiar');
  });

  it('closes the session and returns to the login', async () => {
    const { wrapper, router } = await mountHeader();

    const logout = wrapper.findAll('button').find((button) => button.text() === 'Cerrar sesión');
    await logout?.trigger('click');
    await flushPromises();

    expect(loadSession()).toBeNull();
    expect(authApi.logout).toHaveBeenCalledWith('refresh-token');
    expect(router.currentRoute.value.name).toBe('login');
  });
});
