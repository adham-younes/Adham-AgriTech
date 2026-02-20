# Security

## إدارة الأسرار والمتغيرات
- المصدر المرجعي للمتغيرات هو `.env.example` ويجب أن يطابق إعدادات التشغيل في `README` و`RUNBOOK`.
- يمنع استخدام أي Secret في `NEXT_PUBLIC_*`.
- المتغيرات الحساسة: `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_CRON_SECRET`, `SENTINEL_HUB_CLIENT_SECRET`.
- يوصى بتدوير الأسرار كل 90 يومًا أو فورًا عند الاشتباه بالتسرب.

## منع تسرب مفاتيح API
- Edge Functions لا تعيد قيم secrets أو provider payload في الاستجابة.
- رسائل الخطأ موحدة: `forbidden_or_rate_limited` أو `internal_error`.
- يمنع تسجيل headers أو env vars في السجلات.

## RLS (owner / team / public token)
### السياسة الحالية
- بيانات المنظمة: الوصول للأعضاء فقط عبر `is_org_member`.
- إدارة عضويات المنظمة: owner فقط.
- التقارير الداخلية: أعضاء المنظمة فقط.
- العرض العام: عبر `public_reports` view لحالة `ready` وباستخدام `public_token` فقط.

### تحقق عملي سريع
> نفّذ الاستعلامات التالية في SQL Editor (كل خطوة مع JWT مناسب):

1) **Owner** (عضو + owner)
```sql
select id, name from public.organizations;               -- متاح
select * from public.organization_members;               -- متاح
update public.organization_members set role='member'
where org_id = '<org-id>' and user_id = '<target-user>'; -- متاح للـ owner
```

2) **Team member (admin/member)**
```sql
select id, name from public.organizations;               -- فقط منظمته
select * from public.organization_members;               -- قراءة فقط
update public.organization_members set role='admin'
where org_id = '<org-id>' and user_id = '<target-user>'; -- يجب أن تُرفض
```

3) **Anon/Public token**
```sql
select * from public.public_reports where public_token = '<token>'; -- متاح إذا status=ready
select * from public.reports;                                      -- مرفوض
```

## Rate limiting على endpoints الحساسة
- `fetch-weather-daily`, `fetch-ndvi`, `generate-report-monthly` تتطلب:
  - `Authorization: Bearer $SUPABASE_CRON_SECRET`
  - rate limit عبر RPC `consume_rate_limit` (لكل IP + endpoint).
- الضبط عبر:
  - `RATE_LIMIT_SYNC_MAX`
  - `RATE_LIMIT_SYNC_WINDOW_SECONDS`
  - `RATE_LIMIT_REPORTS_MAX`
  - `RATE_LIMIT_REPORTS_WINDOW_SECONDS`

## Audit trail
يتم تسجيل الأحداث الجوهرية في `public.audit_logs` عبر `record_audit_event`:
- `report_created`
- `public_share_created`
- `weather_sync_completed` / `weather_sync_failed`
- `ndvi_sync_completed` / `ndvi_sync_failed`
- `report_generation_failed`

## خطوات تشغيلية عند حادث أمني
1. تدوير `SUPABASE_SERVICE_ROLE_KEY` و`SUPABASE_CRON_SECRET` فورًا.
2. تعطيل cron jobs مؤقتًا.
3. مراجعة `audit_logs` للأحداث الفاشلة أو غير الطبيعية.
4. مراجعة `rate_limit_counters` لرصد إساءة الاستخدام.
5. إعادة التفعيل التدريجي بعد التحقق.
