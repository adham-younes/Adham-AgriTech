import Link from 'next/link';
import { NdviChart } from '@/components/dashboard/ndvi-chart';
import { alerts, fields } from '@/lib/demo-data';
import { primaryAppCtaLabel, resolveUiState, unifiedValueProposition } from '@/lib/ux-copy';

function avg(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export default function DashboardPage({ searchParams }: { searchParams?: { state?: string } }) {
  const uiState = resolveUiState(searchParams?.state);

  if (uiState === 'loading') {
    return (
      <section className="space-y-6" aria-busy="true">
        <div className="h-24 animate-pulse rounded-2xl bg-white/10" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="h-36 animate-pulse rounded-2xl bg-white/10" />
          ))}
        </div>
        <div className="h-80 animate-pulse rounded-2xl bg-white/10" />
      </section>
    );
  }

  if (uiState === 'error') {
    return (
      <section className="agri-panel space-y-4 p-6 text-right">
        <h1 className="text-2xl font-black text-rose-300">تعذّر تحميل لوحة اليوم</h1>
        <p className="text-slate-300">فشل جلب بيانات الطقس وNDVI. تحقق من الاتصال أو أعد المزامنة.</p>
        <button className="w-fit rounded-xl bg-rose-500 px-4 py-2 text-sm font-bold text-white hover:bg-rose-400">إعادة المحاولة</button>
      </section>
    );
  }

  if (uiState === 'empty') {
    return (
      <section className="agri-panel space-y-4 p-6 text-right">
        <h1 className="text-2xl font-black">ابدأ بإضافة أول حقل</h1>
        <p className="text-slate-300">لا توجد بيانات تشغيل اليوم بعد. أضف مزرعة وحقلًا لبدء التوصيات اليومية.</p>
        <Link href="/app/farms" className="w-fit rounded-xl bg-emerald-400 px-4 py-2 text-sm font-black text-[#03200a] hover:bg-emerald-300">
          إضافة مزرعة الآن
        </Link>
      </section>
    );
  }

  const focusField = fields[0];
  const latestNdvi = focusField.ndviSeries.at(-1)?.value ?? 0;
  const previousNdvi = focusField.ndviSeries.at(-2)?.value ?? latestNdvi;
  const ndviChange = ((latestNdvi - previousNdvi) / Math.max(previousNdvi, 0.01)) * 100;
  const avgNdvi = avg(focusField.ndviSeries.map((point) => point.value));

  return (
    <section className="space-y-6 text-right">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-3xl">
          <span className="agri-badge">Farm: {focusField.name}</span>
          <h1 className="mt-3 text-3xl font-black tracking-tight">نظرة تشغيل اليوم</h1>
          <p className="mt-1 text-sm leading-relaxed text-slate-300">{unifiedValueProposition}</p>
        </div>
        <Link href={`/app/fields/${focusField.id}`} className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-black text-[#03200a] hover:bg-emerald-300">
          {primaryAppCtaLabel}
        </Link>
      </div>

      <article className="rounded-2xl border border-emerald-300/40 bg-emerald-500/10 p-5">
        <p className="text-xs font-bold text-emerald-200">الإجراء التالي للمزارع</p>
        <h2 className="mt-2 text-2xl font-black text-emerald-300">نفّذ ريًا بجرعة {focusField.irrigationToday.recommendedMm} مم خلال 6 ساعات</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-100">
          <li>• افتح صمام القطعة الشمالية أولًا لمدة 2.5 ساعة.</li>
          <li>• راقب ضغط الشبكة بعد أول 20 دقيقة.</li>
          <li>• ثبّت التنفيذ ثم حدّث القراءة المسائية.</li>
        </ul>
      </article>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="agri-panel p-5">
          <p className="text-xs text-slate-400">درجة الحرارة</p>
          <p className="mt-2 text-3xl font-black text-slate-100">{focusField.weatherToday.tempC}°</p>
          <p className="text-sm text-slate-400">رطوبة {focusField.weatherToday.humidity}%</p>
          <p className="mt-2 text-xs text-slate-500">آخر مزامنة: 05:00 ص</p>
        </article>
        <article className="agri-panel p-5">
          <p className="text-xs text-slate-400">توصية الري اليوم</p>
          <p className="mt-2 text-3xl font-black text-emerald-300">{focusField.irrigationToday.recommendedMm} مم</p>
          <p className="text-sm text-slate-400">ET0: {focusField.irrigationToday.et0Mm} مم</p>
          <p className="mt-2 text-xs text-emerald-300">درجة الثقة: {Math.round(focusField.irrigationToday.confidence * 100)}%</p>
        </article>
        <article className="agri-panel p-5">
          <p className="text-xs text-slate-400">متوسط NDVI</p>
          <p className="mt-2 text-3xl font-black text-slate-100">{avgNdvi.toFixed(2)}</p>
          <p className={`text-sm font-semibold ${ndviChange >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
            {ndviChange >= 0 ? '+' : ''}
            {ndviChange.toFixed(1)}% مقارنة بالقراءة السابقة
          </p>
          <p className="mt-2 text-xs text-slate-500">آخر مزامنة NDVI: أمس 07:10 م</p>
        </article>
        <article className="agri-panel p-5">
          <p className="text-xs text-slate-400">الإنذارات المفتوحة</p>
          <p className="mt-2 text-3xl font-black text-amber-300">{alerts.length}</p>
          <p className="text-sm text-slate-400">آخر تحديث 05:00 ص</p>
          <p className="mt-2 text-xs text-slate-500">ثقة البيانات: مرتفعة</p>
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
    </section>
  );
}
