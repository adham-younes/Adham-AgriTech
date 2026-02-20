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

## Environment & Secrets
- المتغيرات التي تبدأ بـ `NEXT_PUBLIC_` فقط هي المسموح ظهورها في المتصفح.
- `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_CRON_SECRET`, `SENTINEL_HUB_CLIENT_SECRET` أسرار تشغيلية: لا توضع في الواجهة ولا في السجلات.
- Edge Functions تعيد رسائل خطأ عامة (`internal_error` / `forbidden_or_rate_limited`) بدون تسريب provider payload أو مفاتيح.
- لضبط الحدود التشغيلية استخدم متغيرات rate limit في `.env.local` (انظر `.env.example`).

## Supabase Setup
1. نفّذ كل ملفات `supabase/migrations/*.sql` بالترتيب (يتضمن جداول audit + rate limit).
2. فعّل RLS policies: `supabase/policies.sql`.
3. حمّل seed: `supabase/seed.sql`.
4. أنشئ storage bucket باسم `reports`.
5. انشر functions الموجودة في `supabase/functions/*`.
6. فعّل cron في `supabase/cron.sql` مع تمرير `Authorization: Bearer $SUPABASE_CRON_SECRET`.

## Key MVP UX Delivered
- Marketing pages: `/`, `/pricing`, `/docs`, `/about`, `/contact`
- App pages: `/app`, `/app/farms`, `/app/farms/[farmId]`, `/app/fields/[fieldId]`, `/app/reports`
- Public report route: `/r/[publicToken]`
- Dashboard يحتوي: Weather card, Irrigation recommendation, Alerts, NDVI chart
- Farms/Fields يحتوي: map preview + field insights

## Free-tier Guardrails
- لا استدعاء APIs خارجية في page request.
- التحديث عبر cron + edge functions فقط.
- استخدام cache tables (`external_api_cache`) وتقليل عدد الطلبات.
- قيود الباقات عبر `plan_limits` + `usage_events`.

## CI
GitHub Actions يشغّل:
- lint
- typecheck
- test
