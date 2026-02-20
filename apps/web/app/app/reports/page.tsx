import { ReportCard } from '@/components/reports/report-card';
import { resolveUiState, unifiedValueProposition } from '@/lib/ux-copy';

const reports = [
  { title: 'تقرير إنتاجية المياه - مزرعة الوادي', month: 'يناير 2026', status: 'ready', efficiency: 94, waterUsage: '450k L' },
  { title: 'تقرير إنتاجية المياه - مزرعة الدلتا', month: 'يناير 2026', status: 'queued', efficiency: 88, waterUsage: '412k L' },
  { title: 'تقرير إنتاجية المياه - مزرعة الوادي', month: 'ديسمبر 2025', status: 'archived', efficiency: 90, waterUsage: '438k L' }
];

export default function ReportsPage({ searchParams }: { searchParams?: { state?: string } }) {
  const uiState = resolveUiState(searchParams?.state);

  if (uiState === 'loading') {
    return (
      <section className="space-y-6" aria-busy="true">
        <div className="h-24 animate-pulse rounded-2xl bg-white/10" />
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="h-32 animate-pulse rounded-2xl bg-white/10" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="h-56 animate-pulse rounded-2xl bg-white/10" />
          ))}
        </div>
      </section>
    );
  }

  if (uiState === 'error') {
    return (
      <section className="agri-panel space-y-4 p-6 text-right">
        <h1 className="text-2xl font-black text-rose-300">خطأ في تحميل التقارير</h1>
        <p className="text-slate-300">تعذر إنشاء أو جلب التقارير الشهرية حاليًا. حاول بعد دقائق.</p>
        <button className="w-fit rounded-xl bg-rose-500 px-4 py-2 text-sm font-bold text-white hover:bg-rose-400">إعادة المحاولة</button>
      </section>
    );
  }

  if (uiState === 'empty') {
    return (
      <section className="agri-panel space-y-4 p-6 text-right">
        <h1 className="text-2xl font-black">لا توجد تقارير بعد</h1>
        <p className="text-slate-300">ابدأ أول تقرير أداء مياه لمشاركة النتائج مع الفريق والمستثمرين.</p>
        <button className="w-fit rounded-xl bg-emerald-400 px-4 py-2 text-sm font-black text-[#03200a] hover:bg-emerald-300">إنشاء تقرير جديد</button>
      </section>
    );
  }

  const readyCount = reports.filter((report) => report.status === 'ready').length;

  return (
    <section className="space-y-6 text-right">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">التقارير الشهرية</h1>
          <p className="mt-1 text-sm text-slate-300">{unifiedValueProposition}</p>
        </div>
        <button className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-black text-[#03200a] hover:bg-emerald-300">إنشاء تقرير جديد</button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="agri-panel p-5">
          <p className="text-xs text-slate-400">إجمالي التقارير</p>
          <p className="mt-2 text-3xl font-black text-slate-100">{reports.length}</p>
          <p className="mt-2 text-xs text-slate-500">آخر مزامنة: اليوم 05:05 ص</p>
        </article>
        <article className="agri-panel p-5">
          <p className="text-xs text-slate-400">جاهز للتنزيل</p>
          <p className="mt-2 text-3xl font-black text-emerald-300">{readyCount}</p>
          <p className="mt-2 text-xs text-slate-500">ثقة التجميع: 96%</p>
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
