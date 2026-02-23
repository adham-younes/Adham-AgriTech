'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ReactNode } from 'react';
import { addLangParam, localeFromAnySearchParams } from '@/lib/i18n';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { Panel } from '@/components/ui/panel';

const links = {
  ar: [
    { href: '/app', label: 'لوحة اليوم', icon: 'dashboard' as const },
    { href: '/app/farms', label: 'المزارع', icon: 'farms' as const },
    { href: '/app/fields/field-1', label: 'الحقول', icon: 'fields' as const },
    { href: '/app/reports', label: 'التقارير', icon: 'reports' as const },
    { href: '/app/assistant', label: 'المساعد الذكي', icon: 'assistant' as const }
  ],
  en: [
    { href: '/app', label: 'Dashboard', icon: 'dashboard' as const },
    { href: '/app/farms', label: 'Farms', icon: 'farms' as const },
    { href: '/app/fields/field-1', label: 'Fields', icon: 'fields' as const },
    { href: '/app/reports', label: 'Reports', icon: 'reports' as const },
    { href: '/app/assistant', label: 'AI Copilot', icon: 'assistant' as const }
  ]
} as const;

function isActive(pathname: string, href: string) {
  if (href === '/app') return pathname === '/app';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = localeFromAnySearchParams(searchParams);
  const copy =
    locale === 'ar'
      ? {
          subtitle: 'Precision Farming',
          farm: 'North Valley Farm',
          settings: 'الإعدادات',
          profileName: 'Omar Adham',
          profilePlan: 'Premium Plan'
        }
      : {
          subtitle: 'Precision Farming',
          farm: 'North Valley Farm',
          settings: 'Settings',
          profileName: 'Omar Adham',
          profilePlan: 'Premium Plan'
        };

  return (
    <div className="min-h-screen p-2 md:p-6">
      <div className="agri-shell-frame mx-auto min-h-[calc(100vh-16px)] max-w-[1600px] overflow-hidden rounded-[28px] md:grid md:grid-cols-[250px_1fr]">
        <aside className="agri-sidebar flex h-full flex-col px-4 py-5 md:px-5 md:py-6">
          <div className="mb-6 flex items-center gap-3 px-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#11d41f] text-[#03200a]">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 4v16M4 12h16" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-black leading-5 tracking-tight text-white">Adham Agri</p>
              <p className="mt-1 text-xs text-emerald-300/80">{copy.subtitle}</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {links[locale].map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={addLangParam(link.href, locale)}
                  className={`agri-menu-item ${active ? 'agri-menu-item-active' : ''} flex items-center gap-3`}
                >
                  <NavIcon icon={link.icon} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-6">
            <Panel className="flex items-center gap-3 rounded-2xl p-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100/10 text-emerald-200">OA</div>
              <div>
                <p className="text-sm font-bold text-slate-100">{copy.profileName}</p>
                <p className="text-xs text-emerald-300/75">{copy.profilePlan}</p>
              </div>
            </Panel>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="agri-topbar sticky top-0 z-40 px-4 py-4 md:px-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-2xl border border-emerald-600/45 bg-emerald-700/20 px-4 py-2 text-sm font-bold text-emerald-200"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span>{copy.farm}</span>
              </button>
              <div className="flex items-center gap-2">
                <IconGhostButton label="Search">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.2-3.2" />
                  </svg>
                </IconGhostButton>
                <IconGhostButton label="Notifications">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 17h5l-1.4-1.4a2 2 0 0 1-.6-1.4V10a6 6 0 1 0-12 0v4.2a2 2 0 0 1-.6 1.4L4 17h5" />
                    <path d="M9 17a3 3 0 0 0 6 0" />
                  </svg>
                </IconGhostButton>
                <LanguageToggle />
                <Link
                  href={addLangParam('/pricing', locale)}
                  className="inline-flex items-center rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-emerald-300"
                >
                  {copy.settings}
                </Link>
              </div>
            </div>
          </header>

          <main className="agri-scroll min-h-[calc(100vh-82px)] overflow-x-hidden overflow-y-auto px-4 py-5 md:px-7 md:py-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

function IconGhostButton({ children, label }: { children: ReactNode; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-slate-300 hover:border-emerald-500/40 hover:text-emerald-300"
    >
      {children}
    </button>
  );
}

function NavIcon({ icon }: { icon: 'dashboard' | 'farms' | 'fields' | 'reports' | 'assistant' }) {
  if (icon === 'dashboard') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="8" height="8" rx="1.5" />
        <rect x="13" y="3" width="8" height="5" rx="1.5" />
        <rect x="13" y="10" width="8" height="11" rx="1.5" />
        <rect x="3" y="13" width="8" height="8" rx="1.5" />
      </svg>
    );
  }
  if (icon === 'farms') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 16h18" />
        <path d="m6 16 2-6h8l2 6" />
        <circle cx="8" cy="18.5" r="1.5" />
        <circle cx="16" cy="18.5" r="1.5" />
      </svg>
    );
  }
  if (icon === 'fields') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 5h16v14H4z" />
        <path d="M12 5v14M4 12h16" />
      </svg>
    );
  }
  if (icon === 'reports') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 3h14v18H5z" />
        <path d="M9 15h2M9 11h6M9 7h6" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 5h16v11H8l-4 3z" />
      <path d="M8 9h8M8 12h5" />
    </svg>
  );
}
