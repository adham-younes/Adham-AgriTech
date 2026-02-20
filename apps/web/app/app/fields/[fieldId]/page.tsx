import { NdviChart } from '@/components/dashboard/ndvi-chart';
import { MapPreview } from '@/components/maps/map-preview';
import { alerts, fields } from '@/lib/demo-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Panel } from '@/components/ui/panel';

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
          <Badge>{field.cropType.toUpperCase()}</Badge>
          <h1 className="mt-2 text-3xl font-black">{field.name}</h1>
          <p className="mt-1 text-sm text-slate-400">
            {field.areaHa} هكتار • آخر تحديث NDVI: {field.ndviSeries.at(-1)?.date}
          </p>
        </div>
        <Button type="button">تصدير تقرير الحقل</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Panel as="article" className="p-5">
          <p className="text-xs text-slate-400">Latest NDVI</p>
          <p className="mt-2 text-3xl font-black text-emerald-300">{latestNdvi.toFixed(2)}</p>
        </Panel>
        <Panel as="article" className="p-5">
          <p className="text-xs text-slate-400">متوسط NDVI</p>
          <p className="mt-2 text-3xl font-black text-slate-100">{avgNdvi.toFixed(2)}</p>
        </Panel>
        <Panel as="article" className="p-5">
          <p className="text-xs text-slate-400">رطوبة الهواء</p>
          <p className="mt-2 text-3xl font-black text-slate-100">{field.weatherToday.humidity}%</p>
        </Panel>
        <Panel as="article" className="p-5">
          <p className="text-xs text-slate-400">موعد الري المقترح</p>
          <p className="mt-2 text-3xl font-black text-amber-300">{field.irrigationToday.recommendedMm} مم</p>
        </Panel>
      </div>

      <Panel as="article" className="overflow-hidden p-4">
        <MapPreview lat={field.centroidLat} lng={field.centroidLng} height={420} />
      </Panel>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel as="article" className="p-5 xl:col-span-2">
          <h2 className="mb-3 text-lg font-black text-slate-100">منحنى NDVI لآخر القراءات</h2>
          <NdviChart data={field.ndviSeries} />
        </Panel>

        <Panel as="article" className="p-5">
          <h2 className="mb-3 text-lg font-black text-slate-100">التنبيهات الميدانية</h2>
          <div className="space-y-3">
            {fieldAlerts.length ? (
              fieldAlerts.map((alert) => (
                <Card key={alert.id} className="bg-black/20 p-3">
                  <p className="text-sm font-semibold text-slate-100">{alert.message}</p>
                  <p className="mt-1 text-xs text-slate-400">Severity {alert.severity} • {alert.date}</p>
                </Card>
              ))
            ) : (
              <p className="text-sm text-slate-400">لا توجد تنبيهات على هذا الحقل.</p>
            )}
          </div>
        </Panel>
      </div>
    </section>
  );
}
