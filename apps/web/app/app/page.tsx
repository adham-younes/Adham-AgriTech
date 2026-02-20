import { NdviChart } from '@/components/dashboard/ndvi-chart';
import { alerts, fields } from '@/lib/demo-data';
import { Badge } from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Panel } from '@/components/ui/panel';

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
          <Badge>Farm: {focusField.name}</Badge>
          <h1 className="mt-3 text-3xl font-black tracking-tight">نظرة تشغيل اليوم</h1>
          <p className="mt-1 text-sm text-slate-400">مزامنة الطقس، NDVI، والتوصيات اليومية في شاشة واحدة.</p>
        </div>
        <ButtonLink href={`/app/fields/${focusField.id}`}>فتح لوحة الحقل</ButtonLink>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Panel as="article" className="p-5">
          <p className="text-xs text-slate-400">درجة الحرارة</p>
          <p className="mt-2 text-3xl font-black text-slate-100">{focusField.weatherToday.tempC}°</p>
          <p className="text-sm text-slate-400">رطوبة {focusField.weatherToday.humidity}%</p>
        </Panel>
        <Panel as="article" className="p-5">
          <p className="text-xs text-slate-400">توصية الري اليوم</p>
          <p className="mt-2 text-3xl font-black text-emerald-300">{focusField.irrigationToday.recommendedMm} مم</p>
          <p className="text-sm text-slate-400">ET0: {focusField.irrigationToday.et0Mm} مم</p>
        </Panel>
        <Panel as="article" className="p-5">
          <p className="text-xs text-slate-400">متوسط NDVI</p>
          <p className="mt-2 text-3xl font-black text-slate-100">{avgNdvi.toFixed(2)}</p>
          <p className={`text-sm font-semibold ${ndviChange >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
            {ndviChange >= 0 ? '+' : ''}
            {ndviChange.toFixed(1)}% مقارنة بالقراءة السابقة
          </p>
        </Panel>
        <Panel as="article" className="p-5">
          <p className="text-xs text-slate-400">الإنذارات المفتوحة</p>
          <p className="mt-2 text-3xl font-black text-amber-300">{alerts.length}</p>
          <p className="text-sm text-slate-400">آخر تحديث 05:00 ص</p>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel as="article" className="p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-100">اتجاه NDVI</h2>
            <Badge variant="status">القيمة الحالية {latestNdvi.toFixed(2)}</Badge>
          </div>
          <NdviChart data={focusField.ndviSeries} />
        </Panel>

        <Panel as="article" className="p-5">
          <h2 className="mb-3 text-lg font-black text-slate-100">آخر التنبيهات</h2>
          <div className="space-y-3">
            {alerts.length ? (
              alerts.map((alert) => (
                <Card key={alert.id} className="bg-black/20 p-3">
                  <p className="text-sm font-semibold text-slate-100">{alert.message}</p>
                  <p className="mt-1 text-xs text-slate-400">{alert.date}</p>
                </Card>
              ))
            ) : (
              <p className="text-sm text-slate-400">لا توجد تنبيهات.</p>
            )}
          </div>
        </Panel>
      </div>

      <article className="relative overflow-hidden rounded-3xl border border-emerald-300/35 bg-gradient-to-l from-emerald-400 to-emerald-600 p-6 text-agri-ink">
        <div className="relative z-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider">Smart Action</p>
            <h3 className="mt-1 text-2xl font-black">تنفيذ الري خلال 6 ساعات القادمة</h3>
            <p className="mt-2 text-sm font-medium">الثقة الحالية {Math.round(focusField.irrigationToday.confidence * 100)}% مبنية على الطقس + NDVI + اتجاه الرطوبة.</p>
          </div>
          <ButtonLink href={`/app/fields/${focusField.id}`} variant="dark">
            فتح خطة التنفيذ
          </ButtonLink>
        </div>
      </article>
    </section>
  );
}
