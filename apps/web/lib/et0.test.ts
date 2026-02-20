import { describe, expect, it } from 'vitest';
import { estimateEt0 } from './et0';

describe('estimateEt0', () => {
  it('returns higher value for hotter and drier weather', () => {
    expect(estimateEt0(36, 3, 25)).toBeGreaterThan(estimateEt0(24, 1, 55));
  });

  it('does not add temperature bonus when temperature is below 20°C', () => {
    expect(estimateEt0(10, 2, 40)).toBe(estimateEt0(20, 2, 40));
  });

  it('increases ET0 when wind speed increases with equal conditions', () => {
    expect(estimateEt0(28, 4, 50)).toBeGreaterThan(estimateEt0(28, 1, 50));
  });

  it('returns a number rounded to two decimals', () => {
    const value = estimateEt0(21, 3.333, 43.21);
    expect(value).toBe(Number(value.toFixed(2)));
  });

  it('handles edge humidity values from 0 to 100', () => {
    expect(estimateEt0(30, 2, 0)).toBeGreaterThan(estimateEt0(30, 2, 100));
  });
});
