import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Panel } from '@/components/ui/panel';
import { addLangParam, AppSearchParams, localeFromSearchParams, resolveSearchParams } from '@/lib/i18n';
import { createSupabaseServiceServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type ReportRow = {
  public_token: string;
  month: string;
  type: string;
  status: string;
  artifact_url: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
};

export default async function PublicReportPage({
  params,
  searchParams
}: {
  params: Promise<{ publicToken: string }>;
  searchParams?: Promise<AppSearchParams>;
}) {
  const resolvedParams = await params;
  const locale = localeFromSearchParams(await resolveSearchParams(searchParams));
  const copy =
    locale === 'ar'
      ? {
          pageTitle: 'تقرير أثر استهلاك المياه والإنتاجية',
          token: 'رمز الوصول',
          status: 'الحالة',
          month: 'الشهر',
          source: 'المصدر',
          sample: 'حجم العينة',
          generatedAt: 'تاريخ التوليد',
          download: 'تنزيل التقرير',
          backHome: 'العودة للرئيسية'
        }
      : {
          pageTitle: 'Water Productivity Impact Report',
          token: 'Access token',
          status: 'Status',
          month: 'Month',
          source: 'Source',
          sample: 'Sample size',
          generatedAt: 'Generated at',
          download: 'Download report',
          backHome: 'Back to home'
        };

  let report: ReportRow | null = null;
  try {
    const supabase = createSupabaseServiceServerClient();
    const { data, error } = await supabase
      .from('public_reports')
      .select('public_token,month,type,status,artifact_url,payload,created_at')
      .eq('public_token', resolvedParams.publicToken)
      .maybeSingle();

    if (error) throw error;
    report = data as ReportRow | null;
  } catch {
    report = null;
  }

  if (!report) notFound();

  const payload = report.payload ?? {};
  const source = stringFromPayload(payload.source, 'WaPOR v3');
  const sample = numberFromPayload(payload.sample, 0);
  const generatedAt = stringFromPayload(payload.generated_at, report.created_at);
  const monthText = report.month;

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl space-y-8 px-6 py-10 text-slate-100">
      <Card as="header" className="p-6">
        <p className="text-xs text-slate-400">Public Share View</p>
        <h1 className="mt-2 text-3xl font-black">{copy.pageTitle}</h1>
        <p className="mt-2 text-sm text-slate-400">
          {copy.token}: {resolvedParams.publicToken}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          ID: {resolvedParams.publicToken}
        </p>
      </Card>

      <section className="grid gap-4 md:grid-cols-2">
        <Panel as="article" className="p-5">
          <p className="text-xs text-slate-400">{copy.status}</p>
          <p className="mt-2 text-3xl font-black text-emerald-300">{report.status}</p>
        </Panel>
        <Panel as="article" className="p-5">
          <p className="text-xs text-slate-400">{copy.month}</p>
          <p className="mt-2 text-3xl font-black text-slate-100">{monthText}</p>
        </Panel>
      </section>

      <Card as="section" className="space-y-4 p-6">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <p className="text-xs text-slate-400">{copy.source}</p>
            <p className="mt-1 text-base font-bold text-slate-100">{source}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">{copy.sample}</p>
            <p className="mt-1 text-base font-bold text-slate-100">{sample}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">{copy.generatedAt}</p>
            <p className="mt-1 text-base font-bold text-slate-100">{generatedAt}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {report.artifact_url ? (
            <a
              href={report.artifact_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-xl bg-emerald-400 px-4 py-2 text-sm font-bold text-agri-ink-strong hover:bg-emerald-300"
            >
              {copy.download}
            </a>
          ) : null}
          <a
            href={addLangParam('/', locale)}
            className="inline-flex items-center rounded-xl border border-white/20 px-4 py-2 text-sm font-bold text-slate-200 hover:border-emerald-300 hover:text-emerald-300"
          >
            {copy.backHome}
          </a>
        </div>
      </Card>
    </main>
  );
}

function stringFromPayload(value: unknown, fallback: string): string {
  if (typeof value === 'string' && value.length > 0) return value;
  return fallback;
}

function numberFromPayload(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
