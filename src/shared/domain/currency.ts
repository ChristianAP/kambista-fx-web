export const CURRENCIES = ['USD', 'PEN'] as const;

export type Currency = (typeof CURRENCIES)[number];

export const CURRENCY_LABELS: Record<Currency, string> = {
  USD: 'Dólares (USD)',
  PEN: 'Soles (PEN)',
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: 'USD',
  PEN: 'S/',
};

export const CURRENCY_OPTIONS = CURRENCIES.map((value) => ({
  value,
  label: CURRENCY_LABELS[value],
}));
