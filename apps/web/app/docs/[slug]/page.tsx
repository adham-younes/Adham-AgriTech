export const revalidate = 3600;

import { articles } from '@/lib/articles';

export default function DocDetailPage({ params }: { params: { slug: string } }) {
  const article = articles.find((item) => item.slug === params.slug);
  if (!article) return <main className="p-6 text-slate-100">المقال غير موجود.</main>;

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl space-y-5 px-6 py-10 text-slate-100">
      <h1 className="text-4xl font-black">{article.title}</h1>
      <p className="text-slate-300">{article.excerpt}</p>

      <article className="agri-panel p-5">
        <h2 className="mb-3 text-xl font-black">خطوات تطبيقية سريعة</h2>
        <ol className="list-decimal space-y-2 pr-5 text-slate-200">
          <li>راجع بيانات الطقس اليومية للحقل.</li>
          <li>قارن NDVI الحالي مع متوسط آخر 3 أسابيع.</li>
          <li>عدّل جرعة الري بنسبة 10% حسب حالة الإجهاد.</li>
        </ol>
      </article>
    </main>
  );
}
