# Runbook

## Automation endpoints
- فحص النظام: `/functions/v1/system-health`
- إعادة تشغيل جلب الطقس يدويًا: `/functions/v1/fetch-weather-daily`
- إعادة مزامنة NDVI أسبوعية: `/functions/v1/fetch-ndvi`
- إعادة بناء التقرير شهريًا: `/functions/v1/generate-report-monthly`

> ملاحظة: جميع وظائف الـ automation تتطلب `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>`.

## Caching operations
- جدول الكاش: `public.external_api_cache`.
- TTL افتراضي: 24 ساعة لـ NASA POWER، و12 ساعة لـ WaPOR.
- المراقبة السريعة: عدّاد `cache_entries` في `/functions/v1/system-health`.

## Reliability playbook
1. تحقق من الحالة العامة عبر `system-health`.
2. أعد تشغيل الـ weather sync (`mode=batch`) لليوم الحالي.
3. أعد تشغيل NDVI sync لنطاق 7 أيام عند وجود gaps.
4. شغّل monthly report إذا فشل توليد PDF/HTML تلقائيًا.
5. راجع جدول `external_api_cache` قبل اتهام upstream API بالبطء/الانقطاع.

## Security & policy validation
- RLS مفعل على كل الجداول العامة.
- وظائف الكتابة المجدولة تعمل فقط بمفتاح service role.
- سياسة الوصول داخل المنظمة عبر `organization_members` + `is_org_member`.
- شغّل فحص السياسات محليًا عبر:
  - `node scripts/validate-security.mjs`

## Release checklist
1. `pnpm lint`
2. `pnpm typecheck`
3. `pnpm test`
4. `node scripts/validate-security.mjs`
5. مراجعة CI workflow (lint/typecheck/test/build/security)
6. تحديث ملخص الإنجاز + المخاطر + النسبة المئوية
