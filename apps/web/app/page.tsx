import Link from 'next/link';

const features = [
  { title: 'Water-Smart Advisor', text: 'توصية ري يومية قابلة للتنفيذ لكل حقل بناءً على ET0 مبسط.' },
  { title: 'Crop Stress Watch', text: 'مراقبة NDVI كل 5-7 أيام وتنبيه فوري عند هبوط المؤشر.' },
  { title: 'WaPOR Reports', text: 'تقرير إنتاجية المياه الشهري برابط مشاركة عام وآمن.' }
];

export default function LandingPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-12 p-6">
      <section className="rounded-2xl bg-emerald-900 p-10 text-white space-y-4">
        <h1 className="text-4xl font-bold">Adham AgriTech — إدارة زراعية ذكية مثل Agrio لكن أبسط وأسرع</h1>
        <p className="max-w-3xl">نجمع بيانات الطقس والأقمار الصناعية في لوحة واحدة تمنحك قرار ري يومي، مراقبة إجهاد النبات، وتقارير إنتاجية المياه.</p>
        <div className="flex gap-3">
          <Link href="/app" className="rounded bg-white px-5 py-2 font-semibold text-emerald-900">ابدأ مجانًا</Link>
          <Link href="/pricing" className="rounded border border-white px-5 py-2">عرض الأسعار</Link>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold">كيف تعمل المنصة؟</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {['أضف المزرعة والحقول', 'نحدّث الطقس وNDVI عبر Jobs مجدولة', 'استلم توصيات وتنبيهات وتقارير جاهزة'].map((step, idx) => (
            <div key={step} className="rounded-xl border bg-white p-4">
              <p className="font-bold text-emerald-700">{idx + 1}</p>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {features.map((feature) => (
          <article key={feature.title} className="rounded-xl border bg-white p-5">
            <h3 className="font-semibold">{feature.title}</h3>
            <p className="mt-2 text-slate-600">{feature.text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
