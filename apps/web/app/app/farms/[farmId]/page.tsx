import Link from 'next/link';
import { MapPreview } from '@/components/maps/map-preview';
import { fields, farms } from '@/lib/demo-data';

export default function FarmDetailsPage({ params }: { params: { farmId: string } }) {
  const farm = farms.find((item) => item.id === params.farmId);
  const farmFields = fields.filter((item) => item.farmId === params.farmId);

  if (!farm) return <section>المزرعة غير موجودة.</section>;

  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-bold">{farm.name}</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded border bg-white p-4">
          <h2 className="mb-2 font-semibold">ملخص المزرعة</h2>
          <p>المحافظة: {farm.governorate}</p>
          <p>عدد الحقول: {farmFields.length}</p>
        </article>
        {farmFields[0] ? <MapPreview lat={farmFields[0].centroidLat} lng={farmFields[0].centroidLng} /> : null}
      </div>
      <div className="space-y-3">
        {farmFields.map((field) => (
          <div key={field.id} className="rounded border bg-white p-4">
            <h3 className="font-semibold">{field.name}</h3>
            <p className="text-sm">{field.cropType} — {field.areaHa} هكتار</p>
            <Link className="text-emerald-700" href={`/app/fields/${field.id}`}>فتح شاشة الحقل</Link>
          </div>
        ))}
      </div>
    </section>
  );
}
