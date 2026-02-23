import 'server-only';
import { createClient } from '@supabase/supabase-js';

function resolveSupabaseUrl(): string | null {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? null;
}

function resolveAnonKey(): string | null {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    null
  );
}

function resolveServiceKey(): string | null {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY ?? null;
}

export function createSupabaseAnonServerClient() {
  const url = resolveSupabaseUrl();
  const key = resolveAnonKey();
  if (!url || !key) throw new Error('missing_supabase_anon_env');

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

export function createSupabaseServiceServerClient() {
  const url = resolveSupabaseUrl();
  const key = resolveServiceKey();
  if (!url || !key) throw new Error('missing_supabase_service_env');

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
