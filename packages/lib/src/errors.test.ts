import { describe, expect, it } from 'vitest';
import { mapHttpError } from './errors';

describe('mapHttpError', () => {
  it('maps rate limit errors to retriable RATE_LIMIT', () => {
    expect(mapHttpError(new Error('HTTP 429'), 'nasa')).toEqual({
      code: 'RATE_LIMIT',
      message: 'nasa: upstream rate limit reached',
      retriable: true
    });
  });

  it('maps auth errors to UNAUTHORIZED', () => {
    expect(mapHttpError(new Error('HTTP 401'), 'sentinel').code).toBe('UNAUTHORIZED');
  });

  it('maps generic HTTP errors to UPSTREAM', () => {
    expect(mapHttpError(new Error('HTTP 500'), 'wapor').code).toBe('UPSTREAM');
  });

  it('maps unknown errors safely', () => {
    expect(mapHttpError('boom', 'client').code).toBe('UNKNOWN');
  });
});
