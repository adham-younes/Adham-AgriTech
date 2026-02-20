# Architecture

- Next.js App Router يستهلك Supabase عبر Server Components.
- Supabase Edge Functions مسؤولة عن التكامل مع APIs الخارجية.
- pg_cron + pg_net لتشغيل الوظائف المجدولة يوميًا/أسبوعيًا/شهريًا.
- الجداول `weather_snapshots_daily` و `satellite_ndvi_timeseries` تستخدم كـ cache دائم.

## DB Performance Notes

- تمت إضافة فهارس قراءة زمنية على:
  - `weather_snapshots_daily (field_id, date desc)`
  - `satellite_ndvi_timeseries (field_id, date desc)`
  - `external_api_cache (provider, cache_key)` و `external_api_cache (expires_at)`
- تمت إضافة قيود uniqueness إضافية لمنع تكرار بيانات التشغيل:
  - `alerts (field_id, date, type)`
  - `usage_events (org_id, event_type, event_date)`
- تمت إضافة سياسة أرشفة/تنظيف يومية عبر الدالة `archive_and_prune_temporal_data()`:
  - أرشفة `weather_snapshots_daily` الأقدم من 12 شهرًا.
  - أرشفة `satellite_ndvi_timeseries` الأقدم من 24 شهرًا.
  - تنظيف `external_api_cache` بعد 30 يومًا من انتهاء الصلاحية.
- تتم جدولة سياسة الأرشفة يوميًا (03:30) عبر `pg_cron` عند توفر الامتداد.
