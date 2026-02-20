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
            <p className="text-lg font-black tracking-tight agri-text-primary">Adham AgriTech</p>
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
                className={`block rounded-xl px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/50 ${
                  active
                    ? 'bg-[var(--agri-bg-brand-muted)] text-emerald-300 shadow-[var(--agri-shadow-glow)]'
                    : 'agri-text-muted hover:bg-white/5 hover:text-emerald-300'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="agri-panel mt-8 p-4 text-sm">
          <p className="mb-1 agri-text-secondary">الخطة النشطة</p>
          <p className="text-xl font-black agri-text-primary">Pro Trial</p>
          <p className="mt-2 text-xs agri-text-muted">فتح كامل للوحات، NDVI، التنبيهات، والتقارير خلال الفترة التجريبية.</p>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[var(--agri-bg-base-80)] px-5 py-4 backdrop-blur-xl md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs agri-text-muted">منصة تشغيل زراعية لحظية</p>
              <p className="font-semibold agri-text-primary">{today}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="agri-badge">API Sync: Active</span>
              <Link href="/app/reports" className="agri-btn agri-btn-primary">
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
