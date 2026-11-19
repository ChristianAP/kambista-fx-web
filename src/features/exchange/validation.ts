import type { Currency } from '@/shared/domain/currency';
import { all, required, type Rule } from '@/shared/validation/rules';

export const MAX_INTEGER_DIGITS = 7;
export const MAX_DECIMAL_DIGITS = 2;

const AMOUNT_PATTERN = /^\d+(\.\d+)?$/;

export const normalizeAmount = (raw: string): string => raw.trim().replace(',', '.');

const splitAmount = (raw: string): { integer: string; decimals: string } => {
  const [integer = '', decimals = ''] = normalizeAmount(raw).split('.');
  return { integer: integer.replace(/^0+(?=\d)/, ''), decimals };
};

const isNumeric: Rule<string> = (value) =>
  AMOUNT_PATTERN.test(normalizeAmount(value))
    ? null
    : 'El monto debe ser un número, sin letras ni signos';

const hasValidDecimals: Rule<string> = (value) =>
  splitAmount(value).decimals.length <= MAX_DECIMAL_DIGITS
    ? null
    : `El monto admite como máximo ${MAX_DECIMAL_DIGITS} decimales`;

const hasValidIntegerDigits: Rule<string> = (value) =>
  splitAmount(value).integer.length <= MAX_INTEGER_DIGITS
    ? null
    : `El monto no puede superar ${MAX_INTEGER_DIGITS} dígitos enteros (máximo 9,999,999.99)`;

const isPositive: Rule<string> = (value) =>
  Number(normalizeAmount(value)) > 0 ? null : 'El monto debe ser mayor a cero';

export const amountRule = all(
  required('Ingresa el monto a cambiar'),
  isNumeric,
  hasValidDecimals,
  hasValidIntegerDigits,
  isPositive,
);

export const currencyRule = required('Selecciona una moneda');

export const differsFromSource: Rule<Currency, { sourceCurrency: Currency }> = (
  targetCurrency,
  { sourceCurrency },
) =>
  targetCurrency === sourceCurrency
    ? 'La moneda de origen y la de destino no pueden ser iguales'
    : null;
