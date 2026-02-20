-- الهدف من هذا الـ migration:
-- 1) تحسين أداء القراءة في الجداول الزمنية الأكثر استخدامًا (snapshots/timeseries/cache).
-- 2) منع التكرار غير المقصود عبر قيود uniqueness على بيانات قابلة للتكرار من مهام مجدولة.
-- 3) إضافة سياسة أرشفة/تنظيف واضحة للبيانات الزمنية لتقليل حجم الجداول النشطة.

-- ------------------------------------------------------------
-- Performance indexes for high-read tables
-- ------------------------------------------------------------

-- سبب التغيير: الاستعلامات الشائعة تعتمد على (field_id + date) بترتيب زمني.
-- هذا الفهرس يقلل زمن جلب أحدث snapshot لكل حقل.
create index if not exists weather_snapshots_daily_field_date_desc_idx
  on public.weather_snapshots_daily (field_id, date desc);

-- سبب التغيير: نفس نمط القراءة موجود في NDVI timeseries (تاريخي لكل field).
create index if not exists satellite_ndvi_timeseries_field_date_desc_idx
  on public.satellite_ndvi_timeseries (field_id, date desc);

-- سبب التغيير: الـ cache يُقرأ غالبًا بالمزوّد + المفتاح ويُنظّف حسب expires_at.
-- الفهرس المركّب يحسّن hit lookup، وفهرس expires_at يسرّع عمليات التنظيف.
create index if not exists external_api_cache_provider_key_idx
  on public.external_api_cache (provider, cache_key);

create index if not exists external_api_cache_expires_at_idx
  on public.external_api_cache (expires_at);

-- ------------------------------------------------------------
-- Uniqueness hardening (deduplicate then constrain)
-- ------------------------------------------------------------

-- سبب التغيير: jobs قد تعيد إدراج نفس نوع التنبيه لنفس الحقل/اليوم.
-- نزيل التكرارات الحالية مع الإبقاء على أحدث سجل، ثم نفرض uniqueness.
with ranked_alerts as (
  select
    id,
    row_number() over (
      partition by field_id, date, type
      order by created_at desc, id desc
    ) as rn
  from public.alerts
)
delete from public.alerts a
using ranked_alerts r
where a.id = r.id
  and r.rn > 1;

alter table public.alerts
  add constraint alerts_field_date_type_unique
  unique (field_id, date, type);

-- سبب التغيير: usage_events قد تتكرر لنفس org/event/date عند إعادة تشغيل ingestion.
-- نحتفظ بآخر حدث فقط قبل تفعيل uniqueness لضمان نجاح migration.
with ranked_usage as (
  select
    id,
    row_number() over (
      partition by org_id, event_type, event_date
      order by created_at desc, id desc
    ) as rn
  from public.usage_events
)
delete from public.usage_events u
using ranked_usage r
where u.id = r.id
  and r.rn > 1;

alter table public.usage_events
  add constraint usage_events_org_event_date_unique
  unique (org_id, event_type, event_date);

-- ------------------------------------------------------------
-- Temporal data archive/cleanup policy
-- ------------------------------------------------------------

-- سبب التغيير: إبقاء كل البيانات الزمنية في الجداول النشطة يرفع كلفة I/O والفهارس.
-- ننشئ جداول أرشيف للاحتفاظ بالتاريخ القديم خارج مسار القراءة اليومي.
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

-- سبب التغيير: ضمان عدم تكرار نفس السجل المؤرشف في حال إعادة تشغيل المهمة.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'weather_snapshots_daily_archive_id_unique'
  ) then
    alter table public.weather_snapshots_daily_archive
      add constraint weather_snapshots_daily_archive_id_unique unique (id);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'satellite_ndvi_timeseries_archive_id_unique'
  ) then
    alter table public.satellite_ndvi_timeseries_archive
      add constraint satellite_ndvi_timeseries_archive_id_unique unique (id);
  end if;
end
$$;

-- سبب التغيير: التحكم بالوصول للأرشيف من خلال service_role فقط لأنه مخزن تشغيلي/تحليلي.
alter table public.weather_snapshots_daily_archive enable row level security;
alter table public.satellite_ndvi_timeseries_archive enable row level security;

create policy "service manages weather archive"
  on public.weather_snapshots_daily_archive
  for all to service_role
  using (true)
  with check (true);

create policy "service manages ndvi archive"
  on public.satellite_ndvi_timeseries_archive
  for all to service_role
  using (true)
  with check (true);

-- سبب التغيير: توحيد سياسات الاحتفاظ في وظيفة واحدة قابلة للجدولة.
-- السياسة:
-- - weather_snapshots_daily: الاحتفاظ بـ 12 شهرًا في الجدول النشط.
-- - satellite_ndvi_timeseries: الاحتفاظ بـ 24 شهرًا في الجدول النشط.
-- - external_api_cache: حذف السجلات المنتهية بعد 30 يومًا من انتهاء الصلاحية.
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

-- سبب التغيير: تنفيذ تلقائي يومي للتنظيف/الأرشفة دون تدخل يدوي.
do $cron$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    if exists (select 1 from cron.job where jobname = 'daily-temporal-archive-prune') then
      perform cron.unschedule('daily-temporal-archive-prune');
    end if;

    perform cron.schedule(
      'daily-temporal-archive-prune',
      '30 3 * * *',
      $job$select public.archive_and_prune_temporal_data();$job$
    );
  end if;
end
$cron$;
