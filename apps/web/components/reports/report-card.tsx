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
    <article className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-emerald-400/40 hover:bg-white/[0.05]">
      <div className="mb-5 flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold text-slate-100">{title}</h3>
        <span className={`rounded-full border px-3 py-1 text-xs font-bold ${badge.tone}`}>{badge.label}</span>
      </div>

      <p className="text-sm text-slate-400">{month}</p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="text-xs text-slate-400">كفاءة المياه</p>
          <p className="text-xl font-black text-emerald-300">{efficiency ? `${efficiency}%` : '--'}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="text-xs text-slate-400">الاستهلاك</p>
          <p className="text-xl font-black text-slate-100">{waterUsage ?? '--'}</p>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <button className="flex-1 rounded-xl bg-emerald-500 px-3 py-2 text-sm font-bold text-[#03200a] hover:bg-emerald-400">تنزيل PDF</button>
        <button className="rounded-xl border border-white/20 px-3 py-2 text-sm font-semibold text-slate-200 hover:border-emerald-300 hover:text-emerald-300">مشاركة</button>
      </div>
    </article>
  );
}
