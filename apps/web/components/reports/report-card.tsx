export function ReportCard({ title, month, status }: { title: string; month: string; status: string }) {
  return (
    <article className="rounded-xl border bg-white p-4">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-slate-600">{month}</p>
      <span className="mt-2 inline-block rounded bg-emerald-100 px-2 py-1 text-xs text-emerald-800">{status}</span>
    </article>
  );
}
