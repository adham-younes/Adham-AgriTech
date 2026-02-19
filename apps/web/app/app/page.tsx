import { dashboardCards } from '@/lib/mock-data';

export default function DashboardPage() {
  return (
    <section>
      <h1 className="text-2xl font-bold mb-6">لوحة اليوم</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardCards.map((card) => (
          <article key={card.title} className="rounded-lg border bg-white p-4">
            <h2 className="font-semibold">{card.title}</h2>
            <p className="text-xl font-bold text-emerald-700">{card.value}</p>
            <p className="text-sm text-slate-600">{card.subtitle}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
