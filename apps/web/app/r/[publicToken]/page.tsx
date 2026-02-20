const rows = [
  { field: 'A-12', crop: 'ذرة', ndvi: 0.81, efficiency: '94%' },
  { field: 'B-03', crop: 'قمح', ndvi: 0.76, efficiency: '89%' },
  { field: 'C-19', crop: 'طماطم', ndvi: 0.84, efficiency: '92%' }
];

export default function PublicReportPage({ params }: { params: { publicToken: string } }) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl space-y-8 px-6 py-10 text-slate-100">
      <header className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-xs text-slate-400">Public Share View</p>
        <h1 className="mt-2 text-3xl font-black">تقرير أثر استهلاك المياه والإنتاجية</h1>
        <p className="mt-2 text-sm text-slate-400">رمز الوصول: {params.publicToken}</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="agri-panel p-5">
          <p className="text-xs text-slate-400">المياه الموفرة</p>
          <p className="mt-2 text-3xl font-black text-emerald-300">1.2M L</p>
        </article>
        <article className="agri-panel p-5">
          <p className="text-xs text-slate-400">متوسط NDVI</p>
          <p className="mt-2 text-3xl font-black text-slate-100">0.82</p>
        </article>
        <article className="agri-panel p-5">
          <p className="text-xs text-slate-400">تحسن الإنتاجية</p>
          <p className="mt-2 text-3xl font-black text-emerald-300">+18.5%</p>
        </article>
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="border-b border-white/10 p-5">
          <h2 className="text-xl font-black">ملخص الأداء على مستوى الحقل</h2>
        </div>
        <div className="agri-scroll overflow-x-auto">
          <table className="min-w-full text-right text-sm">
            <thead className="bg-white/[0.03] text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">الحقل</th>
                <th className="px-4 py-3 font-semibold">المحصول</th>
                <th className="px-4 py-3 font-semibold">NDVI</th>
                <th className="px-4 py-3 font-semibold">كفاءة المياه</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {rows.map((row) => (
                <tr key={row.field} className="hover:bg-white/[0.03]">
                  <td className="px-4 py-3 font-semibold text-slate-100">{row.field}</td>
                  <td className="px-4 py-3 text-slate-300">{row.crop}</td>
                  <td className="px-4 py-3 text-emerald-300">{row.ndvi.toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-100">{row.efficiency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
