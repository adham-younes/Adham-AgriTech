# Adham AgriTech

منصة SaaS للزراعة الذكية: توصيات ري يومية، مراقبة إجهاد المحاصيل عبر NDVI، وتقارير إنتاجية المياه.

## Tech Stack
- Next.js (App Router + TypeScript + Tailwind)
- Supabase (Postgres/Auth/Storage/RLS/Edge Functions/Cron)
- Vercel Hobby

## Project Structure
- `apps/web`: واجهة الويب (تسويقية + تطبيق داخلي)
- `packages/lib`: عملاء APIs (NASA POWER, WaPOR, Sentinel)
- `supabase`: migrations, policies, seed, cron, edge functions
- `docs`: وثائق المنتج والتشغيل

## Local Setup
1. ثبت pnpm + Node 20+
2. انسخ المتغيرات:
   ```bash
   cp .env.example .env.local
   ```
3. ثبت الحزم:
   ```bash
   pnpm install
   ```
4. شغل التطبيق:
   ```bash
   pnpm dev
   ```

## Supabase Setup
1. أنشئ مشروع Supabase.
2. نفذ migration:
   - `supabase/migrations/202603010001_init.sql`
   - `supabase/policies.sql`
3. نفذ seed:
   - `supabase/seed.sql`
4. أنشئ bucket باسم `reports`.
5. انشر edge functions من `supabase/functions/*`.
6. فعّل الجدولة عبر `supabase/cron.sql` مع إعداد:
   - `app.settings.supabase_functions_base_url`
   - `app.settings.service_role_key`

## Vercel Deployment
1. اربط المستودع مع Vercel.
2. عيّن كل متغيرات البيئة من `.env.example`.
3. استخدم Build Command: `pnpm build`.

## Free-tier Guardrails
- الصفحات تقرأ من جداول cache الداخلية فقط.
- التحديثات الخارجية تتم عبر Cron/Edge Functions.
- زر Refresh يجب أن يكون محدود quota حسب `plan_limits`.
