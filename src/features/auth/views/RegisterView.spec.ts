import { flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import { ApiError } from '@/core/http/api-error';
import { loadSession } from '@/core/storage/session-storage';
import { buildSession } from '@/test-support/tokens';
import { authApi } from '../api/auth.api';
import RegisterView from './RegisterView.vue';

vi.mock('../api/auth.api', () => ({
  authApi: { login: vi.fn(), register: vi.fn(), refresh: vi.fn(), logout: vi.fn() },
}));

type Wrapper = Awaited<ReturnType<typeof mountView>>['wrapper'];

const mountView = async () => {
  const Stub = { render: () => null };
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/register', name: 'register', component: RegisterView },
      { path: '/login', name: 'login', component: Stub },
      { path: '/exchange', name: 'exchange', component: Stub },
    ],
  });
  const pinia = createPinia();
  setActivePinia(pinia);
  await router.push('/register');
  const wrapper = mount(RegisterView, { global: { plugins: [pinia, router] } });
  return { wrapper, router };
};

const fill = async (wrapper: Wrapper, nombre: string, email: string, password: string) => {
  const [nameInput, emailInput, passwordInput] = wrapper.findAll('input');
  await nameInput.setValue(nombre);
  await emailInput.setValue(email);
  await passwordInput.setValue(password);
};

const submit = async (wrapper: Wrapper) => {
  await wrapper.find('form').trigger('submit');
  await flushPromises();
};

describe('RegisterView', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetAllMocks();
  });

  it('asks for every field when the form is empty', async () => {
    const { wrapper } = await mountView();

    await submit(wrapper);

    expect(wrapper.text()).toContain('Ingresa tu nombre');
    expect(wrapper.text()).toContain('Ingresa tu correo electrónico');
    expect(wrapper.text()).toContain('Crea una contraseña');
    expect(authApi.register).not.toHaveBeenCalled();
  });

  it('requires a password of at least 8 characters', async () => {
    const { wrapper } = await mountView();
    await fill(wrapper, 'Juan Pérez', 'juan@example.com', '1234567');

    await submit(wrapper);

    expect(wrapper.text()).toContain('La contraseña debe tener al menos 8 caracteres');
    expect(authApi.register).not.toHaveBeenCalled();
  });

  it('creates the account, starts the session and goes to the exchange screen', async () => {
    vi.mocked(authApi.register).mockResolvedValue(buildSession().user);
    vi.mocked(authApi.login).mockResolvedValue(buildSession());
    const { wrapper, router } = await mountView();
    await fill(wrapper, ' Juan Pérez ', ' juan@example.com ', 'contraseña123');

    await submit(wrapper);

    expect(authApi.register).toHaveBeenCalledWith({
      nombre: 'Juan Pérez',
      email: 'juan@example.com',
      password: 'contraseña123',
    });
    expect(loadSession()).not.toBeNull();
    expect(router.currentRoute.value.name).toBe('exchange');
  });

  it('shows the error when the email is already registered', async () => {
    vi.mocked(authApi.register).mockRejectedValue(
      new ApiError(409, 'EMAIL_ALREADY_REGISTERED', 'Ya existe una cuenta con este correo'),
    );
    const { wrapper, router } = await mountView();
    await fill(wrapper, 'Juan Pérez', 'juan@example.com', 'contraseña123');

    await submit(wrapper);

    expect(wrapper.text()).toContain('Ya existe una cuenta con este correo');
    expect(router.currentRoute.value.name).toBe('register');
    expect(authApi.login).not.toHaveBeenCalled();
  });

  it('links to the login screen', async () => {
    const { wrapper } = await mountView();

    expect(wrapper.find('a[href="/login"]').text()).toBe('Inicia sesión');
  });
});
