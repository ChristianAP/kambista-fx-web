import { describe, expect, it } from 'vitest';
import { daysAgo, toDateInputValue } from './dates';
import { formatDateTime, formatMoney, formatRate } from './formatters';

const normalizeSpaces = (value: string): string => value.replace(/\s/g, ' ');

describe('formatters', () => {
  it('formats money with the currency of the amount', () => {
    expect(normalizeSpaces(formatMoney(373.9, 'PEN'))).toBe('S/ 373.90');
    expect(normalizeSpaces(formatMoney(1250, 'USD'))).toBe('USD 1,250.00');
  });

  it('keeps at least three decimals in exchange rates', () => {
    expect(formatRate(3.739)).toBe('3.739');
    expect(formatRate(3.7)).toBe('3.700');
  });

  it('shows dates in Lima time', () => {
    const formatted = formatDateTime('2026-11-18T15:00:00.000Z');

    expect(formatted).toMatch(/18 nov\.? 2026/);
    expect(formatted).toContain('10:00');
  });
});

describe('dates', () => {
  it('formats a date as the value of a date input', () => {
    expect(toDateInputValue(new Date(2026, 10, 5))).toBe('2026-11-05');
  });

  it('moves a date back by whole days', () => {
    expect(toDateInputValue(daysAgo(30, new Date(2026, 10, 18)))).toBe('2026-10-19');
  });
});
