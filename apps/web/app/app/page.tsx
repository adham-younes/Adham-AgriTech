import { alerts, fields } from '@/lib/demo-data';
import { addLangParam, AppSearchParams, localeFromSearchParams, resolveSearchParams } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Panel } from '@/components/ui/panel';

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function buildNdviBars(values: number[]) {
  const filled = [...values];
  while (filled.length < 7) {
    filled.unshift(filled[0] ?? 0.4);
  }
  return filled.slice(-7);
}

export default async function DashboardPage({
  searchParams
}: {
  searchParams?: Promise<AppSearchParams>;
}) {
  const locale = localeFromSearchParams(await resolveSearchParams(searchParams));
  const field = fields[0];
  const latestNdvi = field.ndviSeries.at(-1)?.value ?? 0;
  const previousNdvi = field.ndviSeries.at(-2)?.value ?? latestNdvi;
  const ndviChange = ((latestNdvi - previousNdvi) / Math.max(previousNdvi, 0.01)) * 100;
  const ndviAvg = average(field.ndviSeries.map((point) => point.value));
  const ndviBars = buildNdviBars(field.ndviSeries.map((point) => point.value));
  const maxBarValue = Math.max(...ndviBars, 0.1);

  const copy =
    locale === 'ar'
      ? {
          title: 'نظرة اليوم',
          subtitle: `تحديث حالة ${field.name}`,
          refresh: 'تحديث البيانات',
          weatherSnapshot: 'ملخص الطقس',
          temp: 'الحرارة',
          wind: 'سرعة الرياح',
          humidity: 'الرطوبة',
          live: 'LIVE',
          ndviTrend: 'اتجاه NDVI',
          last7: 'آخر 7 قراءات',
          recommendation: 'توصية',
          waterTonight: `ري ${field.irrigationToday.recommendedMm.toFixed(1)} مم الليلة`,
          reason: 'السبب: تبخر مرتفع + رطوبة تربة منخفضة',
          confidence: 'مؤشر الثقة',
          confirm: 'تأكيد خطة الري',
          criticalAlerts: 'تنبيهات حرجة',
          viewAll: 'عرض الكل',
          ago: 'منذ',
          openField: 'فتح تفاصيل الحقل'
        }
      : {
          title: "Today's Overview",
          subtitle: `Status update for ${field.name}`,
          refresh: 'Refresh Data',
          weatherSnapshot: 'Weather Snapshot',
          temp: 'Temperature',
          wind: 'Wind Speed',
          humidity: 'Humidity',
          live: 'LIVE',
          ndviTrend: 'NDVI Trend',
          last7: 'Last 7 Days',
          recommendation: 'Recommendation',
          waterTonight: `Water ${field.irrigationToday.recommendedMm.toFixed(1)}mm tonight`,
          reason: 'Reasoning: High ET and lower soil moisture trend',
          confidence: 'Confidence Score',
          confirm: 'Confirm Irrigation',
          criticalAlerts: 'Critical Alerts',
          viewAll: 'View All',
          ago: 'ago',
          openField: 'Open Field'
        };

  const decoratedAlerts = [
    ...alerts,
    {
      id: 'alert-maintenance',
      fieldId: field.id,
      type: 'maintenance',
      severity: 1,
      message:
        locale === 'ar'
          ? 'صيانة النظام المجدولة اليوم الساعة 4:00 مساءً.'
          : 'System maintenance is scheduled at 4:00 PM today.',
      date: '2h'
    }
  ].slice(0, 3);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl font-black tracking-tight text-slate-100">{copy.title}</h1>
          <p className="mt-2 text-base text-slate-400">{copy.subtitle}</p>
        </div>
        <ButtonLink href={addLangParam('/app', locale)} className="agri-neon-button rounded-2xl px-8 py-3 text-base font-black">
          {copy.refresh}
        </ButtonLink>
      </div>

      <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <Panel as="article" className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-3xl font-black text-slate-100">{copy.weatherSnapshot}</h2>
            <Badge className="agri-live-badge">{copy.live}</Badge>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{copy.temp}</p>
              <p className="agri-accent mt-2 text-6xl font-black">{field.weatherToday.tempC}°</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{copy.wind}</p>
              <p className="mt-2 text-5xl font-black text-slate-100">
                {field.weatherToday.windKmh}
                <span className="ms-2 text-xl font-semibold text-slate-400">km/h</span>
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{copy.humidity}</p>
              <p className="mt-2 text-5xl font-black text-slate-100">{field.weatherToday.humidity}%</p>
            </div>
          </div>
        </Panel>

        <Panel as="article" className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-3xl font-black text-slate-100">{copy.ndviTrend}</h2>
            <p className="text-sm font-semibold text-slate-400">{copy.last7}</p>
          </div>
          <div className="flex h-32 items-end gap-2 rounded-2xl border border-white/10 bg-black/20 p-4">
            {ndviBars.map((value, index) => {
              const height = `${Math.max(30, (value / maxBarValue) * 100)}%`;
              const highlighted = index === ndviBars.length - 1;
              return (
                <div
                  key={`ndvi-bar-${index}`}
                  className={`w-full rounded-t-md ${highlighted ? 'bg-[var(--agri-royal-gold)]' : 'bg-[rgba(143,162,71,0.55)]'}`}
                  style={{ height }}
                />
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="agri-accent text-4xl font-black">{ndviAvg.toFixed(2)}</p>
            <p className={`text-lg font-black ${ndviChange >= 0 ? 'text-[var(--agri-royal-gold)]' : 'text-slate-300'}`}>
              {ndviChange >= 0 ? '+' : ''}
              {ndviChange.toFixed(1)}%
            </p>
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <article className="agri-neon-surface relative overflow-hidden rounded-3xl p-7">
          <p className="mb-2 inline-flex rounded-full border border-black/15 bg-black/10 px-3 py-1 text-xs font-black uppercase tracking-wider">
            {copy.recommendation}
          </p>
          <h3 className="max-w-2xl text-6xl font-black leading-[1.05]">{copy.waterTonight}</h3>
          <p className="mt-4 text-xl font-bold">{copy.reason}</p>

          <div className="mt-6 flex flex-wrap items-end justify-between gap-5">
            <ButtonLink
              href={addLangParam(`/app/fields/${field.id}`, locale)}
              variant="dark"
              className="rounded-2xl border border-black/30 px-6 py-3 text-base"
            >
              {copy.confirm}
            </ButtonLink>
            <div className="grid h-40 w-40 place-items-center rounded-3xl border border-black/20 bg-black/10">
              <div className="grid h-24 w-24 place-items-center rounded-full border-[6px] border-black/55 text-3xl font-black">
                {Math.round(field.irrigationToday.confidence * 100)}%
              </div>
              <p className="text-sm font-bold uppercase">{copy.confidence}</p>
            </div>
          </div>
        </article>

        <Panel as="article" className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-3xl font-black text-slate-100">{copy.criticalAlerts}</h2>
            <ButtonLink href={addLangParam(`/app/fields/${field.id}`, locale)} variant="ghost" className="agri-accent">
              {copy.viewAll}
            </ButtonLink>
          </div>

          <div className="space-y-3">
            {decoratedAlerts.map((alert) => {
              const color =
                alert.severity >= 4
                  ? 'border-[rgba(212,175,55,0.5)] bg-[rgba(185,142,44,0.2)]'
                  : alert.severity >= 2
                    ? 'border-[rgba(143,162,71,0.52)] bg-[rgba(111,127,57,0.23)]'
                    : 'border-slate-300/25 bg-slate-500/10';
              const label = alert.severity >= 4 ? 'High' : alert.severity >= 2 ? 'Medium' : 'Low';
              return (
                <Card key={alert.id} className={`rounded-2xl border p-4 ${color}`}>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="text-base font-black text-slate-100">{alert.type}</p>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">{label}</span>
                  </div>
                  <p className="text-sm text-slate-200">{alert.message}</p>
                  <p className="mt-2 text-xs font-semibold text-slate-400">
                    {alert.date} {copy.ago}
                  </p>
                </Card>
              );
            })}
          </div>

          <div className="mt-4">
            <ButtonLink href={addLangParam(`/app/fields/${field.id}`, locale)} variant="outline" className="w-full justify-center">
              {copy.openField}
            </ButtonLink>
          </div>
        </Panel>
      </div>
    </section>
  );
}
