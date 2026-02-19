import Link from 'next/link';
import { articles } from '@/lib/mock-data';

export default function DocsPage() {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-3xl font-bold mb-4">قاعدة المعرفة</h1>
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
