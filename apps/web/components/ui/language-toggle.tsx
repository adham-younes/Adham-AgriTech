'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { localeFromAnySearchParams } from '@/lib/i18n';

export function LanguageToggle() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = localeFromAnySearchParams(searchParams);
  const nextLocale = locale === 'ar' ? 'en' : 'ar';
  const params = new URLSearchParams(searchParams.toString());
  params.set('lang', nextLocale);
  const href = `${pathname}?${params.toString()}`;

  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-xl border border-white/20 px-3 py-2 text-xs font-bold text-slate-200 hover:border-[rgba(212,175,55,0.5)] hover:text-[var(--agri-royal-gold)]"
    >
      {nextLocale === 'ar' ? 'العربية' : 'English'}
    </Link>
  );
}
