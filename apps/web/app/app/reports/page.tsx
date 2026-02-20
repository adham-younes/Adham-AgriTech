export const revalidate = 300;

import { ReportCard } from '@/components/reports/report-card';

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
        <button className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-black text-[#03200a] hover:bg-emerald-300">إنشاء تقرير جديد</button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="agri-panel p-5">
          <p className="text-xs text-slate-400">إجمالي التقارير</p>
          <p className="mt-2 text-3xl font-black text-slate-100">{reports.length}</p>
        </article>
        <article className="agri-panel p-5">
          <p className="text-xs text-slate-400">جاهز للتنزيل</p>
          <p className="mt-2 text-3xl font-black text-emerald-300">{readyCount}</p>
        </article>
        <article className="agri-panel p-5">
          <p className="text-xs text-slate-400">نطاق التقرير</p>
          <p className="mt-2 text-3xl font-black text-slate-100">NDVI + Water</p>
        </article>
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
