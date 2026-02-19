import Link from 'next/link';
import { farms, fields, planLimits } from '@/lib/demo-data';

export default function FarmsPage() {
  const currentPlan = 'free';
  const totalFields = fields.length;
  const canCreateMore = totalFields < planLimits[currentPlan].fields;

  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-bold">المزارع</h1>
      <div className="rounded-xl border bg-white p-4 text-sm">
        الخطة الحالية: <b>{currentPlan}</b> — الحد الأقصى للحقول: {planLimits[currentPlan].fields}. عدد الحقول الحالية: {totalFields}.
      </div>
      <button disabled={!canCreateMore} className="rounded bg-emerald-700 px-4 py-2 text-white disabled:opacity-50">
        إضافة مزرعة
      </button>
      <div className="grid gap-4 md:grid-cols-2">
        {farms.map((farm) => (
          <article key={farm.id} className="rounded border bg-white p-4">
            <h2 className="font-semibold">{farm.name}</h2>
            <p className="text-sm text-slate-600">{farm.governorate}</p>
            <Link href={`/app/farms/${farm.id}`} className="mt-3 inline-block text-emerald-700">
              عرض التفاصيل ←
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
