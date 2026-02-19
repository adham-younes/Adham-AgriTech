const plans = [
  { name: 'Free', items: ['حقل واحد', 'توصية يومية', 'NDVI أسبوعي', 'تقرير شهري واحد'] },
  { name: 'Pro', items: ['10 حقول', 'تنبيهات متقدمة', 'تقارير غير محدودة (قريبًا)'] }
];

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-3xl font-bold mb-6">الأسعار</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {plans.map((plan) => (
          <article key={plan.name} className="rounded-xl border bg-white p-6">
            <h2 className="text-2xl font-semibold">{plan.name}</h2>
            <ul className="mt-4 list-disc pr-6 space-y-2">{plan.items.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
        ))}
      </div>
    </main>
  );
}
