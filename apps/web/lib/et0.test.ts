import { describe, expect, it } from 'vitest';
import { estimateEt0 } from './et0';

describe('estimateEt0', () => {
  it('returns higher value for hotter and drier weather', () => {
    expect(estimateEt0(36, 3, 25)).toBeGreaterThan(estimateEt0(24, 1, 55));
  });

  const cases = [
    {
      name: 'normal',
      input: { t2m: 30, ws2m: 2.5, rh2m: 40 },
      expected: 5.1
    },
    {
      name: 'edge',
      input: { t2m: 18, ws2m: 0, rh2m: 100 },
      expected: 2.5
    },
    {
      name: 'failure',
      input: { t2m: Number.NaN, ws2m: 1, rh2m: 50 },
      expected: Number.NaN
    }
  ] as const;

  it.each(cases)('handles $name case', ({ input, expected }) => {
    const value = estimateEt0(input.t2m, input.ws2m, input.rh2m);
    if (Number.isNaN(expected)) {
      expect(Number.isNaN(value)).toBe(true);
      return;
    }
    expect(value).toBe(expected);
  });

  it('applies two-decimal rounding to conversion output', () => {
    expect(estimateEt0(29.876, 2.333, 54.321)).toBe(4.79);
  });
});
