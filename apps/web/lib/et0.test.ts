import { describe, expect, it } from 'vitest';
import { estimateEt0 } from './et0';

describe('estimateEt0', () => {
  it('returns higher value for hotter and drier weather', () => {
    expect(estimateEt0(36, 3, 25)).toBeGreaterThan(estimateEt0(24, 1, 55));
  });
});
