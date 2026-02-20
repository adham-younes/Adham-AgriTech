import Link from 'next/link';
import { MapPreview } from '@/components/maps/map-preview';
import { fields, farms } from '@/lib/demo-data';

export default function FarmDetailsPage({ params }: { params: { farmId: string } }) {
  const farm = farms.find((item) => item.id === params.farmId);
  const farmFields = fields.filter((item) => item.farmId === params.farmId);

  if (!farm) return <section>المزرعة غير موجودة.</section>;

  const totalArea = farmFields.reduce((sum, field) => sum + field.areaHa, 0);
  const avgNdvi =
    farmFields.reduce((sum, field) => sum + (field.ndviSeries.at(-1)?.value ?? 0), 0) / Math.max(farmFields.length, 1);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="agri-badge">{farm.governorate}</span>
          <h1 className="mt-2 text-3xl font-black">{farm.name}</h1>
          <p className="mt-1 text-sm text-slate-400">متابعة مباشرة للحقول، المؤشرات، والتوصيات اليومية.</p>
        </div>
        <Link href="/app/farms" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-emerald-300 hover:text-emerald-300">
          العودة لإدارة المزارع
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="agri-panel p-5">
          <p className="text-xs text-slate-400">عدد الحقول</p>
          <p className="mt-2 text-3xl font-black text-emerald-300">{farmFields.length}</p>
        </article>
        <article className="agri-panel p-5">
          <p className="text-xs text-slate-400">المساحة الإجمالية</p>
          <p className="mt-2 text-3xl font-black text-slate-100">{totalArea.toFixed(1)} ha</p>
        </article>
        <article className="agri-panel p-5">
          <p className="text-xs text-slate-400">متوسط NDVI الحالي</p>
          <p className="mt-2 text-3xl font-black text-slate-100">{avgNdvi.toFixed(2)}</p>
        </article>
      </div>

      <article className="agri-panel overflow-hidden p-4">
        {farmFields[0] ? <MapPreview lat={farmFields[0].centroidLat} lng={farmFields[0].centroidLng} height={360} /> : null}
      </article>

      <div className="grid gap-4 md:grid-cols-2">
        {farmFields.map((field) => {
          const latestNdvi = field.ndviSeries.at(-1)?.value ?? 0;
          return (
            <article key={field.id} className="agri-panel p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-black text-slate-100">{field.name}</h3>
                  <p className="text-sm text-slate-400">
                    {field.cropType} • {field.areaHa} هكتار
                  </p>
                </div>
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300">NDVI {latestNdvi.toFixed(2)}</span>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <p className="text-slate-400">توصية الري</p>
                  <p className="mt-1 font-black text-slate-100">{field.irrigationToday.recommendedMm} مم</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <p className="text-slate-400">درجة الحرارة</p>
                  <p className="mt-1 font-black text-slate-100">{field.weatherToday.tempC}°</p>
                </div>
              </div>

              <Link href={`/app/fields/${field.id}`} className="text-sm font-black text-emerald-300 hover:text-emerald-200">
                فتح شاشة الحقل
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
