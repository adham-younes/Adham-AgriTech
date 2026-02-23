import { LanguageToggle } from '@/components/ui/language-toggle';
import { Panel } from '@/components/ui/panel';
import { AppSearchParams, localeFromSearchParams, resolveSearchParams } from '@/lib/i18n';

export default async function AboutPage({
  searchParams
}: {
  searchParams?: Promise<AppSearchParams>;
}) {
  const locale = localeFromSearchParams(await resolveSearchParams(searchParams));
  const copy =
    locale === 'ar'
      ? {
          title: 'عن Adham AgriTech',
          p1: 'نبني منصة تشغيل زراعي عملية تربط بيانات الطقس والأقمار الصناعية بقرارات يومية قابلة للتنفيذ على أرض الواقع.',
          p2: 'هدفنا هو تقليل هدر المياه، رفع الإنتاجية، وتمكين فرق التشغيل من رؤية موحدة وواضحة على مستوى المزرعة والحقل.'
        }
      : {
          title: 'About Adham AgriTech',
          p1: 'We build a practical digital agronomy platform that turns weather and satellite data into actionable daily decisions.',
          p2: 'Our mission is to reduce water waste, increase productivity, and give operations teams a unified view at farm and field level.'
        };

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl space-y-6 px-6 py-10 text-slate-100">
      <div className="flex justify-end">
        <LanguageToggle />
      </div>
      <h1 className="text-4xl font-black">{copy.title}</h1>
      <Panel as="article" className="p-6 leading-8 text-slate-300">
        <p>{copy.p1}</p>
        <p className="mt-3">{copy.p2}</p>
      </Panel>
    </main>
  );
}
