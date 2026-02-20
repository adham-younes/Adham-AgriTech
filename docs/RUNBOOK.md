# Runbook

## 1) فحص الصحة
```bash
curl -sS "$SUPABASE_FUNCTIONS_BASE_URL/system-health" \
  -H "Authorization: Bearer $SUPABASE_CRON_SECRET"
```

## 2) تشغيل مزامنة الطقس يدويًا
```bash
curl -sS "$SUPABASE_FUNCTIONS_BASE_URL/fetch-weather-daily" \
  -H "Authorization: Bearer $SUPABASE_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"mode":"batch","date":"2026-03-01"}'
```

## 3) تشغيل مزامنة NDVI يدويًا
```bash
curl -sS "$SUPABASE_FUNCTIONS_BASE_URL/fetch-ndvi" \
  -H "Authorization: Bearer $SUPABASE_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"start_date":"2026-02-20","end_date":"2026-03-01"}'
```

## 4) إنشاء تقرير شهري يدويًا
```bash
curl -sS "$SUPABASE_FUNCTIONS_BASE_URL/generate-report-monthly" \
  -H "Authorization: Bearer $SUPABASE_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"mode":"batch","month":"2026-03-01"}'
```

## 5) التحقق من audit trail
```sql
select created_at, org_id, event_type, status, target_table, target_id
from public.audit_logs
order by created_at desc
limit 50;
```

## 6) التحقق من rate limiting
```sql
select rate_key, window_started_at, count
from public.rate_limit_counters
order by updated_at desc
limit 20;
```
