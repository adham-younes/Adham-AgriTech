import { LanguageToggle } from '@/components/ui/language-toggle';
import { Panel } from '@/components/ui/panel';
import { AppSearchParams, localeFromSearchParams, resolveSearchParams } from '@/lib/i18n';

export default async function ContactPage({
  searchParams
}: {
  searchParams?: Promise<AppSearchParams>;
}) {
  const locale = localeFromSearchParams(await resolveSearchParams(searchParams));
  const copy =
    locale === 'ar'
      ? {
          title: 'تواصل معنا',
          subtitle: 'للاستفسارات التجارية أو التكامل المؤسسي:'
        }
      : {
          title: 'Contact Us',
          subtitle: 'For commercial requests and enterprise integrations:'
        };

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl space-y-6 px-6 py-10 text-slate-100">
      <div className="flex justify-end">
        <LanguageToggle />
      </div>
      <h1 className="text-4xl font-black">{copy.title}</h1>
      <Panel as="article" className="p-6">
        <p className="text-slate-300">{copy.subtitle}</p>
        <a href="mailto:hello@adham-agritech.com" className="mt-3 inline-block text-lg font-bold text-emerald-300 hover:text-emerald-200">
          hello@adham-agritech.com
        </a>
      </Panel>
    </main>
  );
}
