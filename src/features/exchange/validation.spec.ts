import { describe, expect, it } from 'vitest';
import { amountRule, differsFromSource, normalizeAmount } from './validation';

describe('amountRule', () => {
  it.each(['1', '100', '0.5', '250,50', '9999999.99', '0000100', ' 12.30 '])(
    'accepts "%s"',
    (value) => {
      expect(amountRule(value, {})).toBeNull();
    },
  );

  it.each([
    ['', 'Ingresa el monto a cambiar'],
    ['   ', 'Ingresa el monto a cambiar'],
    ['abc', 'El monto debe ser un número, sin letras ni signos'],
    ['-5', 'El monto debe ser un número, sin letras ni signos'],
    ['1e3', 'El monto debe ser un número, sin letras ni signos'],
    ['10.123', 'El monto admite como máximo 2 decimales'],
    ['10000000', 'El monto no puede superar 7 dígitos enteros (máximo 9,999,999.99)'],
    ['12345678.9', 'El monto no puede superar 7 dígitos enteros (máximo 9,999,999.99)'],
    ['0', 'El monto debe ser mayor a cero'],
    ['0.00', 'El monto debe ser mayor a cero'],
  ])('rejects "%s" with a clear message', (value, message) => {
    expect(amountRule(value, {})).toBe(message);
  });
});

describe('normalizeAmount', () => {
  it('trims spaces and accepts a decimal comma', () => {
    expect(normalizeAmount(' 1250,75 ')).toBe('1250.75');
  });
});

describe('differsFromSource', () => {
  it('rejects the same currency on both sides', () => {
    expect(differsFromSource('USD', { sourceCurrency: 'USD' })).toBe(
      'La moneda de origen y la de destino no pueden ser iguales',
    );
  });

  it('accepts different currencies', () => {
    expect(differsFromSource('PEN', { sourceCurrency: 'USD' })).toBeNull();
  });
});
