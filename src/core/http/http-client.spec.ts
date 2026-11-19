import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { saveSession } from '@/core/storage/session-storage';
import { buildSession } from '@/test-support/tokens';
import { ApiError } from './api-error';
import { http, onUnauthorized } from './http-client';

const fetchMock = vi.fn();

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const lastRequest = (): [string, RequestInit] =>
  fetchMock.mock.calls.at(-1) as [string, RequestInit];

describe('http client', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('fetch', fetchMock);
    onUnauthorized(() => undefined);
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  it('sends the stored token and a JSON body', async () => {
    const session = buildSession();
    saveSession(session);
    fetchMock.mockResolvedValue(jsonResponse({ id: 'tx-1' }, 201));

    const result = await http.post('/transactions', { monto: 100 });

    const [url, init] = lastRequest();
    expect(result).toEqual({ id: 'tx-1' });
    expect(url).toMatch(/\/v1\/transactions$/);
    expect(init.method).toBe('POST');
    expect(init.body).toBe(JSON.stringify({ monto: 100 }));
    expect(init.headers).toMatchObject({
      Authorization: `Bearer ${session.token}`,
      'Content-Type': 'application/json',
    });
  });

  it('omits the token for public endpoints', async () => {
    saveSession(buildSession());
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }));

    await http.post('/auth/login', {}, { authenticated: false });

    expect(lastRequest()[1].headers).not.toHaveProperty('Authorization');
  });

  it('builds the query string without empty values', async () => {
    fetchMock.mockResolvedValue(jsonResponse([]));

    await http.get('/transactions/history', {
      startDate: '2026-11-01',
      endDate: '',
      userId: undefined,
    });

    expect(lastRequest()[0]).toMatch(/\/history\?startDate=2026-11-01$/);
  });

  it('turns an error response into an ApiError', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ statusCode: 422, code: 'SAME_CURRENCY', message: 'Monedas iguales' }, 422),
    );

    await expect(http.post('/transactions', {})).rejects.toMatchObject({
      status: 422,
      code: 'SAME_CURRENCY',
      message: 'Monedas iguales',
    });
  });

  it('turns an unreachable server into a network ApiError', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(http.get('/transactions/history')).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
    });
    await expect(http.get('/transactions/history')).rejects.toBeInstanceOf(ApiError);
  });

  it('notifies when an authenticated request is rejected as unauthorized', async () => {
    const handler = vi.fn();
    onUnauthorized(handler);
    saveSession(buildSession());
    fetchMock.mockResolvedValue(jsonResponse({ code: 'INVALID_TOKEN', message: 'Expirado' }, 401));

    await expect(http.get('/transactions/history')).rejects.toBeInstanceOf(ApiError);

    expect(handler).toHaveBeenCalledOnce();
  });

  it('does not notify when a login attempt fails', async () => {
    const handler = vi.fn();
    onUnauthorized(handler);
    fetchMock.mockResolvedValue(jsonResponse({ code: 'INVALID_CREDENTIALS', message: 'Mal' }, 401));

    await expect(http.post('/auth/login', {}, { authenticated: false })).rejects.toBeInstanceOf(
      ApiError,
    );

    expect(handler).not.toHaveBeenCalled();
  });
});
