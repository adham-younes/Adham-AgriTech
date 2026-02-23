import { Button } from '@/components/ui/button';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { Panel } from '@/components/ui/panel';
import { AppSearchParams, localeFromSearchParams, resolveSearchParams } from '@/lib/i18n';

const plans = {
  ar: [
    {
      name: 'Free',
      price: '$0',
      items: ['حقل واحد', 'توصية ري يومية', 'NDVI أسبوعي', 'تقرير شهري واحد'],
      cta: 'ابدأ مجانًا'
    },
    {
      name: 'Pro',
      price: '$39',
      items: ['10 حقول', 'تنبيهات متقدمة', 'لوحات تشغيل احترافية', 'تقارير غير محدودة (قريبًا)'],
      cta: 'ترقية إلى Pro'
    }
  ],
  en: [
    {
      name: 'Free',
      price: '$0',
      items: ['1 field', 'Daily irrigation advice', 'Weekly NDVI', '1 monthly report'],
      cta: 'Start Free'
    },
    {
      name: 'Pro',
      price: '$39',
      items: ['10 fields', 'Advanced alerts', 'Operational dashboards', 'Unlimited reports (soon)'],
      cta: 'Upgrade to Pro'
    }
  ]
} as const;

export default async function PricingPage({
  searchParams
}: {
  searchParams?: Promise<AppSearchParams>;
}) {
  const locale = localeFromSearchParams(await resolveSearchParams(searchParams));
  const copy =
    locale === 'ar'
      ? { title: 'الأسعار', subtitle: 'خطط مرنة للمزارع الصغيرة والتشغيل المؤسسي.' }
      : { title: 'Pricing', subtitle: 'Flexible plans for small farms and enterprise operations.' };

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl space-y-8 px-6 py-10 text-slate-100">
      <div className="flex justify-end">
        <LanguageToggle />
      </div>
      <section>
        <h1 className="text-4xl font-black">{copy.title}</h1>
        <p className="mt-2 text-slate-400">{copy.subtitle}</p>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {plans[locale].map((plan) => (
          <Panel key={plan.name} as="article" className="p-6">
            <p className="text-sm text-slate-400">{plan.name}</p>
            <h2 className="mt-2 text-4xl font-black text-emerald-300">{plan.price}</h2>
            <ul className="mt-4 list-disc space-y-2 pr-5 text-slate-200">
              {plan.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Button className="mt-6" type="button">
              {plan.cta}
            </Button>
          </Panel>
        ))}
      </section>
    </main>
  );
}
