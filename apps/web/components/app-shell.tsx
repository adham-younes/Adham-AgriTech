import Link from 'next/link';
import { ReactNode } from 'react';

const links = [
  { href: '/app', label: 'اليوم' },
  { href: '/app/farms', label: 'المزارع' },
  { href: '/app/reports', label: 'التقارير' }
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <aside className="bg-emerald-800 text-white p-4">
        <h2 className="text-xl font-bold mb-4">Adham AgriTech</h2>
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
