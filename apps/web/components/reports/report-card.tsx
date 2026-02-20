const statusMap: Record<string, { label: string; tone: string }> = {
  ready: { label: 'جاهز', tone: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30' },
  queued: { label: 'قيد المعالجة', tone: 'bg-amber-500/15 text-amber-300 border-amber-400/30' },
  archived: { label: 'مؤرشف', tone: 'bg-slate-500/15 text-slate-300 border-slate-400/30' }
};

export function ReportCard({
  title,
  month,
  status,
  efficiency,
  waterUsage
}: {
  title: string;
  month: string;
  status: string;
  efficiency?: number;
  waterUsage?: string;
}) {
  const badge = statusMap[status] ?? statusMap.archived;

  return (
    <article className="agri-card agri-card-hover group flex h-full flex-col p-5">
      <div className="mb-5 flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold agri-text-primary">{title}</h3>
        <span className={`rounded-full border px-3 py-1 text-xs font-bold ${badge.tone}`}>{badge.label}</span>
      </div>

      <p className="text-sm agri-text-muted">{month}</p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-bg-elevated)] p-3">
          <p className="text-xs agri-text-muted">كفاءة المياه</p>
          <p className="text-xl font-black text-emerald-300">{efficiency ? `${efficiency}%` : '--'}</p>
        </div>
        <div className="rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-bg-elevated)] p-3">
          <p className="text-xs agri-text-muted">الاستهلاك</p>
          <p className="text-xl font-black agri-text-primary">{waterUsage ?? '--'}</p>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <button className="agri-btn agri-btn-primary flex-1">تنزيل PDF</button>
        <button className="agri-btn agri-btn-secondary">مشاركة</button>
      </div>
    </article>
  );
}
