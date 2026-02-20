import './globals.css';
import type { Metadata } from 'next';
import { Tajawal } from 'next/font/google';
import { PerformanceMonitor } from '@/components/performance-monitor';

const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  variable: '--font-main',
  weight: ['400', '500', '700', '800']
});

export const metadata: Metadata = {
  title: 'Adham AgriTech | Precision Farming Platform',
  description: 'تطبيق زراعي ذكي لإدارة الحقول، توصيات الري اليومية، ومراقبة NDVI'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${tajawal.variable} bg-[#030a05] text-slate-100 antialiased`}>
        <PerformanceMonitor />
        {children}
      </body>
    </html>
  );
}
