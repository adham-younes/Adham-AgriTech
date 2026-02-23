import './globals.css';
import type { Metadata } from 'next';
import { Space_Grotesk, Tajawal } from 'next/font/google';
import { cookies } from 'next/headers';
import { isRtl, normalizeLocale } from '@/lib/i18n';

const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  variable: '--font-main',
  weight: ['400', '500', '700', '800']
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-en',
  weight: ['400', '500', '700']
});

export const metadata: Metadata = {
  title: 'Adham AgriTech | Precision Farming Platform',
  description: 'تطبيق زراعي ذكي لإدارة الحقول، توصيات الري اليومية، ومراقبة NDVI',
  applicationName: 'Adham AgriTech'
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const langCookie = cookieStore.get('lang')?.value;
  const locale = normalizeLocale(langCookie);
  const dir = isRtl(locale) ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir}>
      <body className={`${tajawal.variable} ${spaceGrotesk.variable} ${locale === 'en' ? 'lang-en' : 'lang-ar'} bg-[#030a05] text-slate-100 antialiased`}>
        {children}
      </body>
    </html>
  );
}
