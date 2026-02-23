# Smart Agriculture Production Guide

## Objective
تحويل منصة Adham AgriTech إلى نظام إنتاجي موثوق لقرارات الري، مراقبة الإجهاد، وتقارير إنتاجية المياه.

## Recommended Production Principles

1. **Irrigation science should be anchored in FAO-56 ET0**  
   استخدم ET0 كقاعدة معيارية، ثم أضف معاملات محلية حسب المحصول ونوع التربة.

2. **Remote sensing must include quality controls**  
   أي NDVI بدون إدارة سحب/ضوضاء زمانية قد ينتج إشارات مضللة.

3. **Data pipelines should fail transparently, not silently**  
   عند فشل مزود خارجي، لا تكتب قيماً عشوائية؛ سجّل حالة degraded وارسِل تنبيهًا نظاميًا.

4. **Cron orchestration should use secret isolation**  
   أسرار الاستدعاء الدوري تحفظ في Vault وتدار بدورية تدوير مفاتيح.

5. **Public sharing must use tokenized access + scoped payload**  
   استخدم public token للقراءة، مع إظهار أقل بيانات لازمة فقط.

## Implementation Checklist (Production)

- ET0 + irrigation recommendation:
  - توحيد المدخلات المناخية (T2M, RH2M, WS2M) مع fallback آمن.
  - تسجيل confidence + reasoning لكل توصية.

- NDVI pipeline:
  - منع fallback العشوائي بالكامل.
  - إدخال تنبيه system عند فشل ingest.
  - تطبيق rolling baseline detection للهبوط المفاجئ.

- Reporting:
  - فرض uniqueness على `(org_id, month, type)`.
  - تحديث نفس التقرير عند إعادة التشغيل بدل إنتاج نسخ متضاربة.

- Security:
  - التحقق داخل Edge Function من صلاحية invoker (`service_role` أو `x-cron-secret`).
  - تفعيل RLS وسياسات storage للبكت `reports`.

- Orchestration:
  - جدولة daily/weekly/monthly jobs مع pg_cron + pg_net.
  - مراقبة وظيفة system-health كل 15 دقيقة.

## Source References

- FAO Irrigation and Drainage Paper 56 (ET0 baseline):  
  https://www.fao.org/4/X0490E/X0490E00.htm

- FAO WaPOR (water productivity remote sensing):  
  https://www.fao.org/in-action/remote-sensing-for-water-productivity/en/

- WaPOR Data Access (v3 token/credentials note, updated Aug 2025):  
  https://www.fao.org/in-action/remote-sensing-for-water-productivity/wapor-data-access/en

- NASA POWER API (agro-climate inputs):  
  https://power.larc.nasa.gov/docs/services/api/

- Sentinel Hub Process API (satellite processing):  
  https://docs.sentinel-hub.com/api/latest/api/process/

- Supabase scheduling Edge Functions (pg_cron + pg_net):  
  https://supabase.com/docs/guides/functions/schedule-functions

- Supabase Edge Function security patterns:  
  https://supabase.com/docs/guides/functions/auth

## Notes from Latest Source Validation (2026-02-20)

- Supabase scheduling docs تؤكد الدمج الموصى به: `pg_cron` + `pg_net` + Vault secrets لاستدعاء الوظائف دوريًا.
- Supabase security docs تؤكد أن الحماية داخل كود الوظيفة نفسها هي النمط الصحيح، وليس الاعتماد على طبقة ضمنية فقط.
- صفحة WaPOR data access تؤكد أن WaPOR v3 لا يتطلب token للوصول عبر API (على عكس مراجع WaPOR v2 القديمة).
