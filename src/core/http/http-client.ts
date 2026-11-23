import { API_URL } from '@/core/config';
import { loadSession } from '@/core/storage/session-storage';
import { ApiError } from './api-error';

type Method = 'GET' | 'POST';
type Query = Record<string, string | undefined>;
type SessionRenewer = () => Promise<boolean>;

interface RequestOptions {
  query?: Query;
  body?: unknown;
  authenticated?: boolean;
}

let unauthorizedHandler: (() => void) | null = null;
let sessionRenewer: SessionRenewer | null = null;

export const onUnauthorized = (handler: () => void): void => {
  unauthorizedHandler = handler;
};

export const setSessionRenewer = (renewer: SessionRenewer | null): void => {
  sessionRenewer = renewer;
};

const buildUrl = (path: string, query: Query = {}): string => {
  const entries = Object.entries(query).filter((entry): entry is [string, string] =>
    Boolean(entry[1]),
  );
  const search = new URLSearchParams(entries).toString();
  return search ? `${API_URL}${path}?${search}` : `${API_URL}${path}`;
};

const currentToken = (): string | null => loadSession()?.token ?? null;

const send = async (
  method: Method,
  path: string,
  { query, body }: RequestOptions,
  token: string | null,
): Promise<Response> => {
  try {
    return await fetch(buildUrl(path, query), {
      method,
      headers: {
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw ApiError.network();
  }
};

const dispatch = async (
  method: Method,
  path: string,
  options: RequestOptions,
  token: string | null,
  canRenew = true,
): Promise<Response> => {
  const response = await send(method, path, options, token);

  if (response.status !== 401 || !token) {
    return response;
  }

  if (canRenew && sessionRenewer && (await sessionRenewer())) {
    return dispatch(method, path, options, currentToken(), false);
  }

  unauthorizedHandler?.();
  return response;
};

const call = async (
  method: Method,
  path: string,
  options: RequestOptions = {},
): Promise<{ response: Response; payload: unknown }> => {
  const token = options.authenticated === false ? null : currentToken();
  const response = await dispatch(method, path, options, token);
  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw ApiError.fromResponse(response.status, payload);
  }

  return { response, payload };
};

const request = async <T>(method: Method, path: string, options?: RequestOptions): Promise<T> =>
  (await call(method, path, options)).payload as T;

export const http = {
  get: <T>(path: string, query?: Query) => request<T>('GET', path, { query }),

  post: <T>(path: string, body: unknown, options: Pick<RequestOptions, 'authenticated'> = {}) =>
    request<T>('POST', path, { ...options, body }),
};
