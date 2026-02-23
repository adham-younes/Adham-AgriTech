-- Adham AgriTech integration migration for pre-existing production schema.
-- This migration is idempotent and avoids destructive changes.

create extension if not exists pgcrypto;
create extension if not exists pg_cron;
create extension if not exists pg_net;
create extension if not exists supabase_vault;

-- Enums used by app/edge pipeline.
do $$
begin
  if not exists (
    select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'plan_type'
  ) then
    create type public.plan_type as enum ('free', 'pro', 'b2b');
  end if;

  if not exists (
    select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'org_role'
  ) then
    create type public.org_role as enum ('owner', 'admin', 'member');
  end if;

  if not exists (
    select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'irrigation_method'
  ) then
    create type public.irrigation_method as enum ('flood', 'drip', 'sprinkler', 'other');
  end if;

  if not exists (
    select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'alert_type'
  ) then
    create type public.alert_type as enum ('heat', 'wind', 'cold', 'ndvi_drop', 'water_stress', 'system');
  end if;

  if not exists (
    select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'report_type'
  ) then
    create type public.report_type as enum ('wapor_water_productivity', 'monthly_summary');
  end if;

  if not exists (
    select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'report_status'
  ) then
    create type public.report_status as enum ('queued', 'ready', 'failed');
  end if;
end
$$;

-- Compatibility views over tenant model.
do $$
declare
  organizations_kind "char";
  members_kind "char";
begin
  select c.relkind into organizations_kind
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relname = 'organizations';

  if organizations_kind is null or organizations_kind = 'v' then
    execute $view$
      create or replace view public.organizations as
      select
        t.id,
        t.name,
        (
          case
            when lower(coalesce(t.pilot_package, '')) like '%b2b%' then 'b2b'
            when lower(coalesce(t.pilot_package, '')) like '%enterprise%' then 'b2b'
            when lower(coalesce(t.pilot_package, '')) like '%pro%' then 'pro'
            else 'free'
          end
        )::public.plan_type as plan,
        null::uuid as owner_id,
        t.created_at
      from public.tenants t;
    $view$;
  end if;

  select c.relkind into members_kind
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relname = 'organization_members';

  if members_kind is null or members_kind = 'v' then
    execute $view$
      create or replace view public.organization_members as
      select
        m.tenant_id as org_id,
        m.user_id,
        (
          case
            when m.role::text = 'owner' then 'owner'
            when m.role::text in ('ops_manager', 'agronomist') then 'admin'
            else 'member'
          end
        )::public.org_role as role
      from public.memberships m;
    $view$;
  end if;
end
$$;

create or replace function public.is_org_member(target_org uuid)
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships m
    where m.tenant_id = target_org and m.user_id = auth.uid()
  );
$$;

create or replace function public.can_manage_article()
returns boolean
language sql
stable
set search_path = public
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

-- Extend existing farms/fields tables for app compatibility.
alter table public.farms add column if not exists org_id uuid;
alter table public.farms add column if not exists country text;
alter table public.farms add column if not exists governorate text;
alter table public.farms add column if not exists location_lat numeric;
alter table public.farms add column if not exists location_lng numeric;

update public.farms
set org_id = tenant_id
where org_id is null;

create index if not exists farms_org_id_idx on public.farms (org_id);

alter table public.fields add column if not exists geometry jsonb;
alter table public.fields add column if not exists centroid_lat numeric;
alter table public.fields add column if not exists centroid_lng numeric;
alter table public.fields add column if not exists crop_type text;
alter table public.fields add column if not exists planting_date date;
alter table public.fields add column if not exists irrigation_method public.irrigation_method default 'other';

update public.fields
set crop_type = coalesce(crop_type, current_crop)
where crop_type is null;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'fields' and column_name = 'boundary'
  ) then
    begin
      execute $sql$
        update public.fields
        set
          geometry = coalesce(geometry, st_asgeojson(boundary)::jsonb),
          centroid_lat = coalesce(centroid_lat, st_y(st_centroid(boundary))),
          centroid_lng = coalesce(centroid_lng, st_x(st_centroid(boundary)))
        where boundary is not null
      $sql$;
    exception
      when undefined_function then
        null;
    end;
  end if;
end
$$;

create index if not exists fields_farm_id_idx on public.fields (farm_id);

-- Operational timeseries tables required by edge pipeline.
create table if not exists public.weather_snapshots_daily (
  id uuid primary key default gen_random_uuid(),
  field_id uuid not null references public.fields(id) on delete cascade,
  date date not null,
  source text not null default 'NASA_POWER',
  payload jsonb not null,
  created_at timestamptz not null default now(),
  unique (field_id, date)
);

