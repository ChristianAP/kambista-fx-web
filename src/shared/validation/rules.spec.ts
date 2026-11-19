import { describe, expect, it } from 'vitest';
import { all, emailFormat, maxLength, minLength, required } from './rules';

describe('validation rules', () => {
  it('required rejects empty and blank values', () => {
    const rule = required('Obligatorio');

    expect(rule('', {})).toBe('Obligatorio');
    expect(rule('   ', {})).toBe('Obligatorio');
    expect(rule('texto', {})).toBeNull();
  });

  it('minLength and maxLength ignore surrounding spaces', () => {
    expect(minLength(3, 'corto')(' ab ', {})).toBe('corto');
    expect(minLength(3, 'corto')('abc', {})).toBeNull();
    expect(maxLength(3, 'largo')(' abcd ', {})).toBe('largo');
    expect(maxLength(3, 'largo')('abc', {})).toBeNull();
  });

  it.each([
    ['juan@example.com', true],
    ['  juan@example.com ', true],
    ['juan', false],
    ['juan@', false],
    ['juan@example', false],
    ['jua n@example.com', false],
  ])('emailFormat validates "%s"', (value, valid) => {
    expect(emailFormat('Inválido')(value, {})).toBe(valid ? null : 'Inválido');
  });

  it('all returns the first failing message and skips the rest', () => {
    const calls: string[] = [];
    const first = (value: string) => (calls.push('first'), value ? null : 'primero');
    const second = (value: string) => (calls.push('second'), value.length > 2 ? null : 'segundo');

    expect(all(first, second)('', {})).toBe('primero');
    expect(calls).toEqual(['first']);
    expect(all(first, second)('ab', {})).toBe('segundo');
    expect(all(first, second)('abc', {})).toBeNull();
  });
});
