import { describe, expect, it } from 'vitest';
import { estimateEt0 } from './et0';

describe('estimateEt0', () => {
  it('returns higher value for hotter and drier weather', () => {
    expect(estimateEt0(36, 3, 25)).toBeGreaterThan(estimateEt0(24, 1, 55));
  });

  it('increases with wind speed under same temperature/humidity', () => {
    expect(estimateEt0(30, 4, 40)).toBeGreaterThan(estimateEt0(30, 1, 40));
  });

  it('stays deterministic with two decimals', () => {
    expect(estimateEt0(29.3, 2.7, 41.2)).toBe(5.01);
  });
});
