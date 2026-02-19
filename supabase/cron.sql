create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'daily-weather-job',
  '0 5 * * *',
  $$
  select net.http_post(
    url := current_setting('app.settings.supabase_functions_base_url') || '/fetch-weather-daily',
    headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || current_setting('app.settings.service_role_key')),
    body := jsonb_build_object('mode','batch','date',current_date::text)
  );
  $$
);

select cron.schedule(
  'weekly-ndvi-job',
  '0 6 * * 1',
  $$
  select net.http_post(
    url := current_setting('app.settings.supabase_functions_base_url') || '/fetch-ndvi',
    headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || current_setting('app.settings.service_role_key')),
    body := jsonb_build_object('mode','batch','start_date',(current_date - interval '7 day')::date::text,'end_date',current_date::text)
  );
  $$
);

select cron.schedule(
  'monthly-report-job',
  '0 7 1 * *',
  $$
  select net.http_post(
    url := current_setting('app.settings.supabase_functions_base_url') || '/generate-report-monthly',
    headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || current_setting('app.settings.service_role_key')),
    body := jsonb_build_object('mode','batch','month',date_trunc('month', current_date)::date::text)
  );
  $$
);
