import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const statusMap: Record<string, { label: string; tone: 'status' | 'amber' | 'slate' }> = {
  ready: { label: 'جاهز', tone: 'status' },
  queued: { label: 'قيد المعالجة', tone: 'amber' },
  archived: { label: 'مؤرشف', tone: 'slate' }
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
    <Card as="article" className="group flex h-full flex-col p-5 transition hover:border-emerald-400/40 hover:bg-white/[0.05]">
      <div className="mb-5 flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold text-slate-100">{title}</h3>
        <Badge variant={badge.tone}>{badge.label}</Badge>
      </div>

      <p className="text-sm text-slate-400">{month}</p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Card className="bg-black/20 p-3">
          <p className="text-xs text-slate-400">كفاءة المياه</p>
          <p className="text-xl font-black text-emerald-300">{efficiency ? `${efficiency}%` : '--'}</p>
        </Card>
        <Card className="bg-black/20 p-3">
          <p className="text-xs text-slate-400">الاستهلاك</p>
          <p className="text-xl font-black text-slate-100">{waterUsage ?? '--'}</p>
        </Card>
      </div>

      <div className="mt-5 flex gap-2">
        <Button className="flex-1" type="button">
          تنزيل PDF
        </Button>
        <Button variant="outline" type="button">
          مشاركة
        </Button>
      </div>
    </Card>
  );
}
