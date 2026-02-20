create table if not exists public.rate_limit_counters (
  rate_key text primary key,
  window_started_at timestamptz not null,
  count int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  status text not null check (status in ('success','failure')),
  target_table text,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_org_created_idx on public.audit_logs (org_id, created_at desc);
create index if not exists audit_logs_event_created_idx on public.audit_logs (event_type, created_at desc);

create or replace function public.consume_rate_limit(
  p_key text,
  p_max int,
  p_window_seconds int
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_window_start timestamptz := to_timestamp(floor(extract(epoch from v_now) / p_window_seconds) * p_window_seconds);
  v_count int;
begin
  insert into public.rate_limit_counters(rate_key, window_started_at, count, updated_at)
  values (p_key, v_window_start, 1, v_now)
  on conflict (rate_key) do update
    set count = case
      when public.rate_limit_counters.window_started_at = excluded.window_started_at then public.rate_limit_counters.count + 1
      else 1
    end,
    window_started_at = excluded.window_started_at,
    updated_at = excluded.updated_at
  returning count into v_count;

  return v_count <= p_max;
end;
$$;

create or replace function public.record_audit_event(
  p_org_id uuid,
  p_event_type text,
  p_status text,
  p_target_table text default null,
  p_target_id text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.audit_logs(org_id, actor_user_id, event_type, status, target_table, target_id, metadata)
  values (p_org_id, auth.uid(), p_event_type, p_status, p_target_table, p_target_id, coalesce(p_metadata, '{}'::jsonb));
$$;

revoke all on function public.consume_rate_limit(text, int, int) from public;
revoke all on function public.record_audit_event(uuid, text, text, text, text, jsonb) from public;
grant execute on function public.consume_rate_limit(text, int, int) to service_role;
grant execute on function public.record_audit_event(uuid, text, text, text, text, jsonb) to service_role;

alter table public.rate_limit_counters enable row level security;
alter table public.audit_logs enable row level security;

create policy "service manages rate limits" on public.rate_limit_counters for all to service_role using (true) with check (true);
create policy "members read audit logs" on public.audit_logs for select using (org_id is not null and public.is_org_member(org_id));
create policy "service writes audit logs" on public.audit_logs for insert to service_role with check (true);
