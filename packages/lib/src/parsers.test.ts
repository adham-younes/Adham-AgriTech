import { describe, expect, it } from 'vitest';
import { parseNasaPowerDaily, parseWaporMosaicsetCount } from './parsers';

describe('parsers', () => {
  it('parses nasa daily metrics for a specific date', () => {
    const payload = {
      properties: {
        parameter: {
          T2M: { '20260216': 31.2 },
          WS2M: { '20260216': 2.4 },
          RH2M: { '20260216': 42.1 },
          PRECTOTCORR: { '20260216': 0.5 }
        }
      }
    };

    expect(parseNasaPowerDaily(payload, '2026-02-16')).toEqual({
      t2m: 31.2,
      ws2m: 2.4,
      rh2m: 42.1,
      precipitation: 0.5
    });
  });

  it('returns nulls for missing or malformed nasa payloads', () => {
    expect(parseNasaPowerDaily({}, '2026-02-16')).toEqual({
      t2m: null,
      ws2m: null,
      rh2m: null,
      precipitation: null
    });
  });

  it('counts wapor response items', () => {
    expect(parseWaporMosaicsetCount({ response: [{ id: 1 }, { id: 2 }] })).toBe(2);
  });

  it('returns zero when wapor response items are absent', () => {
    expect(parseWaporMosaicsetCount({ meta: {} })).toBe(0);
  });
});
