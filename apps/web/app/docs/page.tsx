import Link from 'next/link';
import { articles } from '@/lib/articles';

const colorTokens = [
  { name: '--agri-bg-base', value: '#030a05', usage: 'خلفية التطبيق الأساسية' },
  { name: '--agri-bg-surface', value: 'rgba(255,255,255,0.03)', usage: 'خلفيات البطاقات' },
  { name: '--agri-bg-brand', value: '#10b981', usage: 'زر/عنصر رئيسي' },
  { name: '--agri-border-subtle', value: 'rgba(255,255,255,0.1)', usage: 'حدود ثانوية' },
  { name: '--agri-border-strong', value: 'rgba(16,185,129,0.4)', usage: 'حدود hover/focus' },
  { name: '--agri-text-primary', value: '#f1f5f9', usage: 'نص على الخلفيات الداكنة' },
  { name: '--agri-text-muted', value: '#94a3b8', usage: 'نص مساعد/معلومات ثانوية' }
];

const shadowTokens = [
  { name: '--agri-shadow-card', value: '0 0 30px rgba(5,199,5,0.06)', usage: 'بطاقات/لوحات' },
  { name: '--agri-shadow-glow', value: 'inset 0 0 16px rgba(16,185,129,0.15)', usage: 'حالة active' }
];

export default function DocsPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl space-y-6 px-6 py-10 agri-text-primary">
      <section className="space-y-2">
        <h1 className="text-4xl font-black">قاعدة المعرفة</h1>
        <p className="agri-text-muted">{articles.length} مقالًا عربيًا جاهزًا لدعم التشغيل الزراعي والـ SEO.</p>
      </section>

      <section className="agri-panel space-y-4 p-5">
        <h2 className="text-2xl font-black">قواعد UI القياسية</h2>
        <p className="agri-text-secondary">استخدم CSS variables وUtilities الموحدة بدل تكرار قيم hex داخل المكونات.</p>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-lg font-bold">توكنات الألوان (أساسي/حدود/خلفيات)</h3>
            <ul className="space-y-2 text-sm">
              {colorTokens.map((token) => (
                <li key={token.name} className="rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-bg-elevated)] px-3 py-2">
                  <p className="font-semibold">{token.name}</p>
                  <p className="agri-text-secondary">{token.value}</p>
                  <p className="agri-text-muted">{token.usage}</p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-2 text-lg font-bold">توكنات الظلال</h3>
            <ul className="space-y-2 text-sm">
              {shadowTokens.map((token) => (
                <li key={token.name} className="rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-bg-elevated)] px-3 py-2">
                  <p className="font-semibold">{token.name}</p>
                  <p className="agri-text-secondary">{token.value}</p>
                  <p className="agri-text-muted">{token.usage}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid gap-3 text-sm md:grid-cols-3">
          <div className="agri-card p-3">
            <p className="font-bold">البطاقات</p>
            <p className="agri-text-muted">استخدم: agri-card + agri-card-hover</p>
          </div>
          <div className="agri-card p-3">
            <p className="font-bold">الأزرار</p>
            <p className="agri-text-muted">استخدم: agri-btn + agri-btn-primary/secondary</p>
          </div>
          <div className="agri-card p-3">
            <p className="font-bold">التفاعل</p>
            <p className="agri-text-muted">يجب دعم hover/focus-visible/disabled دائمًا.</p>
          </div>
        </div>

        <div className="rounded-xl border border-emerald-400/35 bg-emerald-500/10 p-4 text-sm">
          <p className="font-bold text-emerald-200">إرشاد التباين (Contrast)</p>
          <p className="mt-1 text-emerald-100/90">
            على الخلفيات الداكنة، استخدم النص الأساسي <code>--agri-text-primary</code> أو الثانوي
            <code> --agri-text-secondary</code> بدل درجات منخفضة التباين، مع الالتزام بحد أدنى يقارب WCAG AA
            للنصوص العادية.
          </p>
        </div>
      </section>

      <section className="grid gap-4">
        {articles.map((article) => (
          <Link key={article.slug} href={`/docs/${article.slug}`} className="agri-panel block p-5 hover:border-emerald-400/40">
            <h2 className="text-xl font-black agri-text-primary">{article.title}</h2>
            <p className="mt-2 agri-text-secondary">{article.excerpt}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
