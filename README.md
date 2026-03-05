# Adham AgriTech

منصة SaaS للزراعة الذكية (MVP) تستهدف المزارع الفردي والشركات المتوسطة عبر 3 محاور:
- **Water-Smart Advisor**: توصيات ري يومية.
- **Crop Stress Watch**: مراقبة NDVI وتنبيهات الإجهاد.
- **Monthly Reports**: تقارير إنتاجية المياه (WaPOR) برابط مشاركة.

## Stack
- Next.js App Router + TypeScript + Tailwind
- Supabase (Postgres + Auth + Storage + RLS + Edge Functions + Cron)
- Vercel Hobby

## Monorepo Structure
- `apps/web`: الموقع التسويقي + التطبيق الداخلي
- `packages/lib`: clients و helpers للتكامل الخارجي
- `supabase/migrations`: schema SQL
- `supabase/policies.sql`: RLS policies
- `supabase/functions`: edge functions
- `supabase/seed.sql`: خطط + مقالات SEO
- `supabase/cron.sql`: جداول التشغيل

## Quick Start
```bash
cp .env.example .env.local
pnpm install
pnpm dev
```

## Supabase Setup
1. نفّذ الهجرات بالترتيب:
   - `supabase/migrations/202603010001_init.sql`
   - `supabase/migrations/202603010002_performance_retention.sql`
   - `supabase/migrations/202603010003_production_readiness.sql`
   - `supabase/migrations/202603010004_rls_policies.sql` (أو خطوة policies أدناه)
   - `supabase/migrations/202603010005_security_scheduler.sql`
   - `supabase/migrations/202603010006_agritech_existing_schema_integration.sql` (لبيئات فيها سكيمة زراعية مسبقة مبنية على `tenants`)
2. فعّل RLS policies: `supabase/policies.sql`
3. حمّل seed: `supabase/seed.sql`
4. انشر functions الموجودة في `supabase/functions/*`
5. طبّق cron في `supabase/cron.sql` (أو نفّذ `select public.configure_adham_cron_jobs();` بعد ضبط الأسرار).

ملاحظة: في مشروع `Adham AgriTech` الذي يحتوي سكيمة تشغيل مسبقة، تم اعتماد migration تكاملي non-destructive (`202603010006`) لدمج متطلبات التطبيق بدون كسر الجداول الحالية.

## Production Notes
- Edge Functions تتطلب Authorization من `service_role` أو `x-cron-secret`.
- مسار التقرير العام `/r/[publicToken]` متصل الآن ببيانات Supabase الحقيقية.
- الواجهة تدعم `ar` و `en` عبر `?lang=ar|en` مع حفظ اللغة في cookie.
- يوصى بتهيئة Vault secrets في Supabase:
  - `adham_functions_base_url`
  - `adham_service_role_key`
  - `adham_cron_secret` (اختياري)
- يمكن إعادة تهيئة مهام cron في أي وقت بعد ضبط الأسرار عبر:
  - `select public.configure_adham_cron_jobs();`

## Vercel Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` (بديل حديث للـ anon key)
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- `SUPABASE_URL` (server-only)
- `SUPABASE_CRON_SECRET` (اختياري)
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` (public `pk...`)
- `NEXT_PUBLIC_MAPBOX_STYLE_ID` (اختياري، افتراضي: `mapbox/dark-v11`)
- `MAPBOX_SECRET_TOKEN` (server-only `sk...` لخدمات Geocoding/Directions)
- `GROQ_API_KEY` (server-only للمساعد الذكي)
- `GROQ_MODEL` (اختياري، افتراضي: `openai/gpt-oss-120b`)
- `GROQ_BASE_URL` (اختياري، افتراضي: `https://api.groq.com/openai/v1`)
- `NASA_POWER_BASE_URL`
- `SENTINEL_HUB_CLIENT_ID`
- `SENTINEL_HUB_CLIENT_SECRET`
- `WAPOR_BASE_URL`

## Key MVP UX Delivered
- Marketing pages: `/`, `/pricing`, `/docs`, `/about`, `/contact`
- App pages: `/app`, `/app/farms`, `/app/farms/[farmId]`, `/app/fields/[fieldId]`, `/app/reports`
- Smart assistant page: `/app/assistant` (Groq-backed, tenant-aware context)
- Public report route: `/r/[publicToken]`
- Dashboard يحتوي: Weather card, Irrigation recommendation, Alerts, NDVI chart
- Farms/Fields يحتوي: map preview + field insights

## Free-tier Guardrails
- لا استدعاء APIs خارجية في طلبات صفحة المستخدم.
- التحديث عبر cron + edge functions فقط.
- استخدام cache tables (`external_api_cache`) وتقليل عدد الطلبات.
- قيود الباقات عبر `plan_limits` + `usage_events`.

## CI
GitHub Actions يشغّل:
- lint
- typecheck
- test

## ما يحتاجه المستودع الآن
- **زيادة اختبارات `packages/lib`**: حاليًا لا توجد اختبارات فعلية لهذه الحزمة (`"test": "echo 'no tests yet'`)، وهي أهم فجوة جودة قبل التوسّع.
- **تفعيل النشر الآلي**: بعد اكتمال الفحوصات في CI، يُفضّل إضافة مسار نشر تلقائي (Staging/Production) لتقليل أخطاء الإطلاق اليدوي.
- **توثيق المتغيرات البيئية الحساسة**: توحيد قائمة متغيرات البيئة المطلوبة لكل من `apps/web` و Supabase مع أمثلة تشغيل محلية وإنتاجية.
- **اختبار تكامل Edge Functions**: إضافة smoke/integration checks لـ `fetch-weather-daily` و `generate-report-monthly` للتأكد من سلامة cron والتكاملات الخارجية.
