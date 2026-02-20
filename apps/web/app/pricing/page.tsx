export const revalidate = 3600;

const plans = [
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
];

export default function PricingPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl space-y-8 px-6 py-10 text-slate-100">
      <section>
        <h1 className="text-4xl font-black">الأسعار</h1>
        <p className="mt-2 text-slate-400">خطط مرنة للمزارع الصغيرة والتشغيل المؤسسي.</p>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {plans.map((plan) => (
          <article key={plan.name} className="agri-panel p-6">
            <p className="text-sm text-slate-400">{plan.name}</p>
            <h2 className="mt-2 text-4xl font-black text-emerald-300">{plan.price}</h2>
            <ul className="mt-4 list-disc space-y-2 pr-5 text-slate-200">
              {plan.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <button className="mt-6 rounded-xl bg-emerald-400 px-4 py-2 text-sm font-black text-[#03200a] hover:bg-emerald-300">{plan.cta}</button>
          </article>
        ))}
      </section>
    </main>
  );
}