create table if not exists public.irrigation_recommendations_daily (
  id uuid primary key default gen_random_uuid(),
  field_id uuid not null references public.fields(id) on delete cascade,
  date date not null,
  et0_mm numeric not null,
  recommended_mm numeric not null,
  reasoning text not null,
  confidence numeric not null,
  created_at timestamptz not null default now(),
  unique (field_id, date)
);

create table if not exists public.satellite_ndvi_timeseries (
  id uuid primary key default gen_random_uuid(),
  field_id uuid not null references public.fields(id) on delete cascade,
  date date not null,
  source text not null default 'SENTINEL_HUB',
  ndvi_mean numeric not null,
  cloud_pct numeric,
  preview_url text,
  created_at timestamptz not null default now(),
  unique (field_id, date)
);

create index if not exists weather_snapshots_daily_field_date_desc_idx
  on public.weather_snapshots_daily (field_id, date desc);
create index if not exists satellite_ndvi_timeseries_field_date_desc_idx
  on public.satellite_ndvi_timeseries (field_id, date desc);

-- Alert compatibility columns for upsert/idempotency.
alter table public.alerts add column if not exists date date;
alter table public.alerts add column if not exists type public.alert_type;
alter table public.alerts add column if not exists resolved_at timestamptz;

create index if not exists alerts_field_date_type_idx on public.alerts (field_id, date desc, type);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'alerts_field_date_type_unique'
  ) then
    alter table public.alerts
      add constraint alerts_field_date_type_unique unique (field_id, date, type);
  end if;
exception
  when duplicate_table then
    null;
end
$$;

-- Reports compatibility columns.
alter table public.reports add column if not exists org_id uuid;
alter table public.reports add column if not exists farm_id uuid;
alter table public.reports add column if not exists field_id uuid;
alter table public.reports add column if not exists month date;
alter table public.reports add column if not exists type public.report_type;
alter table public.reports add column if not exists status public.report_status;
alter table public.reports add column if not exists public_token text;
alter table public.reports add column if not exists artifact_url text;
alter table public.reports add column if not exists payload jsonb;

update public.reports set org_id = coalesce(org_id, tenant_id) where org_id is null;
update public.reports set month = coalesce(month, date_trunc('month', generated_at)::date) where month is null;
update public.reports set type = coalesce(
  type,
  case
    when lower(coalesce(report_type, '')) like '%wapor%' then 'wapor_water_productivity'::public.report_type
    else 'monthly_summary'::public.report_type
  end
) where type is null;
update public.reports set status = coalesce(status, 'ready'::public.report_status) where status is null;
update public.reports set payload = coalesce(payload, metadata, '{}'::jsonb) where payload is null;
update public.reports set artifact_url = coalesce(artifact_url, nullif(storage_path, '')) where artifact_url is null;
update public.reports set public_token = replace(gen_random_uuid()::text, '-', '') where public_token is null;

with ranked_reports as (
  select
    id,
    row_number() over (
      partition by org_id, month, type
      order by created_at desc, id desc
    ) as rn
  from public.reports
  where org_id is not null and month is not null and type is not null
)
delete from public.reports r
using ranked_reports rr
where r.id = rr.id
  and rr.rn > 1;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'reports_public_token_unique'
  ) then
    alter table public.reports
      add constraint reports_public_token_unique unique (public_token);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'reports_org_month_type_unique'
  ) then
    alter table public.reports
      add constraint reports_org_month_type_unique unique (org_id, month, type);
  end if;
end
$$;

create index if not exists reports_org_month_idx on public.reports (org_id, month desc);

create or replace view public.public_reports as
select public_token, month, type, status, artifact_url, payload, created_at
from public.reports
where status = 'ready'
  and public_token is not null;

alter view public.public_reports set (security_invoker = true);
grant select on public.public_reports to anon, authenticated;

-- App support tables.
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null,
  content_md text not null,
  tags text[] not null default '{}',
  locale text not null default 'ar',
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.plan_limits (
  plan public.plan_type primary key,
  fields_limit int not null,
  reports_per_month int not null,
  ndvi_checks_per_month int not null
);

insert into public.plan_limits (plan, fields_limit, reports_per_month, ndvi_checks_per_month)
values
  ('free', 1, 1, 4),
  ('pro', 10, 100, 40),
  ('b2b', 100, 1000, 400)
on conflict (plan) do update
set
  fields_limit = excluded.fields_limit,
  reports_per_month = excluded.reports_per_month,
  ndvi_checks_per_month = excluded.ndvi_checks_per_month;

