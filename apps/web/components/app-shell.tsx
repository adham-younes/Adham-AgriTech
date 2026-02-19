import Link from 'next/link';
import { ReactNode } from 'react';

const links = [
  { href: '/app', label: 'اليوم' },
  { href: '/app/farms', label: 'المزارع والحقول' },
  { href: '/app/reports', label: 'التقارير' },
  { href: '/docs', label: 'المعرفة' },
  { href: '/pricing', label: 'الأسعار' }
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen md:grid md:grid-cols-[260px_1fr]">
      <aside className="bg-emerald-800 p-4 text-white">
        <h2 className="mb-1 text-xl font-bold">Adham AgriTech</h2>
        <p className="mb-4 text-xs text-emerald-100">Water-Smart Advisor</p>
        <nav className="space-y-2">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="block rounded bg-emerald-700 px-3 py-2 hover:bg-emerald-600">
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="p-6">{children}</main>
    </div>
  );
}
