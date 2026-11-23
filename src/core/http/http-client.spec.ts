import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { saveSession } from '@/core/storage/session-storage';
import { buildSession } from '@/test-support/tokens';
import { ApiError } from './api-error';
import { http, onUnauthorized, setSessionRenewer } from './http-client';

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
    setSessionRenewer(null);
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

  it('resolves an empty response body', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(http.post('/auth/logout', {}, { authenticated: false })).resolves.toBeNull();
  });

  describe('unauthorized responses', () => {
    it('notifies when an authenticated request is rejected and there is no way to renew', async () => {
      const handler = vi.fn();
      onUnauthorized(handler);
      saveSession(buildSession());
      fetchMock.mockResolvedValue(
        jsonResponse({ code: 'INVALID_TOKEN', message: 'Expirado' }, 401),
      );

      await expect(http.get('/transactions/history')).rejects.toBeInstanceOf(ApiError);

      expect(handler).toHaveBeenCalledOnce();
    });

    it('does not notify when a login attempt fails', async () => {
      const handler = vi.fn();
      onUnauthorized(handler);
      const renewer = vi.fn();
      setSessionRenewer(renewer);
      fetchMock.mockResolvedValue(
        jsonResponse({ code: 'INVALID_CREDENTIALS', message: 'Mal' }, 401),
      );

      await expect(http.post('/auth/login', {}, { authenticated: false })).rejects.toBeInstanceOf(
        ApiError,
      );

      expect(handler).not.toHaveBeenCalled();
      expect(renewer).not.toHaveBeenCalled();
    });

    it('renews the session and repeats the request with the new token', async () => {
      const handler = vi.fn();
      onUnauthorized(handler);
      const renewed = { ...buildSession(), token: 'token-renovado' };
      saveSession(buildSession());
      setSessionRenewer(async () => {
        saveSession(renewed);
        return true;
      });
      fetchMock
        .mockResolvedValueOnce(jsonResponse({ code: 'INVALID_TOKEN', message: 'Expirado' }, 401))
        .mockResolvedValueOnce(jsonResponse({ ok: true }));

      const result = await http.get('/transactions/history');

      expect(result).toEqual({ ok: true });
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(lastRequest()[1].headers).toMatchObject({ Authorization: 'Bearer token-renovado' });
      expect(handler).not.toHaveBeenCalled();
    });

    it('notifies when the session cannot be renewed', async () => {
      const handler = vi.fn();
      onUnauthorized(handler);
      saveSession(buildSession());
      setSessionRenewer(async () => false);
      fetchMock.mockResolvedValue(
        jsonResponse({ code: 'INVALID_TOKEN', message: 'Expirado' }, 401),
      );

      await expect(http.get('/transactions/history')).rejects.toBeInstanceOf(ApiError);

      expect(fetchMock).toHaveBeenCalledOnce();
      expect(handler).toHaveBeenCalledOnce();
    });

    it('renews only once when the repeated request is rejected again', async () => {
      const handler = vi.fn();
      onUnauthorized(handler);
      saveSession(buildSession());
      const renewer = vi.fn(async () => true);
      setSessionRenewer(renewer);
      fetchMock.mockResolvedValue(
        jsonResponse({ code: 'INVALID_TOKEN', message: 'Expirado' }, 401),
      );

      await expect(http.get('/transactions/history')).rejects.toBeInstanceOf(ApiError);

      expect(renewer).toHaveBeenCalledOnce();
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(handler).toHaveBeenCalledOnce();
    });

    it('reports the failure of the renewal without closing the session', async () => {
      const handler = vi.fn();
      onUnauthorized(handler);
      saveSession(buildSession());
      setSessionRenewer(async () => {
        throw ApiError.network();
      });
      fetchMock.mockResolvedValue(
        jsonResponse({ code: 'INVALID_TOKEN', message: 'Expirado' }, 401),
      );

      await expect(http.get('/transactions/history')).rejects.toMatchObject({
        code: 'NETWORK_ERROR',
      });

      expect(handler).not.toHaveBeenCalled();
    });
  });
});