create table if not exists public.external_api_cache (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  cache_key text not null unique,
  payload jsonb not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists external_api_cache_provider_key_idx
  on public.external_api_cache (provider, cache_key);
create index if not exists external_api_cache_expires_at_idx
  on public.external_api_cache (expires_at);

-- Temporal archive/pruning.
create table if not exists public.weather_snapshots_daily_archive (
  like public.weather_snapshots_daily including defaults,
  archived_at timestamptz not null default now(),
  archived_reason text not null default 'retention_policy'
);

create table if not exists public.satellite_ndvi_timeseries_archive (
  like public.satellite_ndvi_timeseries including defaults,
  archived_at timestamptz not null default now(),
  archived_reason text not null default 'retention_policy'
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'weather_snapshots_daily_archive_id_unique'
  ) then
    alter table public.weather_snapshots_daily_archive
      add constraint weather_snapshots_daily_archive_id_unique unique (id);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'satellite_ndvi_timeseries_archive_id_unique'
  ) then
    alter table public.satellite_ndvi_timeseries_archive
      add constraint satellite_ndvi_timeseries_archive_id_unique unique (id);
  end if;
end
$$;

create or replace function public.archive_and_prune_temporal_data()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.weather_snapshots_daily_archive
  select w.*, now() as archived_at, 'older_than_12_months' as archived_reason
  from public.weather_snapshots_daily w
  where w.date < (current_date - interval '12 months')
  on conflict (id) do nothing;

  delete from public.weather_snapshots_daily w
  where w.date < (current_date - interval '12 months');

  insert into public.satellite_ndvi_timeseries_archive
  select n.*, now() as archived_at, 'older_than_24_months' as archived_reason
  from public.satellite_ndvi_timeseries n
  where n.date < (current_date - interval '24 months')
  on conflict (id) do nothing;

  delete from public.satellite_ndvi_timeseries n
  where n.date < (current_date - interval '24 months');

  delete from public.external_api_cache c
  where c.expires_at < (now() - interval '30 days');
end;
$$;

-- Storage bucket for generated reports.
insert into storage.buckets (id, name, public)
values ('reports', 'reports', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "public read reports bucket" on storage.objects;
drop policy if exists "service manages reports bucket" on storage.objects;

create policy "public read reports bucket"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'reports');

create policy "service manages reports bucket"
  on storage.objects for all
  to service_role
  using (bucket_id = 'reports')
  with check (bucket_id = 'reports');

create or replace function public.read_secret(secret_name text, setting_name text default null)
returns text
language plpgsql
security definer
set search_path = public, vault, pg_catalog
as $$
declare
  secret_value text;
  setting_value text;
begin
  begin
    select ds.decrypted_secret
    into secret_value
    from vault.decrypted_secrets ds
    where ds.name = secret_name
    limit 1;
  exception
    when undefined_table then
      secret_value := null;
  end;

  if secret_value is not null and length(secret_value) > 0 then
    return secret_value;
  end if;

  if setting_name is not null then
    begin
      setting_value := current_setting(setting_name, true);
    exception
      when others then
        setting_value := null;
    end;
  end if;

  return setting_value;
end;
$$;

create or replace function public.configure_adham_cron_jobs()
returns jsonb
language plpgsql
security definer
set search_path = public, vault, pg_catalog
as $$
declare
  base_url text;
  service_key text;
  cron_secret text;
  headers_value jsonb := jsonb_build_object('Content-Type', 'application/json');
  headers_json text;
  scheduled text[] := '{}';
