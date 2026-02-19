import { articles } from '@/lib/articles';

export default function DocDetailPage({ params }: { params: { slug: string } }) {
  const article = articles.find((item) => item.slug === params.slug);
  if (!article) return <main className="p-6">المقال غير موجود.</main>;
  return (
    <main className="mx-auto max-w-3xl space-y-4 p-6">
      <h1 className="text-3xl font-bold">{article.title}</h1>
      <p>{article.excerpt}</p>
      <ol className="list-decimal space-y-2 pr-5">
        <li>راجع بيانات الطقس اليومية.</li>
        <li>قارن NDVI الحالي بالمتوسط.</li>
        <li>عدل قرار الري 10% صعودًا أو هبوطًا.</li>
      </ol>
    </main>
  );
}
