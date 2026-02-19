# Security
- RLS مفعل على كل الجداول العامة.
- الوصول داخل المنظمة فقط عبر `organization_members`.
- عرض التقارير العامة يتم عبر `public_token` من view `public_reports`.
- عمليات الكتابة المجدولة عبر service role في Edge Functions.
