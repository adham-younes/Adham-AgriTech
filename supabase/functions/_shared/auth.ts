import { jsonResponse } from './http.ts';

type JwtPayload = {
  role?: string;
  app_metadata?: { role?: string };
};

export type AuthMode = 'service_role' | 'cron_secret';

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const normalized = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const decoded = atob(normalized);
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(' ');
  if (!scheme || !token || scheme.toLowerCase() !== 'bearer') return null;
  return token;
}

export function authorizeEdgeRequest(req: Request): { ok: true; mode: AuthMode } | { ok: false; response: Response } {
  const cronSecret = Deno.env.get('SUPABASE_CRON_SECRET');
  const cronHeader = req.headers.get('x-cron-secret');

  if (cronSecret && cronHeader && cronHeader === cronSecret) {
    return { ok: true, mode: 'cron_secret' };
  }

  const token = extractBearerToken(req.headers.get('Authorization'));
  if (!token) {
    return { ok: false, response: jsonResponse({ ok: false, error: 'missing_authorization' }, 401) };
  }

  const payload = decodeJwtPayload(token);
  const role = payload?.role ?? payload?.app_metadata?.role;

  if (role === 'service_role') {
    return { ok: true, mode: 'service_role' };
  }

  return { ok: false, response: jsonResponse({ ok: false, error: 'forbidden' }, 403) };
}
