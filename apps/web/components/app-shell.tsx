'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

const links = [
  { href: '/app', label: 'لوحة اليوم' },
  { href: '/app/farms', label: 'المزارع والحقول' },
  { href: '/app/reports', label: 'التقارير' },
  { href: '/docs', label: 'قاعدة المعرفة' },
  { href: '/pricing', label: 'الأسعار' }
];

function isActive(pathname: string, href: string) {
  if (href === '/app') return pathname === '/app';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const today = new Intl.DateTimeFormat('ar-EG', { dateStyle: 'full' }).format(new Date());

  return (
    <div className="min-h-screen md:grid md:grid-cols-[280px_1fr]">
      <aside className="agri-glass border-l border-r-0 border-white/10 p-6 md:sticky md:top-0 md:h-screen md:overflow-y-auto">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/90 text-lg font-black text-[#052109]">A</div>
          <div>
            <p className="text-lg font-black tracking-tight">Adham AgriTech</p>
            <p className="text-xs text-emerald-200/70">Precision Farming Command Center</p>
          </div>
        </div>

        <nav className="space-y-2">
          {links.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`focus-ring block rounded-xl px-4 py-3 text-sm font-semibold ${
                  active
                    ? 'bg-emerald-500/15 text-emerald-300 shadow-[inset_0_0_16px_rgba(16,185,129,0.15)]'
                    : 'text-slate-300 hover:bg-white/5 hover:text-emerald-300'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="agri-panel mt-8 p-4 text-sm">
          <p className="mb-1 text-slate-300">الخطة النشطة</p>
          <p className="text-xl font-black text-emerald-300">Pro Trial</p>
          <p className="mt-2 text-xs text-slate-400">فتح كامل للوحات، NDVI، التنبيهات، والتقارير خلال الفترة التجريبية.</p>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[var(--bg-base)]/90 px-5 py-4 backdrop-blur-xl md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-slate-400">منصة تشغيل زراعية لحظية</p>
              <p className="font-semibold text-slate-100">{today}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="agri-badge">API Sync: Active</span>
              <Link href="/app/reports" className="focus-ring rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-[#04250b] hover:bg-emerald-400">
                إنشاء تقرير
              </Link>
            </div>
          </div>
        </header>

        <main className="agri-scroll min-h-[calc(100vh-82px)] overflow-x-hidden overflow-y-auto px-5 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
