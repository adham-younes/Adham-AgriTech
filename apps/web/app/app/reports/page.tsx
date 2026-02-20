import { ReportCard } from '@/components/reports/report-card';

const reports = [
  { title: 'تقرير إنتاجية المياه - مزرعة الوادي', month: '2026-01', status: 'ready' },
  { title: 'تقرير إنتاجية المياه - مزرعة الدلتا', month: '2026-01', status: 'queued' }
];

export default function ReportsPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">التقارير</h1>
      <button className="rounded bg-emerald-700 px-4 py-2 text-white">إنشاء تقرير شهري</button>
      <div className="grid gap-4 md:grid-cols-2">
        {reports.map((report) => (
          <ReportCard key={report.title} title={report.title} month={report.month} status={report.status} />
        ))}
      </div>
    </section>
  );
}
