-- Production hardening migration for Adham AgriTech
-- 1) Enforce reporting uniqueness and indexing
-- 2) Provision storage bucket + policies for report artifacts
-- 3) Configure resilient cron schedules using Vault/config secrets

create extension if not exists pg_net;
create extension if not exists pg_cron;
create extension if not exists supabase_vault;

-- Ensure no duplicate report rows before adding strict uniqueness.
with ranked_reports as (
  select
    id,
    row_number() over (
      partition by org_id, month, type
      order by created_at desc, id desc
    ) as rn
  from public.reports
)
delete from public.reports r
using ranked_reports rr
where r.id = rr.id
  and rr.rn > 1;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'reports_org_month_type_unique'
  ) then
    alter table public.reports
      add constraint reports_org_month_type_unique unique (org_id, month, type);
  end if;
end
$$;

create index if not exists reports_org_month_idx on public.reports (org_id, month desc);
create index if not exists alerts_field_date_type_idx on public.alerts (field_id, date desc, type);
create index if not exists fields_farm_id_idx on public.fields (farm_id);
create index if not exists farms_org_id_idx on public.farms (org_id);

-- Ensure plan limits exist in production bootstrap environments.
insert into public.plan_limits (plan, fields_limit, reports_per_month, ndvi_checks_per_month) values
('free',1,1,4),
('pro',10,100,40),
('b2b',100,1000,400)
on conflict (plan) do update
set
  fields_limit = excluded.fields_limit,
  reports_per_month = excluded.reports_per_month,
  ndvi_checks_per_month = excluded.ndvi_checks_per_month;

-- Reports bucket for generated monthly artifacts.
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

do $cron$
declare
  base_url text;
  service_key text;
  cron_secret text;
  headers_json text;
  headers_value jsonb;
begin
  if not exists (select 1 from pg_extension where extname = 'pg_cron') then
    raise notice 'pg_cron not installed, skipping schedule configuration';
    return;
  end if;

  if not exists (select 1 from pg_extension where extname = 'pg_net') then
    raise notice 'pg_net not installed, skipping schedule configuration';
    return;
  end if;

  base_url := public.read_secret('adham_functions_base_url', 'app.settings.supabase_functions_base_url');
  service_key := public.read_secret('adham_service_role_key', 'app.settings.service_role_key');
  cron_secret := public.read_secret('adham_cron_secret', 'app.settings.cron_secret');

  if base_url is null or service_key is null then
    raise notice 'Missing function base URL or service key. Cron schedules were not updated.';
    return;
  end if;

  headers_value := jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer ' || service_key
  );

  if cron_secret is not null and length(cron_secret) > 0 then
    headers_value := headers_value || jsonb_build_object('x-cron-secret', cron_secret);
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
end
$cron$;