begin
  if not exists (select 1 from pg_extension where extname = 'pg_cron') then
    return jsonb_build_object('ok', false, 'reason', 'missing_pg_cron');
  end if;

  if not exists (select 1 from pg_extension where extname = 'pg_net') then
    return jsonb_build_object('ok', false, 'reason', 'missing_pg_net');
  end if;

  base_url := public.read_secret('adham_functions_base_url', 'app.settings.supabase_functions_base_url');
  service_key := public.read_secret('adham_service_role_key', 'app.settings.service_role_key');
  cron_secret := public.read_secret('adham_cron_secret', 'app.settings.cron_secret');

  if base_url is null or length(base_url) = 0 then
    return jsonb_build_object('ok', false, 'reason', 'missing_base_url');
  end if;

  if service_key is not null and length(service_key) > 0 then
    headers_value := headers_value || jsonb_build_object('Authorization', 'Bearer ' || service_key);
  end if;

  if cron_secret is not null and length(cron_secret) > 0 then
    headers_value := headers_value || jsonb_build_object('x-cron-secret', cron_secret);
  end if;

  if not (headers_value ? 'Authorization') and not (headers_value ? 'x-cron-secret') then
    return jsonb_build_object('ok', false, 'reason', 'missing_auth_material');
  end if;

  headers_json := headers_value::text;

  if exists (select 1 from cron.job where jobname = 'daily-weather-job') then
    perform cron.unschedule('daily-weather-job');
  end if;

  if exists (select 1 from cron.job where jobname = 'weekly-ndvi-job') then
    perform cron.unschedule('weekly-ndvi-job');
  end if;

  if exists (select 1 from cron.job where jobname = 'monthly-report-job') then
    perform cron.unschedule('monthly-report-job');
  end if;

  if exists (select 1 from cron.job where jobname = 'system-health-job') then
    perform cron.unschedule('system-health-job');
  end if;

  if exists (select 1 from cron.job where jobname = 'daily-temporal-archive-prune') then
    perform cron.unschedule('daily-temporal-archive-prune');
  end if;

  perform cron.schedule(
    'daily-weather-job',
    '0 5 * * *',
    format(
      $job$select net.http_post(
        url := %L,
        headers := %L::jsonb,
        body := jsonb_build_object('mode','batch','date',current_date::text)
      );$job$,
      base_url || '/fetch-weather-daily',
      headers_json
    )
  );
  scheduled := array_append(scheduled, 'daily-weather-job');

  perform cron.schedule(
    'weekly-ndvi-job',
    '0 6 * * 1',
    format(
      $job$select net.http_post(
        url := %L,
        headers := %L::jsonb,
        body := jsonb_build_object(
          'mode','batch',
          'start_date',(current_date - interval '7 day')::date::text,
          'end_date',current_date::text
        )
      );$job$,
      base_url || '/fetch-ndvi',
      headers_json
    )
  );
  scheduled := array_append(scheduled, 'weekly-ndvi-job');

  perform cron.schedule(
    'monthly-report-job',
    '0 7 1 * *',
    format(
      $job$select net.http_post(
        url := %L,
        headers := %L::jsonb,
        body := jsonb_build_object(
          'mode','batch',
          'month',date_trunc('month', current_date)::date::text
        )
      );$job$,
      base_url || '/generate-report-monthly',
      headers_json
    )
  );
  scheduled := array_append(scheduled, 'monthly-report-job');

  perform cron.schedule(
    'system-health-job',
    '*/15 * * * *',
    format(
      $job$select net.http_post(
        url := %L,
        headers := %L::jsonb,
        body := jsonb_build_object('source','cron')
      );$job$,
      base_url || '/system-health',
      headers_json
    )
  );
  scheduled := array_append(scheduled, 'system-health-job');

  perform cron.schedule(
    'daily-temporal-archive-prune',
    '30 3 * * *',
    $job$select public.archive_and_prune_temporal_data();$job$
  );
  scheduled := array_append(scheduled, 'daily-temporal-archive-prune');

  return jsonb_build_object('ok', true, 'scheduled', scheduled);
end;
$$;

revoke all on function public.configure_adham_cron_jobs() from public;
grant execute on function public.configure_adham_cron_jobs() to service_role;

-- RLS for newly created operational tables.
alter table public.weather_snapshots_daily enable row level security;
alter table public.irrigation_recommendations_daily enable row level security;
alter table public.satellite_ndvi_timeseries enable row level security;
alter table public.weather_snapshots_daily_archive enable row level security;
alter table public.satellite_ndvi_timeseries_archive enable row level security;
alter table public.external_api_cache enable row level security;
alter table public.plan_limits enable row level security;
alter table public.articles enable row level security;

drop policy if exists "service manages weather" on public.weather_snapshots_daily;
drop policy if exists "service manages irrigation" on public.irrigation_recommendations_daily;
drop policy if exists "service manages ndvi" on public.satellite_ndvi_timeseries;
drop policy if exists "service manages weather archive" on public.weather_snapshots_daily_archive;
drop policy if exists "service manages ndvi archive" on public.satellite_ndvi_timeseries_archive;
drop policy if exists "service manages external cache" on public.external_api_cache;
drop policy if exists "public read plan limits" on public.plan_limits;
drop policy if exists "public read articles" on public.articles;
drop policy if exists "admins manage articles" on public.articles;

create policy "service manages weather"
  on public.weather_snapshots_daily for all
  to service_role
  using (true)
  with check (true);

create policy "service manages irrigation"
  on public.irrigation_recommendations_daily for all
  to service_role
  using (true)
  with check (true);

create policy "service manages ndvi"
  on public.satellite_ndvi_timeseries for all
  to service_role
  using (true)
  with check (true);

create policy "service manages weather archive"
  on public.weather_snapshots_daily_archive for all
  to service_role
  using (true)
  with check (true);

create policy "service manages ndvi archive"
  on public.satellite_ndvi_timeseries_archive for all
  to service_role
  using (true)
  with check (true);

create policy "service manages external cache"
  on public.external_api_cache for all
  to service_role
  using (true)
  with check (true);

create policy "public read plan limits"
  on public.plan_limits for select
  using (true);

create policy "public read articles"
  on public.articles for select
  using (true);

create policy "admins manage articles"
  on public.articles for all
  using (public.can_manage_article());
