import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import { ApiError } from '@/core/http/api-error';
import type { Transaction } from '@/shared/domain/transaction';
import { createTransaction } from '../api/exchange.api';
import ExchangeView from './ExchangeView.vue';

vi.mock('../api/exchange.api', () => ({ createTransaction: vi.fn() }));

const transaction: Transaction = {
  id: 'abcdef1234567890',
  monedaOrigen: 'USD',
  monedaDestino: 'PEN',
  monto: 100,
  montoCambiado: 373.9,
  tipoCambio: 3.739,
  fecha: '2026-11-18T15:00:00.000Z',
};

const mountView = async () => {
  const Stub = { render: () => null };
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Stub },
      { path: '/history', name: 'history', component: Stub },
    ],
  });
  await router.push('/');
  return mount(ExchangeView, { global: { plugins: [router] } });
};

type Wrapper = Awaited<ReturnType<typeof mountView>>;

const submit = async (wrapper: Wrapper) => {
  await wrapper.find('form').trigger('submit');
  await flushPromises();
};

describe('ExchangeView', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('asks for the amount when the form is submitted empty', async () => {
    const wrapper = await mountView();

    await submit(wrapper);

    expect(wrapper.text()).toContain('Ingresa el monto a cambiar');
    expect(createTransaction).not.toHaveBeenCalled();
  });

  it.each([
    ['10.123', 'máximo 2 decimales'],
    ['10000000', '7 dígitos enteros'],
    ['0', 'mayor a cero'],
    ['abc', 'debe ser un número'],
  ])('rejects the amount "%s" before calling the API', async (amount, message) => {
    const wrapper = await mountView();
    await wrapper.find('input').setValue(amount);

    await submit(wrapper);

    expect(wrapper.text()).toContain(message);
    expect(createTransaction).not.toHaveBeenCalled();
  });

  it('rejects identical currencies', async () => {
    const wrapper = await mountView();
    await wrapper.find('input').setValue('100');
    await wrapper.findAll('select')[1].setValue('USD');

    await submit(wrapper);

    expect(wrapper.text()).toContain('no pueden ser iguales');
    expect(createTransaction).not.toHaveBeenCalled();
  });

  it('swaps the selected currencies', async () => {
    const wrapper = await mountView();

    await wrapper.find('button[aria-label="Intercambiar monedas"]').trigger('click');

    const [source, target] = wrapper.findAll('select');
    expect((source.element as HTMLSelectElement).value).toBe('PEN');
    expect((target.element as HTMLSelectElement).value).toBe('USD');
  });

  it('sends the operation and shows the converted amount', async () => {
    vi.mocked(createTransaction).mockResolvedValue(transaction);
    const wrapper = await mountView();
    await wrapper.find('input').setValue('100');

    await submit(wrapper);

    expect(createTransaction).toHaveBeenCalledWith({
      monedaOrigen: 'USD',
      monedaDestino: 'PEN',
      monto: 100,
    });
    expect(wrapper.text()).toContain('373.90');
    expect(wrapper.text()).toContain('3.739');
    expect(wrapper.text()).toContain('ABCDEF12');
  });

  it('accepts a decimal comma', async () => {
    vi.mocked(createTransaction).mockResolvedValue(transaction);
    const wrapper = await mountView();
    await wrapper.find('input').setValue('250,50');

    await submit(wrapper);

    expect(createTransaction).toHaveBeenCalledWith(expect.objectContaining({ monto: 250.5 }));
  });

  it('shows the API error without losing what the user typed', async () => {
    vi.mocked(createTransaction).mockRejectedValue(
      new ApiError(503, 'EXCHANGE_RATE_NOT_AVAILABLE', 'Aún no hay un tipo de cambio registrado'),
    );
    const wrapper = await mountView();
    await wrapper.find('input').setValue('100');

    await submit(wrapper);

    expect(wrapper.text()).toContain('Aún no hay un tipo de cambio registrado');
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('100');
  });

  it('clears the result when starting a new operation', async () => {
    vi.mocked(createTransaction).mockResolvedValue(transaction);
    const wrapper = await mountView();
    await wrapper.find('input').setValue('100');
    await submit(wrapper);

    const restart = wrapper.findAll('button').find((button) => button.text() === 'Nueva operación');
    await restart?.trigger('click');

    expect(wrapper.text()).not.toContain('373.90');
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('');
  });
});
