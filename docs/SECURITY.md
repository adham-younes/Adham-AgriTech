# Security
- RLS مفعل على كل الجداول العامة.
- الوصول داخل المنظمة فقط عبر `organization_members`.
- عرض التقارير العامة يتم عبر `public_token` من view `public_reports`.
- عمليات الكتابة المجدولة عبر service role في Edge Functions.
- جميع endpoints الحساسة في Edge Functions تتحقق من `Authorization` بمفتاح service role.
- التحقق الآلي من وجود سياسات الحماية الأساسية: `node scripts/validate-security.mjs`.
- تطبيق security headers على Next.js (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`).
