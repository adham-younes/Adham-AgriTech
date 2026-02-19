import { articles } from '@/lib/mock-data';

export default function DocDetailPage({ params }: { params: { slug: string } }) {
  const article = articles.find((item) => item.slug === params.slug);
  if (!article) return <main className="p-6">المقال غير موجود.</main>;
  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-3xl font-bold">{article.title}</h1>
      <p>{article.excerpt}</p>
      <p>سيتم تحميل المحتوى من جدول المقالات في Supabase مع دعم Markdown.</p>
    </main>
  );
}
