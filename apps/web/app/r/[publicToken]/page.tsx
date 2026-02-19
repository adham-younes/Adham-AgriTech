export default function PublicReportPage({ params }: { params: { publicToken: string } }) {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-bold mb-3">تقرير عام</h1>
      <p>عرض آمن للقراءة فقط عبر token: {params.publicToken}</p>
    </main>
  );
}
