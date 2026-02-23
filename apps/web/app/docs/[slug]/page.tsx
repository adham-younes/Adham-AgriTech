import { LanguageToggle } from '@/components/ui/language-toggle';
import { Panel } from '@/components/ui/panel';
import { AppSearchParams, localeFromSearchParams, resolveSearchParams } from '@/lib/i18n';
import { articles } from '@/lib/articles';

export default async function DocDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<AppSearchParams>;
}) {
  const resolvedParams = await params;
  const locale = localeFromSearchParams(await resolveSearchParams(searchParams));
  const article = articles.find((item) => item.slug === resolvedParams.slug);
  if (!article) return <main className="p-6 text-slate-100">{locale === 'ar' ? 'المقال غير موجود.' : 'Article not found.'}</main>;

  const copy =
    locale === 'ar'
      ? {
          steps: 'خطوات تطبيقية سريعة',
          s1: 'راجع بيانات الطقس اليومية للحقل.',
          s2: 'قارن NDVI الحالي مع متوسط آخر 3 أسابيع.',
          s3: 'عدّل جرعة الري بنسبة 10% حسب حالة الإجهاد.'
        }
      : {
          steps: 'Quick practical steps',
          s1: 'Review daily field weather values.',
          s2: 'Compare current NDVI against the last 3-week average.',
          s3: 'Adjust irrigation dose by 10% based on stress indicators.'
        };

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl space-y-5 px-6 py-10 text-slate-100">
      <div className="flex justify-end">
        <LanguageToggle />
      </div>
      <h1 className="text-4xl font-black">{article.title}</h1>
      <p className="text-slate-300">{article.excerpt}</p>

      <Panel as="article" className="p-5">
        <h2 className="mb-3 text-xl font-black">{copy.steps}</h2>
        <ol className="list-decimal space-y-2 pr-5 text-slate-200">
          <li>{copy.s1}</li>
          <li>{copy.s2}</li>
          <li>{copy.s3}</li>
        </ol>
      </Panel>
    </main>
  );
}
