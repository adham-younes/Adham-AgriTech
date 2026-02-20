import Link from 'next/link';
import { articles } from '@/lib/articles';

export default function DocsPage() {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-4 text-3xl font-bold">قاعدة المعرفة</h1>
      <div className="mb-4 rounded border bg-white p-3 text-sm">{articles.length} مقال عربي جاهز (seed) ومتصل بخطة SEO.</div>
      <div className="space-y-4">
        {articles.map((article) => (
          <Link key={article.slug} href={`/docs/${article.slug}`} className="block rounded-lg border bg-white p-4">
            <h2 className="font-semibold">{article.title}</h2>
            <p className="text-slate-600">{article.excerpt}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
