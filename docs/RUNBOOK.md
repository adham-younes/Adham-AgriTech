# Runbook

## مؤشرات الصحة والمتابعة
- نقطة الصحة الرئيسية: `GET /functions/v1/system-health`.
- راقب المؤشرات التالية داخل `indicators`:
  - `avgLatencyMs` لمتوسط زمن التنفيذ آخر 100 Job.
  - `failedJobsLast100` لعدد Jobs الفاشلة.
  - `weatherFreshnessHours` و `ndviFreshnessHours` لحداثة البيانات.
  - `cacheTtlLeftByProvider` لمعرفة اقتراب انتهاء الكاش لكل مزود.

## جدولة الـ Cron بدون تعارض
- الجدولة الحالية متدرجة لتجنب التزاحم:
  - `daily-weather-job` عند `05:15` يوميًا.
  - `weekly-ndvi-job` عند `05:45` كل اثنين.
  - `monthly-report-job` عند `06:20` أول كل شهر.
- ملف الجدولة: `supabase/cron.sql` ويشمل `unschedule` للأسماء القديمة قبل إعادة التسجيل.

## الاسترجاع السريع عند فشل Cron
1. تأكد من حالة الوظائف عبر `system-health`.
2. تحقق من آخر التنفيذات الفاشلة عبر جدول `job_runs`.
3. أعد تشغيل الوظيفة المتأثرة يدويًا:
   - الطقس: `POST /functions/v1/fetch-weather-daily` مع `{ "mode": "batch", "date": "YYYY-MM-DD" }`.
   - NDVI: `POST /functions/v1/fetch-ndvi` مع `{ "mode": "batch", "start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD" }`.
   - التقارير: `POST /functions/v1/generate-report-monthly` مع `{ "mode": "batch", "month": "YYYY-MM-01" }`.
4. أعد فحص `system-health` للتأكد من رجوع الحالة إلى `ok`.

## الاسترجاع السريع عند فشل API خارجي
1. تحقق من توفر المصدر الخارجي (NASA POWER / Sentinel Hub / WaPOR).
2. بما أن النظام يعتمد `external_api_cache`، يمكن الاستمرار مؤقتًا على بيانات الكاش حتى نهاية TTL.
3. إذا انتهى TTL وكان المصدر معطل:
   - فعّل إعادة المحاولة لاحقًا (الوظائف بها retry exponential تلقائيًا).
   - راقب `failedJobsLast100` حتى ينخفض بعد عودة المصدر.
4. بعد عودة المصدر، نفّذ job يدويًا لتسريع التعافي بدل انتظار الـ cron التالي.

## حدود الباقات Guardrails
- فحص حدود الباقة يتم قبل:
  - عمليات NDVI (`ndvi_check`).
  - إنشاء التقرير الشهري (`monthly_report`).
- عند تجاوز الحد، يتم تخطي التنفيذ للعميل مع تسجيل `skippedByPlan`.
- عند إدراج حقل جديد، يوجد Trigger على جدول `fields` لمنع تجاوز `fields_limit`.
