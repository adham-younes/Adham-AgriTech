import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="mx-auto max-w-5xl p-6 space-y-12">
      <section className="rounded-2xl bg-emerald-900 text-white p-10 space-y-4">
        <h1 className="text-4xl font-bold">توصيات ري يومية + مراقبة إجهاد المحاصيل + تقارير إنتاجية المياه</h1>
        <p>منصة زراعة ذكية تعتمد على بيانات فضائية ومناخية مجانية لتقليل تكلفة المياه وزيادة الإنتاجية.</p>
        <Link href="/app" className="inline-block rounded bg-white text-emerald-900 px-5 py-2 font-semibold">ابدأ مجانًا</Link>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4">كيف تعمل المنصة؟</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {['أضف الحقول', 'نجلب الطقس و NDVI', 'استلم توصية قابلة للتنفيذ'].map((step, idx) => (
            <div key={step} className="rounded-xl border bg-white p-4">
              <p className="text-emerald-700 font-bold">{idx + 1}</p>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
