# التقرير الفني لفحص المستودع

- **التاريخ:** 2026-02-20
- **المستودع:** `Adham-AgriTech-1`
- **نوع الفحص:** جودة كود + أمن + جاهزية تشغيل
- **حالة الفحص:** مكتمل

## 1) الملخص التنفيذي

- فحوص الجودة الأساسية نجحت: `lint` و `typecheck` و `test` و `build`.
- تم رصد مخاطر تشغيلية وأمنية مهمة في وظائف Supabase Edge وسياسات RLS.
- تم رصد ثغرات اعتمادية (Dependencies) مصنفة `high` حسب `pnpm audit`.

**حكم عام:** الكود قابل للبناء، لكن الجاهزية الإنتاجية تحتاج معالجة المخاطر عالية الأولوية قبل الاعتماد الكامل.

## 2) نطاق الفحص

- `apps/web`
- `packages/lib`
- `supabase/functions`
- `supabase/migrations`
- `supabase/policies.sql`
- `docs` (اتساق التوثيق مع الواقع)

## 3) خطوات التحقق المنفذة

1. `pnpm install`
2. `pnpm lint`
3. `pnpm typecheck`
4. `pnpm test`
5. `pnpm build`
6. `pnpm audit --audit-level=high`
7. مراجعة يدوية للملفات الحساسة (Functions, RLS, Migrations, Routes)

## 4) النتائج (مرتبة حسب الخطورة)

### High-1: وظائف Edge لا تتحقق من هوية المستدعي (Privilege Abuse)

- **الدليل:**
  - `supabase/functions/fetch-weather-daily/index.ts:7`
  - `supabase/functions/fetch-ndvi/index.ts:5`
  - `supabase/functions/generate-report-monthly/index.ts:5`
  - `supabase/functions/system-health/index.ts:5`
- **الوضع الحالي:** استقبال الطلب وتنفيذه مباشرة دون فحص `role` أو secret داخلي.
- **الأثر:** أي عميل يحمل JWT صالح يمكنه تشغيل مهام مجدولة مكلفة أو استخراج مؤشرات عامة.
- **التوصية:** إضافة `authorizeServiceRoleOrCronSecret()` قبل أي تنفيذ، مع رفض `403` عند الفشل.

### High-2: تعارض `upsert` مع سياسات RLS الحالية (Insert-only)

- **الدليل:**
  - `supabase/policies.sql:39`
  - `supabase/policies.sql:44`
  - `supabase/policies.sql:54`
  - `supabase/functions/fetch-weather-daily/index.ts:27`
  - `supabase/functions/fetch-weather-daily/index.ts:35`
  - `supabase/functions/fetch-ndvi/index.ts:15`
- **الوضع الحالي:** السياسات تسمح `insert` فقط لـ `service_role` بينما الكود يعتمد `upsert` (يتطلب مسار update عند التعارض).
- **الأثر:** فشل إعادة التشغيل/إعادة المعالجة عند وجود سجلات سابقة لنفس المفتاح.
- **التوصية:** إما إضافة سياسات `update` لـ `service_role` أو تعديل استراتيجية الكتابة لتجنب مسار update غير المصرح.

### High-3: قيود uniqueness على `alerts` مع `insert` مباشر قد تكسر التشغيل

- **الدليل:**
  - `supabase/migrations/202603010002_performance_retention.sql:47`
  - `supabase/functions/fetch-weather-daily/index.ts:45`
  - `supabase/functions/fetch-ndvi/index.ts:26`
- **الوضع الحالي:** يوجد قيد `unique(field_id, date, type)` بينما الإدراج يتم بدون `on conflict`.
- **الأثر:** أي إعادة تشغيل لنفس اليوم قد تنتج تعارضًا يوقف الوظيفة أثناء loop.
- **التوصية:** استخدام `upsert` أو `insert ... on conflict do nothing` مع تسجيل الحدث بدل إسقاط التنفيذ.

### High-4: ثغرات اعتمادية مصنفة عالية

- **الدليل:** مخرجات `pnpm audit --audit-level=high` بتاريخ 2026-02-20.
- **أهم البنود:**
  - `next@14.2.25` متأثر بعدة DoS advisories.
  - `glob` و `minimatch` ضمن شجرة الاعتمادات مع تحذيرات عالية.
- **الأثر:** مخاطر أمنية/استقرار في بيئة الإنتاج.
- **التوصية:** ترقية `next` إلى إصدار مصحح (على الأقل ضمن نطاق التحديثات الأمنية)، ثم إعادة تشغيل CI كامل.

### Medium-1: منطق NDVI الحالي قد يولد بيانات غير موثوقة

- **الدليل:**
  - `supabase/functions/fetch-ndvi/index.ts:43`
  - `supabase/functions/fetch-ndvi/index.ts:67`
  - `supabase/functions/fetch-ndvi/index.ts:70`
  - `supabase/functions/fetch-ndvi/index.ts:61`
  - `supabase/functions/fetch-ndvi/index.ts:68`
