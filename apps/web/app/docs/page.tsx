import Link from 'next/link';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { Panel } from '@/components/ui/panel';
import { addLangParam, AppSearchParams, localeFromSearchParams, resolveSearchParams } from '@/lib/i18n';
import { articles } from '@/lib/articles';

export default async function DocsPage({
  searchParams
}: {
  searchParams?: Promise<AppSearchParams>;
}) {
  const locale = localeFromSearchParams(await resolveSearchParams(searchParams));
  const copy =
    locale === 'ar'
      ? {
          title: 'قاعدة المعرفة',
          subtitle: `${articles.length} مقالًا عربيًا جاهزًا لدعم التشغيل الزراعي والـ SEO.`
        }
      : {
          title: 'Knowledge Base',
          subtitle: `${articles.length} practical articles to support farm operations and SEO.`
        };

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl space-y-6 px-6 py-10 text-slate-100">
      <div className="flex justify-end">
        <LanguageToggle />
      </div>
      <section>
        <h1 className="text-4xl font-black">{copy.title}</h1>
        <p className="mt-2 text-slate-400">{copy.subtitle}</p>
      </section>

      <section className="grid gap-4">
        {articles.map((article) => (
          <Link key={article.slug} href={addLangParam(`/docs/${article.slug}`, locale)} className="block">
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
