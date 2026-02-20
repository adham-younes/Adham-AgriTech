import Link from 'next/link';
import { NdviChart } from '@/components/dashboard/ndvi-chart';
import { alerts, fields } from '@/lib/demo-data';

function avg(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export default function DashboardPage() {
  const focusField = fields[0];
  const latestNdvi = focusField.ndviSeries.at(-1)?.value ?? 0;
  const previousNdvi = focusField.ndviSeries.at(-2)?.value ?? latestNdvi;
  const ndviChange = ((latestNdvi - previousNdvi) / Math.max(previousNdvi, 0.01)) * 100;
  const avgNdvi = avg(focusField.ndviSeries.map((point) => point.value));

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="agri-badge">Farm: {focusField.name}</span>
          <h1 className="mt-3 text-3xl font-black tracking-tight">نظرة تشغيل اليوم</h1>
          <p className="mt-1 text-sm text-slate-400">مزامنة الطقس، NDVI، والتوصيات اليومية في شاشة واحدة.</p>
        </div>
        <Link href={`/app/fields/${focusField.id}`} className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-black text-[#03200a] hover:bg-emerald-300">
          فتح لوحة الحقل
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="agri-panel p-5">
          <p className="text-xs text-slate-400">درجة الحرارة</p>
          <p className="mt-2 text-3xl font-black text-slate-100">{focusField.weatherToday.tempC}°</p>
          <p className="text-sm text-slate-400">رطوبة {focusField.weatherToday.humidity}%</p>
        </article>
        <article className="agri-panel p-5">
          <p className="text-xs text-slate-400">توصية الري اليوم</p>
          <p className="mt-2 text-3xl font-black text-emerald-300">{focusField.irrigationToday.recommendedMm} مم</p>
          <p className="text-sm text-slate-400">ET0: {focusField.irrigationToday.et0Mm} مم</p>
        </article>
        <article className="agri-panel p-5">
          <p className="text-xs text-slate-400">متوسط NDVI</p>
          <p className="mt-2 text-3xl font-black text-slate-100">{avgNdvi.toFixed(2)}</p>
          <p className={`text-sm font-semibold ${ndviChange >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
            {ndviChange >= 0 ? '+' : ''}
            {ndviChange.toFixed(1)}% مقارنة بالقراءة السابقة
          </p>
        </article>
        <article className="agri-panel p-5">
          <p className="text-xs text-slate-400">الإنذارات المفتوحة</p>
          <p className="mt-2 text-3xl font-black text-amber-300">{alerts.length}</p>
          <p className="text-sm text-slate-400">آخر تحديث 05:00 ص</p>
        </article>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="agri-panel p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-100">اتجاه NDVI</h2>
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300">القيمة الحالية {latestNdvi.toFixed(2)}</span>
          </div>
          <NdviChart data={focusField.ndviSeries} />
        </article>

        <article className="agri-panel p-5">
          <h2 className="mb-3 text-lg font-black text-slate-100">آخر التنبيهات</h2>
          <div className="space-y-3">
            {alerts.length ? (
              alerts.map((alert) => (
                <div key={alert.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <p className="text-sm font-semibold text-slate-100">{alert.message}</p>
                  <p className="mt-1 text-xs text-slate-400">{alert.date}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">لا توجد تنبيهات.</p>
            )}
          </div>
        </article>
      </div>

      <article className="relative overflow-hidden rounded-3xl border border-emerald-300/35 bg-gradient-to-l from-emerald-400 to-emerald-600 p-6 text-[#04210b]">
        <div className="relative z-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider">Smart Action</p>
            <h3 className="mt-1 text-2xl font-black">تنفيذ الري خلال 6 ساعات القادمة</h3>
            <p className="mt-2 text-sm font-medium">الثقة الحالية {Math.round(focusField.irrigationToday.confidence * 100)}% مبنية على الطقس + NDVI + اتجاه الرطوبة.</p>
          </div>
          <Link href={`/app/fields/${focusField.id}`} className="rounded-xl bg-[#04210b] px-5 py-2 text-sm font-black text-emerald-200 hover:bg-[#021607]">
            فتح خطة التنفيذ
          </Link>
        </div>
      </article>
    </section>
  );
}
