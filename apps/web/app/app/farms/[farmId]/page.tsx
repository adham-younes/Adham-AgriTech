import Link from 'next/link';
import { MapPreview } from '@/components/maps/map-preview';
import { fields, farms } from '@/lib/demo-data';
import { addLangParam, AppSearchParams, localeFromSearchParams, resolveSearchParams } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Panel } from '@/components/ui/panel';

export default async function FarmDetailsPage({
  params,
  searchParams
}: {
  params: Promise<{ farmId: string }>;
  searchParams?: Promise<AppSearchParams>;
}) {
  const resolvedParams = await params;
  const locale = localeFromSearchParams(await resolveSearchParams(searchParams));
  const farm = farms.find((item) => item.id === resolvedParams.farmId);
  const farmFields = fields.filter((item) => item.farmId === resolvedParams.farmId);
  const copy =
    locale === 'ar'
      ? {
          notFound: 'المزرعة غير موجودة.',
          subtitle: 'متابعة مباشرة للحقول، المؤشرات، والتوصيات اليومية.',
          back: 'العودة لإدارة المزارع',
          fields: 'عدد الحقول',
          area: 'المساحة الإجمالية',
          avgNdvi: 'متوسط NDVI الحالي',
          irrigation: 'توصية الري',
          temp: 'درجة الحرارة',
          openField: 'فتح شاشة الحقل'
        }
      : {
          notFound: 'Farm not found.',
          subtitle: 'Live tracking for fields, indicators, and daily recommendations.',
          back: 'Back to farms',
          fields: 'Fields',
          area: 'Total area',
          avgNdvi: 'Current avg NDVI',
          irrigation: 'Irrigation',
          temp: 'Temperature',
          openField: 'Open field view'
        };

  if (!farm) return <section>{copy.notFound}</section>;

  const totalArea = farmFields.reduce((sum, field) => sum + field.areaHa, 0);
  const avgNdvi =
    farmFields.reduce((sum, field) => sum + (field.ndviSeries.at(-1)?.value ?? 0), 0) / Math.max(farmFields.length, 1);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge>{farm.governorate}</Badge>
          <h1 className="mt-2 text-3xl font-black">{farm.name}</h1>
          <p className="mt-1 text-sm text-slate-400">{copy.subtitle}</p>
        </div>
        <ButtonLink href={addLangParam('/app/farms', locale)} variant="outline">
          {copy.back}
        </ButtonLink>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Panel as="article" className="p-5">
          <p className="text-xs text-slate-400">{copy.fields}</p>
          <p className="mt-2 text-3xl font-black text-emerald-300">{farmFields.length}</p>
        </Panel>
        <Panel as="article" className="p-5">
          <p className="text-xs text-slate-400">{copy.area}</p>
          <p className="mt-2 text-3xl font-black text-slate-100">{totalArea.toFixed(1)} ha</p>
        </Panel>
        <Panel as="article" className="p-5">
          <p className="text-xs text-slate-400">{copy.avgNdvi}</p>
          <p className="mt-2 text-3xl font-black text-slate-100">{avgNdvi.toFixed(2)}</p>
        </Panel>
      </div>

      <Panel as="article" className="overflow-hidden p-4">
        {farmFields[0] ? <MapPreview lat={farmFields[0].centroidLat} lng={farmFields[0].centroidLng} height={360} /> : null}
      </Panel>

      <div className="grid gap-4 md:grid-cols-2">
        {farmFields.map((field) => {
          const latestNdvi = field.ndviSeries.at(-1)?.value ?? 0;
          return (
            <Panel key={field.id} as="article" className="p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-black text-slate-100">{field.name}</h3>
                  <p className="text-sm text-slate-400">
                    {field.cropType} • {field.areaHa} هكتار
                  </p>
                </div>
                <Badge variant="status">NDVI {latestNdvi.toFixed(2)}</Badge>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
                <Card className="bg-black/20 p-3">
                  <p className="text-slate-400">{copy.irrigation}</p>
                  <p className="mt-1 font-black text-slate-100">{field.irrigationToday.recommendedMm} مم</p>
                </Card>
                <Card className="bg-black/20 p-3">
                  <p className="text-slate-400">{copy.temp}</p>
                  <p className="mt-1 font-black text-slate-100">{field.weatherToday.tempC}°</p>
                </Card>
              </div>

              <Link href={addLangParam(`/app/fields/${field.id}`, locale)} className="text-sm font-black text-emerald-300 hover:text-emerald-200">
                {copy.openField}
              </Link>
            </Panel>
          );
        })}
      </div>
    </section>
  );
}
