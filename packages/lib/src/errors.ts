export type ApiErrorCode = 'RATE_LIMIT' | 'UNAUTHORIZED' | 'NOT_FOUND' | 'UPSTREAM' | 'UNKNOWN';

export type ApiClientError = {
  code: ApiErrorCode;
  message: string;
  retriable: boolean;
};

export function mapHttpError(error: unknown, context: string): ApiClientError {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes('HTTP 401') || message.includes('HTTP 403')) {
    return { code: 'UNAUTHORIZED', message: `${context}: unauthorized upstream request`, retriable: false };
  }
  if (message.includes('HTTP 404')) {
    return { code: 'NOT_FOUND', message: `${context}: resource was not found`, retriable: false };
  }
  if (message.includes('HTTP 429') || message.toLowerCase().includes('rate limit')) {
    return { code: 'RATE_LIMIT', message: `${context}: upstream rate limit reached`, retriable: true };
  }
  if (message.includes('HTTP')) {
    return { code: 'UPSTREAM', message: `${context}: upstream request failed`, retriable: true };
  }

  return { code: 'UNKNOWN', message: `${context}: unexpected client error`, retriable: false };
}
