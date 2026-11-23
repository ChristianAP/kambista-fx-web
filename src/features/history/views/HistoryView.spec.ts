import { flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/core/http/api-error';
import type { PageInfo, Paginated } from '@/core/http/pagination';
import { saveSession } from '@/core/storage/session-storage';
import type { Transaction } from '@/shared/domain/transaction';
import { buildSession } from '@/test-support/tokens';
import { fetchHistory } from '../api/history.api';
import HistoryView from './HistoryView.vue';

vi.mock('../api/history.api', () => ({ fetchHistory: vi.fn() }));

const transaction: Transaction = {
  id: 'tx-1',
  monedaOrigen: 'USD',
  monedaDestino: 'PEN',
  monto: 100,
  montoCambiado: 373.9,
  tipoCambio: 3.739,
  fecha: '2026-11-18T15:00:00.000Z',
};

const page = (items: Transaction[], overrides: Partial<PageInfo> = {}): Paginated<Transaction> => ({
  items,
  pagination: { total: items.length, page: 1, limit: 10, totalPages: 1, ...overrides },
});

const mountView = async () => {
  const pinia = createPinia();
  setActivePinia(pinia);
  const wrapper = mount(HistoryView, { global: { plugins: [pinia] } });
  await flushPromises();
  return wrapper;
};

const button = (wrapper: Awaited<ReturnType<typeof mountView>>, label: string) =>
  wrapper.findAll('button').find((candidate) => candidate.text() === label);

describe('HistoryView', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetAllMocks();
  });

  it('loads the last 30 days when it opens', async () => {
    vi.mocked(fetchHistory).mockResolvedValue(page([transaction]));

    const wrapper = await mountView();

    expect(fetchHistory).toHaveBeenCalledOnce();
    expect(vi.mocked(fetchHistory).mock.calls[0][0]).toMatchObject({
      userId: undefined,
      page: 1,
      limit: 10,
    });
    expect(wrapper.text()).toContain('1 operación');
    expect(wrapper.text()).toContain('373.90');
    expect(wrapper.text()).toContain('USD → PEN');
  });

  it('shows a loading placeholder while the request is pending', async () => {
    vi.mocked(fetchHistory).mockReturnValue(new Promise(() => undefined));

    const wrapper = await mountView();

    expect(wrapper.find('[role="status"]').text()).toContain('Cargando operaciones');
  });

  it('shows an empty state when there are no operations', async () => {
    vi.mocked(fetchHistory).mockResolvedValue(page([]));

    const wrapper = await mountView();

    expect(wrapper.text()).toContain('Sin operaciones');
  });

  it('shows the error and lets the user retry', async () => {
    vi.mocked(fetchHistory)
      .mockRejectedValueOnce(new ApiError(0, 'NETWORK_ERROR', 'No se pudo conectar'))
      .mockResolvedValueOnce(page([transaction]));
    const wrapper = await mountView();
    expect(wrapper.text()).toContain('No se pudo conectar');

    await button(wrapper, 'Reintentar')?.trigger('click');
    await flushPromises();

    expect(wrapper.text()).toContain('373.90');
    expect(wrapper.text()).not.toContain('No se pudo conectar');
  });

  it('does not query when the end date is before the start date', async () => {
    vi.mocked(fetchHistory).mockResolvedValue(page([]));
    const wrapper = await mountView();
    const [start, end] = wrapper.findAll('input[type="date"]');
    await start.setValue('2026-11-10');
    await end.setValue('2026-11-01');

    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.text()).toContain('La fecha final no puede ser anterior a la inicial');
    expect(fetchHistory).toHaveBeenCalledOnce();
  });

  it('hides the user filter from regular users', async () => {
    vi.mocked(fetchHistory).mockResolvedValue(page([]));
    saveSession(buildSession());

    const wrapper = await mountView();

    expect(wrapper.text()).not.toContain('ID de usuario');
  });

  it('lets administrators query another user', async () => {
    vi.mocked(fetchHistory).mockResolvedValue(page([]));
    saveSession(buildSession({ rol: 'admin' }));
    const wrapper = await mountView();

    await wrapper.find('input:not([type="date"])').setValue(' user-42 ');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(vi.mocked(fetchHistory).mock.calls.at(-1)?.[0]).toMatchObject({ userId: 'user-42' });
  });

  describe('pagination', () => {
    const firstOfThree = page([transaction], { total: 25, page: 1, totalPages: 3 });
    const secondOfThree = page([{ ...transaction, id: 'tx-2', monto: 50 }], {
      total: 25,
      page: 2,
      totalPages: 3,
    });

    it('shows the total of operations and the current page', async () => {
      vi.mocked(fetchHistory).mockResolvedValue(firstOfThree);

      const wrapper = await mountView();

      expect(wrapper.text()).toContain('25 operaciones');
      expect(wrapper.find('nav[aria-label="Paginación del historial"]').text()).toContain(
        'Página 1 de 3',
      );
    });

    it('hides the controls when everything fits in one page', async () => {
      vi.mocked(fetchHistory).mockResolvedValue(page([transaction]));

      const wrapper = await mountView();

      expect(wrapper.find('nav[aria-label="Paginación del historial"]').exists()).toBe(false);
    });

    it('does not allow going back from the first page', async () => {
      vi.mocked(fetchHistory).mockResolvedValue(firstOfThree);

      const wrapper = await mountView();

      expect(button(wrapper, 'Anterior')?.attributes('disabled')).toBeDefined();
      expect(button(wrapper, 'Siguiente')?.attributes('disabled')).toBeUndefined();
    });

    it('requests the next page', async () => {
      vi.mocked(fetchHistory)
        .mockResolvedValueOnce(firstOfThree)
        .mockResolvedValueOnce(secondOfThree);
      const wrapper = await mountView();

      await button(wrapper, 'Siguiente')?.trigger('click');
      await flushPromises();

      expect(vi.mocked(fetchHistory).mock.calls.at(-1)?.[0]).toMatchObject({ page: 2 });
      expect(wrapper.find('nav[aria-label="Paginación del historial"]').text()).toContain(
        'Página 2 de 3',
      );
    });

    it('goes back to the first page when the filters change', async () => {
      vi.mocked(fetchHistory)
        .mockResolvedValueOnce(firstOfThree)
        .mockResolvedValueOnce(secondOfThree)
        .mockResolvedValueOnce(firstOfThree);
      const wrapper = await mountView();
      await button(wrapper, 'Siguiente')?.trigger('click');
      await flushPromises();

      await wrapper.find('form').trigger('submit');
      await flushPromises();

      expect(vi.mocked(fetchHistory).mock.calls.at(-1)?.[0]).toMatchObject({ page: 1 });
    });

    it('retries the page that failed', async () => {
      vi.mocked(fetchHistory)
        .mockResolvedValueOnce(firstOfThree)
        .mockRejectedValueOnce(new ApiError(0, 'NETWORK_ERROR', 'No se pudo conectar'))
        .mockResolvedValueOnce(secondOfThree);
      const wrapper = await mountView();
      await button(wrapper, 'Siguiente')?.trigger('click');
      await flushPromises();

      await button(wrapper, 'Reintentar')?.trigger('click');
      await flushPromises();

      expect(vi.mocked(fetchHistory).mock.calls.at(-1)?.[0]).toMatchObject({ page: 2 });
      expect(wrapper.text()).not.toContain('No se pudo conectar');
    });
  });
});
