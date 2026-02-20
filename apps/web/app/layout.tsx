import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Adham AgriTech',
  description: 'توصيات ري ذكية ومراقبة إجهاد المحاصيل'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
