-- Security and operations hardening
-- 1) lock helper function search_path
-- 2) provide a rerunnable cron setup function for post-secret bootstrap

create or replace function public.is_org_member(target_org uuid)
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members m
    where m.org_id = target_org and m.user_id = auth.uid()
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

  return jsonb_build_object('ok', true, 'scheduled', scheduled);
end;
$$;

revoke all on function public.configure_adham_cron_jobs() from public;
grant execute on function public.configure_adham_cron_jobs() to service_role;

select public.configure_adham_cron_jobs();
