import Link from 'next/link';
import { NdviChart } from '@/components/dashboard/ndvi-chart';
import { alerts, fields } from '@/lib/demo-data';

export default function DashboardPage() {
  const focusField = fields[0];

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">لوحة اليوم</h1>
        <Link href={`/app/fields/${focusField.id}`} className="rounded bg-emerald-700 px-4 py-2 text-white">
          فتح الحقل الرئيسي
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-lg border bg-white p-4">
          <h2 className="font-semibold">طقس اليوم</h2>
          <p className="text-xl font-bold text-emerald-700">{focusField.weatherToday.tempC}°C</p>
          <p className="text-sm text-slate-600">رياح {focusField.weatherToday.windKmh} كم/س</p>
        </article>
        <article className="rounded-lg border bg-white p-4">
          <h2 className="font-semibold">توصية الري</h2>
          <p className="text-xl font-bold text-emerald-700">{focusField.irrigationToday.recommendedMm} مم</p>
          <p className="text-sm text-slate-600">ET0: {focusField.irrigationToday.et0Mm} مم</p>
        </article>
        <article className="rounded-lg border bg-white p-4">
          <h2 className="font-semibold">الإنذارات المفتوحة</h2>
          <p className="text-xl font-bold text-amber-600">{alerts.length}</p>
          <p className="text-sm text-slate-600">آخر تحديث 05:00 صباحًا</p>
        </article>
        <article className="rounded-lg border bg-white p-4">
          <h2 className="font-semibold">ثقة النموذج</h2>
          <p className="text-xl font-bold text-emerald-700">{Math.round(focusField.irrigationToday.confidence * 100)}%</p>
          <p className="text-sm text-slate-600">NASA + NDVI Trend</p>
        </article>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-lg border bg-white p-4 lg:col-span-2">
          <h2 className="mb-2 font-semibold">اتجاه NDVI (آخر 4 قراءات)</h2>
          <NdviChart data={focusField.ndviSeries} />
        </article>
        <article className="rounded-lg border bg-white p-4">
          <h2 className="mb-3 font-semibold">آخر التنبيهات</h2>
          <ul className="space-y-3 text-sm">
            {alerts.map((alert) => (
              <li key={alert.id} className="rounded border p-2">
                <p className="font-medium">{alert.message}</p>
                <p className="text-slate-500">{alert.date}</p>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
