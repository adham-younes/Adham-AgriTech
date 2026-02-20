import { ReportCard } from '@/components/reports/report-card';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';

const reports = [
  { title: 'تقرير إنتاجية المياه - مزرعة الوادي', month: 'يناير 2026', status: 'ready', efficiency: 94, waterUsage: '450k L' },
  { title: 'تقرير إنتاجية المياه - مزرعة الدلتا', month: 'يناير 2026', status: 'queued', efficiency: 88, waterUsage: '412k L' },
  { title: 'تقرير إنتاجية المياه - مزرعة الوادي', month: 'ديسمبر 2025', status: 'archived', efficiency: 90, waterUsage: '438k L' }
];

export default function ReportsPage() {
  const readyCount = reports.filter((report) => report.status === 'ready').length;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">التقارير الشهرية</h1>
          <p className="mt-1 text-sm text-slate-400">تقارير احترافية قابلة للتنزيل والمشاركة مع أصحاب المصلحة.</p>
        </div>
        <Button type="button">إنشاء تقرير جديد</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Panel as="article" className="p-5">
          <p className="text-xs text-slate-400">إجمالي التقارير</p>
          <p className="mt-2 text-3xl font-black text-slate-100">{reports.length}</p>
        </Panel>
        <Panel as="article" className="p-5">
          <p className="text-xs text-slate-400">جاهز للتنزيل</p>
          <p className="mt-2 text-3xl font-black text-emerald-300">{readyCount}</p>
        </Panel>
        <Panel as="article" className="p-5">
          <p className="text-xs text-slate-400">نطاق التقرير</p>
          <p className="mt-2 text-3xl font-black text-slate-100">NDVI + Water</p>
        </Panel>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reports.map((report) => (
          <ReportCard
            key={`${report.title}-${report.month}`}
            title={report.title}
            month={report.month}
            status={report.status}
            efficiency={report.efficiency}
            waterUsage={report.waterUsage}
          />
        ))}
      </div>
    </section>
  );
}
