'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Locale } from '@/lib/i18n';

const statusMap: Record<string, { label: string; tone: 'status' | 'amber' | 'slate' }> = {
  ready: { label: 'جاهز', tone: 'status' },
  queued: { label: 'قيد المعالجة', tone: 'amber' },
  failed: { label: 'فشل', tone: 'slate' },
  archived: { label: 'مؤرشف', tone: 'slate' }
};

export function ReportCard({
  title,
  month,
  status,
  efficiency,
  waterUsage,
  locale = 'ar',
  downloadUrl,
  shareUrl
}: {
  title: string;
  month: string;
  status: string;
  efficiency?: number;
  waterUsage?: string;
  locale?: Locale;
  downloadUrl?: string;
  shareUrl?: string;
}) {
  const localStatusMap =
    locale === 'ar'
      ? statusMap
      : {
          ready: { label: 'Ready', tone: 'status' as const },
          queued: { label: 'Queued', tone: 'amber' as const },
          failed: { label: 'Failed', tone: 'slate' as const },
          archived: { label: 'Archived', tone: 'slate' as const }
        };
  const badge = localStatusMap[status] ?? localStatusMap.archived;
  const copy = locale === 'ar' ? { efficiency: 'كفاءة المياه', usage: 'الاستهلاك', download: 'تنزيل', share: 'مشاركة' } : { efficiency: 'Water efficiency', usage: 'Usage', download: 'Download', share: 'Share' };

  return (
    <Card as="article" className="group flex h-full flex-col p-5 transition hover:border-emerald-400/40 hover:bg-white/[0.05]">
      <div className="mb-5 flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold text-slate-100">{title}</h3>
        <Badge variant={badge.tone}>{badge.label}</Badge>
      </div>

      <p className="text-sm text-slate-400">{month}</p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Card className="bg-black/20 p-3">
          <p className="text-xs text-slate-400">{copy.efficiency}</p>
          <p className="text-xl font-black text-emerald-300">{efficiency ? `${efficiency}%` : '--'}</p>
        </Card>
        <Card className="bg-black/20 p-3">
          <p className="text-xs text-slate-400">{copy.usage}</p>
          <p className="text-xl font-black text-slate-100">{waterUsage ?? '--'}</p>
        </Card>
      </div>

      <div className="mt-5 flex gap-2">
        <Button
          className="flex-1"
          type="button"
          onClick={() => {
            if (downloadUrl) window.open(downloadUrl, '_blank', 'noopener,noreferrer');
          }}
          disabled={!downloadUrl}
        >
          {copy.download}
        </Button>
        <Button
          variant="outline"
          type="button"
          onClick={() => {
            if (shareUrl && typeof navigator !== 'undefined' && navigator.clipboard) {
              navigator.clipboard.writeText(shareUrl);
            }
          }}
          disabled={!shareUrl}
        >
          {copy.share}
        </Button>
      </div>
    </Card>
  );
}
