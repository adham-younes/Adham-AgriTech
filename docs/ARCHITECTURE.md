# Architecture

- Next.js App Router يستهلك Supabase عبر Server Components.
- Supabase Edge Functions مسؤولة عن التكامل مع APIs الخارجية.
- pg_cron + pg_net لتشغيل الوظائف المجدولة يوميًا/أسبوعيًا/شهريًا.
- الجداول `weather_snapshots_daily` و `satellite_ndvi_timeseries` تستخدم كـ cache دائم.
