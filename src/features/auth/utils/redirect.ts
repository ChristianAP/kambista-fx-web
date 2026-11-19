export const DEFAULT_REDIRECT = '/exchange';

export const resolveRedirect = (target: unknown): string =>
  typeof target === 'string' && target.startsWith('/') && !target.startsWith('//')
    ? target
    : DEFAULT_REDIRECT;
