import Link from 'next/link';
import { farms, fields, planLimits } from '@/lib/demo-data';

function cropLabel(value: string) {
  const map: Record<string, string> = {
    tomato: 'طماطم',
    wheat: 'قمح'
  };
  return map[value] ?? value;
}

export default function FarmsPage() {
  const currentPlan = 'free';
  const totalFields = fields.length;
  const canCreateMore = totalFields < planLimits[currentPlan].fields;
  const totalArea = fields.reduce((sum, field) => sum + field.areaHa, 0);
  const avgNdvi =
    fields.reduce((sum, field) => sum + (field.ndviSeries.at(-1)?.value ?? 0), 0) / Math.max(fields.length, 1);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">إدارة المزارع والحقول</h1>
          <p className="mt-1 text-sm text-slate-400">عرض تشغيلي موحّد للمزارع، المساحة، وحالة الحقول.</p>
        </div>
        <button
          disabled={!canCreateMore}
          className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-black text-[#03220a] hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-500"
        >
          إضافة مزرعة جديدة
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="agri-panel p-5">
          <p className="text-xs text-slate-400">إجمالي المساحة</p>
          <p className="mt-2 text-3xl font-black text-slate-100">{totalArea.toFixed(1)} ha</p>
        </article>
        <article className="agri-panel p-5">
          <p className="text-xs text-slate-400">عدد الحقول</p>
          <p className="mt-2 text-3xl font-black text-emerald-300">{totalFields}</p>
          <p className="text-xs text-slate-400">الحد بالخطة {planLimits[currentPlan].fields}</p>
        </article>
        <article className="agri-panel p-5">
          <p className="text-xs text-slate-400">متوسط NDVI الحالي</p>
          <p className="mt-2 text-3xl font-black text-slate-100">{avgNdvi.toFixed(2)}</p>
        </article>
      </div>

      <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 p-5">
          <h2 className="text-lg font-black">المزارع المسجلة</h2>
          <p className="text-sm text-slate-400">الخطة الحالية: {currentPlan.toUpperCase()}</p>
        </div>
        <div className="agri-scroll overflow-x-auto">
          <table className="min-w-full text-right">
            <thead className="bg-white/[0.02] text-xs text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">المزرعة</th>
                <th className="px-4 py-3 font-semibold">المحافظة</th>
                <th className="px-4 py-3 font-semibold">الحقول</th>
                <th className="px-4 py-3 font-semibold">المحاصيل</th>
                <th className="px-4 py-3 font-semibold">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-sm">
              {farms.map((farm) => {
                const farmFields = fields.filter((field) => field.farmId === farm.id);
                const crops = Array.from(new Set(farmFields.map((field) => cropLabel(field.cropType))));
                return (
                  <tr key={farm.id} className="hover:bg-white/[0.03]">
                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-100">{farm.name}</p>
                      <p className="text-xs text-slate-500">{farm.country}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-300">{farm.governorate}</td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300">{farmFields.length} حقل</span>
                    </td>
                    <td className="px-4 py-4 text-slate-300">{crops.length ? crops.join('، ') : 'لا يوجد'}</td>
                    <td className="px-4 py-4">
                      <Link href={`/app/farms/${farm.id}`} className="font-bold text-emerald-300 hover:text-emerald-200">
                        عرض التفاصيل
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
