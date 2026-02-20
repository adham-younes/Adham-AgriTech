import { NdviChart } from '@/components/dashboard/ndvi-chart';
import { MapPreview } from '@/components/maps/map-preview';
import { alerts, fields } from '@/lib/demo-data';

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export default function FieldDetailsPage({ params }: { params: { fieldId: string } }) {
  const field = fields.find((item) => item.id === params.fieldId);
  if (!field) return <section>الحقل غير موجود.</section>;

  const fieldAlerts = alerts.filter((alert) => alert.fieldId === field.id);
  const latestNdvi = field.ndviSeries.at(-1)?.value ?? 0;
  const avgNdvi = average(field.ndviSeries.map((point) => point.value));

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="agri-badge">{field.cropType.toUpperCase()}</span>
          <h1 className="mt-2 text-3xl font-black">{field.name}</h1>
          <p className="mt-1 text-sm text-slate-400">
            {field.areaHa} هكتار • آخر تحديث NDVI: {field.ndviSeries.at(-1)?.date}
          </p>
        </div>
        <button className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-black text-[#03200a] hover:bg-emerald-300">تصدير تقرير الحقل</button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="agri-panel p-5">
          <p className="text-xs text-slate-400">Latest NDVI</p>
          <p className="mt-2 text-3xl font-black text-emerald-300">{latestNdvi.toFixed(2)}</p>
        </article>
        <article className="agri-panel p-5">
          <p className="text-xs text-slate-400">متوسط NDVI</p>
          <p className="mt-2 text-3xl font-black text-slate-100">{avgNdvi.toFixed(2)}</p>
        </article>
        <article className="agri-panel p-5">
          <p className="text-xs text-slate-400">رطوبة الهواء</p>
          <p className="mt-2 text-3xl font-black text-slate-100">{field.weatherToday.humidity}%</p>
        </article>
        <article className="agri-panel p-5">
          <p className="text-xs text-slate-400">موعد الري المقترح</p>
          <p className="mt-2 text-3xl font-black text-amber-300">{field.irrigationToday.recommendedMm} مم</p>
        </article>
      </div>

      <article className="agri-panel overflow-hidden p-4">
        <MapPreview lat={field.centroidLat} lng={field.centroidLng} height={420} />
      </article>

      <div className="grid gap-4 xl:grid-cols-3">
        <article className="agri-panel p-5 xl:col-span-2">
          <h2 className="mb-3 text-lg font-black text-slate-100">منحنى NDVI لآخر القراءات</h2>
          <NdviChart data={field.ndviSeries} />
        </article>

        <article className="agri-panel p-5">
          <h2 className="mb-3 text-lg font-black text-slate-100">التنبيهات الميدانية</h2>
          <div className="space-y-3">
            {fieldAlerts.length ? (
              fieldAlerts.map((alert) => (
                <div key={alert.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <p className="text-sm font-semibold text-slate-100">{alert.message}</p>
                  <p className="mt-1 text-xs text-slate-400">Severity {alert.severity} • {alert.date}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">لا توجد تنبيهات على هذا الحقل.</p>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
