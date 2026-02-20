import { NdviChart } from '@/components/dashboard/ndvi-chart';
import { MapPreview } from '@/components/maps/map-preview';
import { alerts, fields } from '@/lib/demo-data';

export default function FieldDetailsPage({ params }: { params: { fieldId: string } }) {
  const field = fields.find((item) => item.id === params.fieldId);
  if (!field) return <section>الحقل غير موجود.</section>;

  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-bold">{field.name}</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded border bg-white p-4">
          <h2 className="mb-2 font-semibold">بيانات الحقل</h2>
          <p>المحصول: {field.cropType}</p>
          <p>المساحة: {field.areaHa} هكتار</p>
          <p>التوصية اليومية: {field.irrigationToday.recommendedMm} مم</p>
        </article>
        <MapPreview lat={field.centroidLat} lng={field.centroidLng} />
      </div>

      <article className="rounded border bg-white p-4">
        <h2 className="mb-2 font-semibold">منحنى NDVI</h2>
        <NdviChart data={field.ndviSeries} />
      </article>

      <article className="rounded border bg-white p-4">
        <h2 className="mb-2 font-semibold">التنبيهات</h2>
        <ul className="space-y-2">
          {alerts.filter((a) => a.fieldId === field.id).map((alert) => (
            <li className="rounded border p-2" key={alert.id}>
              {alert.message}
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}
