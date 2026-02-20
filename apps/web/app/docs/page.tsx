import Link from 'next/link';
import { Panel } from '@/components/ui/panel';
import { articles } from '@/lib/articles';

export default function DocsPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl space-y-6 px-6 py-10 text-slate-100">
      <section>
        <h1 className="text-4xl font-black">قاعدة المعرفة</h1>
        <p className="mt-2 text-slate-400">{articles.length} مقالًا عربيًا جاهزًا لدعم التشغيل الزراعي والـ SEO.</p>
      </section>

      <section className="grid gap-4">
        {articles.map((article) => (
          <Link key={article.slug} href={`/docs/${article.slug}`} className="block">
            <Panel as="article" className="p-5 hover:border-emerald-400/40">
              <h2 className="text-xl font-black text-slate-100">{article.title}</h2>
              <p className="mt-2 text-slate-300">{article.excerpt}</p>
            </Panel>
          </Link>
        ))}
      </section>
    </main>
  );
}
