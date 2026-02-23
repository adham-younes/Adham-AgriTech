export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

export async function readJsonBody<T>(req: Request, fallback: T): Promise<T> {
  if (req.method === 'GET' || req.method === 'HEAD') {
    return fallback;
  }

  const raw = await req.text();
  if (!raw.trim()) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error('invalid_json_payload');
  }
}

export function toDateString(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return fallback;
  return parsed.toISOString().slice(0, 10);
}

export function toMonthStart(value: string | undefined, fallback: string): string {
  const dateValue = toDateString(value, fallback);
  return `${dateValue.slice(0, 7)}-01`;
}

export function asNumber(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
