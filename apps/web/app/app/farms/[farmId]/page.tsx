export default function FarmDetailsPage({ params }: { params: { farmId: string } }) {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">تفاصيل المزرعة #{params.farmId}</h1>
      <div className="rounded border bg-white p-4">قائمة الحقول + إضافة حقل جديد مع محرر الخريطة.</div>
    </section>
  );
}
