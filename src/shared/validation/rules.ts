export type Rule<T, V = unknown> = (value: T, values: V) => string | null;

export type Rules<V> = { [K in keyof V]?: Rule<V[K], V> };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const required =
  (message: string): Rule<string> =>
  (value) =>
    value.trim() === '' ? message : null;

export const minLength =
  (min: number, message: string): Rule<string> =>
  (value) =>
    value.trim().length < min ? message : null;

export const maxLength =
  (max: number, message: string): Rule<string> =>
  (value) =>
    value.trim().length > max ? message : null;

export const emailFormat =
  (message: string): Rule<string> =>
  (value) =>
    EMAIL_PATTERN.test(value.trim()) ? null : message;

export const all =
  <T, V = unknown>(...rules: Rule<T, V>[]): Rule<T, V> =>
  (value, values) =>
    rules.reduce<string | null>((message, rule) => message ?? rule(value, values), null);
