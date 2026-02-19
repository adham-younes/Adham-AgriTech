export default function FieldDetailsPage({ params }: { params: { fieldId: string } }) {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">الحقل #{params.fieldId}</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded border bg-white p-4">خريطة الحقل (Leaflet)</div>
        <div className="rounded border bg-white p-4">NDVI Trend (Recharts)</div>
      </div>
      <div className="rounded border bg-white p-4">سجل الطقس، التوصيات، والتنبيهات.</div>
    </section>
  );
}
