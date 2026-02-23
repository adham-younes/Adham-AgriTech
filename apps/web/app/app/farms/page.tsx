import Link from 'next/link';
import { farms, fields, planLimits } from '@/lib/demo-data';
import { addLangParam, AppSearchParams, localeFromSearchParams, resolveSearchParams } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Panel } from '@/components/ui/panel';

function cropLabel(value: string) {
  const map: Record<string, string> = {
    tomato: 'طماطم',
    wheat: 'قمح'
  };
  return map[value] ?? value;
}

export default async function FarmsPage({
  searchParams
}: {
  searchParams?: Promise<AppSearchParams>;
}) {
  const locale = localeFromSearchParams(await resolveSearchParams(searchParams));
  const currentPlan = 'free';
  const totalFields = fields.length;
  const canCreateMore = totalFields < planLimits[currentPlan].fields;
  const totalArea = fields.reduce((sum, field) => sum + field.areaHa, 0);
  const avgNdvi =
    fields.reduce((sum, field) => sum + (field.ndviSeries.at(-1)?.value ?? 0), 0) / Math.max(fields.length, 1);
  const copy =
    locale === 'ar'
      ? {
          title: 'إدارة المزارع والحقول',
          subtitle: 'عرض تشغيلي موحّد للمزارع، المساحة، وحالة الحقول.',
          addFarm: 'إضافة مزرعة جديدة',
          totalArea: 'إجمالي المساحة',
          fields: 'عدد الحقول',
          limit: 'الحد بالخطة',
          ndvi: 'متوسط NDVI الحالي',
          registered: 'المزارع المسجلة',
          currentPlan: 'الخطة الحالية',
          farm: 'المزرعة',
          gov: 'المحافظة',
          fieldsHead: 'الحقول',
          crops: 'المحاصيل',
          action: 'الإجراء',
          view: 'عرض التفاصيل',
          noCrop: 'لا يوجد',
          fieldUnit: 'حقل'
        }
      : {
          title: 'Farms & Fields',
          subtitle: 'Unified operational view for farms, area coverage, and field health.',
          addFarm: 'Add New Farm',
          totalArea: 'Total area',
          fields: 'Fields count',
          limit: 'Plan limit',
          ndvi: 'Current avg NDVI',
          registered: 'Registered farms',
          currentPlan: 'Current plan',
          farm: 'Farm',
          gov: 'Governorate',
          fieldsHead: 'Fields',
          crops: 'Crops',
          action: 'Action',
          view: 'View details',
          noCrop: 'None',
          fieldUnit: 'fields'
        };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">{copy.title}</h1>
          <p className="mt-1 text-sm text-slate-400">{copy.subtitle}</p>
        </div>
        <Button disabled={!canCreateMore} type="button">
          {copy.addFarm}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Panel as="article" className="p-5">
          <p className="text-xs text-slate-400">{copy.totalArea}</p>
          <p className="mt-2 text-3xl font-black text-slate-100">{totalArea.toFixed(1)} ha</p>
        </Panel>
        <Panel as="article" className="p-5">
          <p className="text-xs text-slate-400">{copy.fields}</p>
          <p className="mt-2 text-3xl font-black text-emerald-300">{totalFields}</p>
          <p className="text-xs text-slate-400">
            {copy.limit} {planLimits[currentPlan].fields}
          </p>
        </Panel>
        <Panel as="article" className="p-5">
          <p className="text-xs text-slate-400">{copy.ndvi}</p>
          <p className="mt-2 text-3xl font-black text-slate-100">{avgNdvi.toFixed(2)}</p>
        </Panel>
      </div>

      <Card as="article" className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 p-5">
          <h2 className="text-lg font-black">{copy.registered}</h2>
          <p className="text-sm text-slate-400">
            {copy.currentPlan}: {currentPlan.toUpperCase()}
          </p>
        </div>
        <div className="agri-scroll overflow-x-auto">
          <table className="min-w-full text-right">
            <thead className="bg-white/[0.02] text-xs text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">{copy.farm}</th>
                <th className="px-4 py-3 font-semibold">{copy.gov}</th>
                <th className="px-4 py-3 font-semibold">{copy.fieldsHead}</th>
                <th className="px-4 py-3 font-semibold">{copy.crops}</th>
                <th className="px-4 py-3 font-semibold">{copy.action}</th>
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
                      <Badge variant="status">
                        {farmFields.length} {copy.fieldUnit}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-slate-300">{crops.length ? crops.join('، ') : copy.noCrop}</td>
                    <td className="px-4 py-4">
                      <Link href={addLangParam(`/app/farms/${farm.id}`, locale)} className="font-bold text-emerald-300 hover:text-emerald-200">
                        {copy.view}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}
