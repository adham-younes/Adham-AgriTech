import { ReportCard } from '@/components/reports/report-card';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';
import { addLangParam, AppSearchParams, localeFromSearchParams, resolveSearchParams } from '@/lib/i18n';
import { createSupabaseServiceServerClient } from '@/lib/supabase/server';

type ReportItem = {
  id: string;
  org_id: string;
  month: string;
  status: string;
  artifact_url: string | null;
  public_token: string;
  payload: Record<string, unknown> | null;
};

export default async function ReportsPage({
  searchParams
}: {
  searchParams?: Promise<AppSearchParams>;
}) {
  const locale = localeFromSearchParams(await resolveSearchParams(searchParams));
  const copy =
    locale === 'ar'
      ? {
          title: 'التقارير الشهرية',
          subtitle: 'تقارير احترافية قابلة للتنزيل والمشاركة مع أصحاب المصلحة.',
          create: 'إنشاء تقرير جديد',
          total: 'إجمالي التقارير',
          ready: 'جاهز للتنزيل',
          scope: 'نطاق التقرير',
          empty: 'لا توجد تقارير بعد. شغّل وظيفة التوليد الشهرية.'
        }
      : {
          title: 'Monthly Reports',
          subtitle: 'Shareable operational reports for stakeholders and teams.',
          create: 'Create New Report',
          total: 'Total reports',
          ready: 'Ready to download',
          scope: 'Report scope',
          empty: 'No reports yet. Run the monthly generation function.'
        };

  const reports = await loadReports();
  const readyCount = reports.filter((report) => report.status === 'ready').length;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">{copy.title}</h1>
          <p className="mt-1 text-sm text-slate-400">{copy.subtitle}</p>
        </div>
        <Button type="button">{copy.create}</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Panel as="article" className="p-5">
          <p className="text-xs text-slate-400">{copy.total}</p>
          <p className="mt-2 text-3xl font-black text-slate-100">{reports.length}</p>
        </Panel>
        <Panel as="article" className="p-5">
          <p className="text-xs text-slate-400">{copy.ready}</p>
          <p className="mt-2 text-3xl font-black text-emerald-300">{readyCount}</p>
        </Panel>
        <Panel as="article" className="p-5">
          <p className="text-xs text-slate-400">{copy.scope}</p>
          <p className="mt-2 text-3xl font-black text-slate-100">NDVI + Water</p>
        </Panel>
      </div>

      {reports.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              title={report.title}
              month={report.monthLabel}
              status={report.status}
              efficiency={report.efficiency}
              waterUsage={report.waterUsage}
              locale={locale}
              downloadUrl={report.downloadUrl ?? undefined}
              shareUrl={report.shareUrl ? addLangParam(report.shareUrl, locale) : undefined}
            />
          ))}
        </div>
      ) : (
        <Panel className="p-5 text-sm text-slate-300">{copy.empty}</Panel>
      )}
    </section>
  );
}

async function loadReports(): Promise<
  Array<{
    id: string;
    title: string;
    monthLabel: string;
    status: string;
    efficiency?: number;
    waterUsage?: string;
    downloadUrl: string | null;
    shareUrl: string | null;
  }>
> {
  try {
    const supabase = createSupabaseServiceServerClient();
    const [{ data: reportRows, error: reportError }, { data: orgRows, error: orgError }] = await Promise.all([
      supabase
        .from('reports')
        .select('id,org_id,month,status,artifact_url,public_token,payload')
        .order('month', { ascending: false })
        .limit(24),
      supabase.from('organizations').select('id,name')
    ]);

    if (reportError) throw reportError;
    if (orgError) throw orgError;

    const orgMap = new Map((orgRows ?? []).map((org) => [org.id, org.name]));
    const reports = (reportRows ?? []) as ReportItem[];

    return reports.map((report) => {
      const monthDate = new Date(report.month);
      const monthLabel = Number.isNaN(monthDate.getTime())
        ? report.month
        : monthDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      const payload = report.payload ?? {};
      const efficiency = toOptionalNumber(payload.efficiency_pct);
      const waterUsageRaw = toOptionalNumber(payload.water_usage_liters);
      const waterUsage = waterUsageRaw ? `${Math.round(waterUsageRaw).toLocaleString('en-US')} L` : undefined;
      const orgName = orgMap.get(report.org_id) ?? 'Organization';
      const shareUrl = report.public_token ? `/r/${report.public_token}` : null;

      return {
        id: report.id,
        title: `${orgName} • ${report.status}`,
        monthLabel,
        status: report.status,
        efficiency: efficiency ?? undefined,
        waterUsage,
        downloadUrl: report.artifact_url,
        shareUrl
      };
    });
  } catch {
    return [];
  }
}

function toOptionalNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