- **الوضع الحالي:** fallback عشوائي (`Math.random`) عند فشل المزود/الاعتماديات، مع مسار parsing غير واضح لـ JSON كـ `Float32Array`.
- **الأثر:** تلويث سلسلة NDVI ببيانات مصطنعة قد تؤدي لتنبيهات خاطئة.
- **التوصية:** عند فشل المزود: إرجاع حالة `degraded` وعدم كتابة قراءة NDVI افتراضية؛ واعتماد parsing متوافق مع صيغة Sentinel الفعلية.

### Medium-2: صفحة التقرير العام لا تستخدم تحقق حقيقي من `publicToken`

- **الدليل:**
  - `apps/web/app/r/[publicToken]/page.tsx:4`
  - `apps/web/app/r/[publicToken]/page.tsx:10`
  - `apps/web/app/r/[publicToken]/page.tsx:16`
- **الوضع الحالي:** البيانات ثابتة (mock) والرمز يعرض فقط بصريًا.
- **الأثر:** تجربة مشاركة التقارير ليست متصلة بالمخزن الفعلي، ولا يوجد تحقق صلاحية للتوكن.
- **التوصية:** جلب التقرير من مصدر فعلي باستخدام `publicToken` وإرجاع `404` عند عدم التطابق.

### Medium-3: فجوة بين التوثيق والمعمارية الفعلية للواجهة

- **الدليل:**
  - `docs/ARCHITECTURE.md:3`
  - `apps/web/app/app/page.tsx:2`
  - `apps/web/app/app/farms/page.tsx:2`
  - `apps/web/app/app/fields/[fieldId]/page.tsx:3`
- **الوضع الحالي:** الوثائق تشير لاستهلاك Supabase عبر Server Components، لكن الصفحات التشغيلية تعتمد `demo-data`.
- **الأثر:** تضارب توقعات الفريق أثناء التطوير والتشغيل.
- **التوصية:** تحديث الوثائق لحالة MVP الحالية أو إكمال ربط الصفحات بمصدر بيانات حقيقي.

## 5) نتائج الجودة الآلية

- `pnpm lint` -> **Pass**
- `pnpm typecheck` -> **Pass**
- `pnpm test` -> **Pass** (web + lib)
- `pnpm build` -> **Pass**
- `pnpm audit --audit-level=high` -> **Fail** (ثغرات عالية موجودة)

## 6) فجوات الاختبار

- لا توجد اختبارات وحدات/تكامل مباشرة لوظائف:
  - `supabase/functions/fetch-weather-daily`
  - `supabase/functions/fetch-ndvi`
  - `supabase/functions/generate-report-monthly`
  - `supabase/functions/system-health`
- لا توجد اختبارات تحقق سياسات RLS آليًا بعد migrations.

## 7) خطة معالجة مختصرة (مقترحة)

1. إغلاق مخاطر High-1/2/3 في functions + policies.
2. تحديث حزمة `next` وباقي الاعتمادات الأمنية الحرجة.
3. منع fallback العشوائي في NDVI واستبداله بحالة degraded موثقة.
4. ربط مسار `/r/[publicToken]` ببيانات فعلية مع تحقق توكن.
5. إضافة اختبار smoke على الأقل لكل Edge Function.

## 8) Update After Remediation (Executed 2026-02-20)

### Closed
- **High-1 (Auth in Edge Functions):** تم إغلاقها بإضافة guard موحد (`service_role` أو `x-cron-secret`) في `supabase/functions/_shared/auth.ts` وتطبيقه على كل الوظائف.
- **High-2 (RLS vs upsert):** تم إغلاقها بتوسيع سياسات service-role في `supabase/policies.sql` لتدعم `for all` للجداول التشغيلية المستهدفة.
- **High-3 (alerts uniqueness crash):** تم إغلاقها بالتحويل إلى `upsert` مع `onConflict: 'field_id,date,type'`.
- **Medium-1 (NDVI random fallback):** تم إغلاقها بإزالة fallback العشوائي وإصدار system alert عند تدهور مصدر NDVI.
- **Medium-2 (public report token route):** تم ربط المسار `/r/[publicToken]` ببيانات Supabase الفعلية عبر `public_reports`.

### Cloud Apply Status
- تم تطبيق migrations عبر Supabase MCP حتى `202603010005_security_scheduler`.
- تم نشر وظائف Edge الأربع بحالة `ACTIVE`.
- تبقى فقط تهيئة الأسرار الخارجية لتفعيل cron ingest/report تلقائيًا.

### Remaining Risks
- تحذيرات advisor المتبقية تخص جداول legacy (`api_cache`, `rate_limits`) وموضع extension `pg_net` في `public`.
- `pnpm audit` لا يزال يُظهر High ضمن شجرة dev tooling (مسار eslint/minimatch)، مع معالجة Next إلى `15.2.9`.

## 9) Post-Incident Correction

- تم تنظيف مشروع `land tours` (`utalnhhxmircwqcszpwt`) من كل آثار سكيمة الزراعة ووظائفها.
- تم تنفيذ rollout الصحيح على مشروع `Adham AgriTech` (`utuhqykvoqurmqzpovuu`) مع migration تكاملي non-destructive:
  - `202603010006_agritech_existing_schema_integration.sql`
- تم نشر وظائف Edge الزراعية وتفعيل cron بنجاح باستخدام `SUPABASE_CRON_SECRET` + Vault secrets.
