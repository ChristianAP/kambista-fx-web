import type { Currency } from '@/shared/domain/currency';

const LOCALE = 'es-PE';
const TIME_ZONE = 'America/Lima';

const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: TIME_ZONE,
});

const rateFormatter = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 3,
  maximumFractionDigits: 4,
});

export const formatMoney = (amount: number, currency: Currency): string =>
  new Intl.NumberFormat(LOCALE, { style: 'currency', currency }).format(amount);

export const formatRate = (rate: number): string => rateFormatter.format(rate);

export const formatDateTime = (isoDate: string): string =>
  dateTimeFormatter.format(new Date(isoDate));
