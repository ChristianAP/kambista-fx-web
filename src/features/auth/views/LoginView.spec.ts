import { flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import { ApiError } from '@/core/http/api-error';
import { loadSession } from '@/core/storage/session-storage';
import { buildSession } from '@/test-support/tokens';
import { authApi } from '../api/auth.api';
import LoginView from './LoginView.vue';

vi.mock('../api/auth.api', () => ({
  authApi: { login: vi.fn(), register: vi.fn(), refresh: vi.fn(), logout: vi.fn() },
}));

const mountView = async (path = '/login') => {
  const Stub = { render: () => null };
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/login', name: 'login', component: LoginView },
      { path: '/register', name: 'register', component: Stub },
      { path: '/exchange', name: 'exchange', component: Stub },
      { path: '/history', name: 'history', component: Stub },
    ],
  });
  const pinia = createPinia();
  setActivePinia(pinia);
  await router.push(path);
  const wrapper = mount(LoginView, { global: { plugins: [pinia, router] } });
  return { wrapper, router };
};

const fill = async (
  wrapper: Awaited<ReturnType<typeof mountView>>['wrapper'],
  email: string,
  password: string,
) => {
  await wrapper.find('input[type="email"]').setValue(email);
  await wrapper.find('input[type="password"]').setValue(password);
};

const submit = async (wrapper: Awaited<ReturnType<typeof mountView>>['wrapper']) => {
  await wrapper.find('form').trigger('submit');
  await flushPromises();
};

describe('LoginView', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetAllMocks();
  });

  it('asks for the email and the password when the form is empty', async () => {
    const { wrapper } = await mountView();

    await submit(wrapper);

    expect(wrapper.text()).toContain('Ingresa tu correo electrónico');
    expect(wrapper.text()).toContain('Ingresa tu contraseña');
    expect(authApi.login).not.toHaveBeenCalled();
  });

  it('rejects an email without a valid format', async () => {
    const { wrapper } = await mountView();
    await fill(wrapper, 'no-es-un-correo', 'contraseña123');

    await submit(wrapper);

    expect(wrapper.text()).toContain('Ingresa un correo electrónico válido');
    expect(authApi.login).not.toHaveBeenCalled();
  });

  it('logs in, stores the session and goes to the exchange screen', async () => {
    vi.mocked(authApi.login).mockResolvedValue(buildSession());
    const { wrapper, router } = await mountView();
    await fill(wrapper, ' juan@example.com ', 'contraseña123');

    await submit(wrapper);

    expect(authApi.login).toHaveBeenCalledWith({
      email: 'juan@example.com',
      password: 'contraseña123',
    });
    expect(loadSession()).not.toBeNull();
    expect(router.currentRoute.value.name).toBe('exchange');
  });

  it('returns to the page that was requested before the login', async () => {
    vi.mocked(authApi.login).mockResolvedValue(buildSession());
    const { wrapper, router } = await mountView('/login?redirect=/history');
    await fill(wrapper, 'juan@example.com', 'contraseña123');

    await submit(wrapper);

    expect(router.currentRoute.value.name).toBe('history');
  });

  it('shows the error of the server and stays on the screen', async () => {
    vi.mocked(authApi.login).mockRejectedValue(
      new ApiError(401, 'INVALID_CREDENTIALS', 'Correo electrónico o contraseña incorrectos'),
    );
    const { wrapper, router } = await mountView();
    await fill(wrapper, 'juan@example.com', 'incorrecta123');

    await submit(wrapper);

    expect(wrapper.text()).toContain('Correo electrónico o contraseña incorrectos');
    expect(router.currentRoute.value.name).toBe('login');
    expect(loadSession()).toBeNull();
  });

  it('explains when the login was blocked by too many attempts', async () => {
    vi.mocked(authApi.login).mockRejectedValue(
      new ApiError(429, 'TOO_MANY_LOGIN_ATTEMPTS', 'Demasiados intentos fallidos'),
    );
    const { wrapper } = await mountView();
    await fill(wrapper, 'juan@example.com', 'incorrecta123');

    await submit(wrapper);

    expect(wrapper.text()).toContain('Demasiados intentos fallidos');
  });

  it('links to the registration screen', async () => {
    const { wrapper } = await mountView();

    expect(wrapper.find('a[href="/register"]').text()).toBe('Regístrate');
  });
});
