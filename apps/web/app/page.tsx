import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Panel } from '@/components/ui/panel';

const features = [
  {
    title: 'Daily Irrigation Advice',
    text: 'توصية ري يومية دقيقة لكل حقل اعتمادًا على ET0 وحالة الغطاء النباتي.'
  },
  {
    title: 'Crop Stress Watch',
    text: 'مراقبة NDVI وتنبيه فوري عند ظهور مؤشرات إجهاد أو انخفاض غير طبيعي.'
  },
  {
    title: 'Water Productivity Reports',
    text: 'تقارير شهرية جاهزة للمشاركة مع الإدارة أو المستثمرين عبر رابط عام آمن.'
  }
];

const steps = ['أضف المزارع والحقول وحدودها', 'تجميع بيانات الطقس وNDVI آليًا', 'استلام قرار تشغيل يومي قابل للتنفيذ'];

export default function LandingPage() {
  return (
    <main className="min-h-screen text-slate-100">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-agri-base backdrop-blur-xl">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 font-black text-agri-ink">A</div>
            <div>
              <p className="text-lg font-black">Adham AgriTech</p>
              <p className="text-xs text-slate-400">AI-Powered Precision Farming</p>
            </div>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-slate-300 hover:text-emerald-300">
              الميزات
            </a>
            <a href="#how" className="text-sm text-slate-300 hover:text-emerald-300">
              كيف تعمل
            </a>
            <Link href="/pricing" className="text-sm text-slate-300 hover:text-emerald-300">
              الأسعار
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <ButtonLink href="/sign-in" variant="outline" size="sm" className="border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/10">
              تسجيل الدخول
            </ButtonLink>
            <ButtonLink href="/app" variant="solid" size="sm">
              ابدأ الآن
            </ButtonLink>
          </div>
        </div>
      </header>

      <section className="relative mx-auto grid w-full max-w-7xl gap-10 px-6 pb-20 pt-16 lg:grid-cols-2 lg:pt-24">
        <div className="space-y-7">
          <Badge>Agrio-level Workflow, Built for Arab Farming Ops</Badge>
          <h1 className="text-4xl font-black leading-tight md:text-6xl">
            منصة تشغيل زراعي ذكية
            <span className="block text-emerald-300">تجمع القرار، التنفيذ، والمتابعة</span>
          </h1>
          <p className="max-w-2xl text-lg text-slate-300">
            واجهة موحدة لإدارة الحقول، توصيات ري يومية، وتنبيهات NDVI مع تقارير شهرية جاهزة. مصممة لتقليل الهدر ورفع إنتاجية المياه.
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/app" size="lg">
              دخول لوحة التحكم
            </ButtonLink>
            <ButtonLink href="/docs" variant="outline" size="lg">
              استعراض قاعدة المعرفة
            </ButtonLink>
          </div>
        </div>

        <Panel className="relative overflow-hidden p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_55%)]" />
          <div className="relative grid gap-4">
            <Card className="bg-black/25 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Live Snapshot</p>
              <p className="mt-3 text-4xl font-black text-emerald-300">+18.5%</p>
              <p className="text-sm text-slate-300">تحسن إنتاجية المياه في آخر 30 يومًا</p>
            </Card>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="bg-black/20 p-4">
                <p className="text-xs text-slate-400">الحقول المراقبة</p>
                <p className="mt-2 text-2xl font-black">84</p>
              </Card>
              <Card className="bg-black/20 p-4">
                <p className="text-xs text-slate-400">معدل جاهزية البيانات</p>
                <p className="mt-2 text-2xl font-black text-emerald-300">99.8%</p>
              </Card>
            </div>
          </div>
        </Panel>
      </section>

      <section id="how" className="border-y border-white/10 bg-black/25 py-16">
        <div className="mx-auto w-full max-w-7xl px-6">
          <h2 className="mb-10 text-3xl font-black">كيف تعمل المنصة</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => (
              <Panel key={step} as="article" className="p-6">
                <p className="mb-4 text-sm font-black text-emerald-300">0{index + 1}</p>
                <p className="text-lg font-semibold text-slate-100">{step}</p>
              </Panel>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto w-full max-w-7xl px-6 py-16">
        <div className="mb-10 flex items-end justify-between gap-5">
          <h2 className="text-3xl font-black">ميزات تشغيلية فعلية</h2>
          <Link href="/app" className="text-sm font-bold text-emerald-300 hover:text-emerald-200">
            جرّب اللوحة الآن
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {features.map((feature) => (
            <Panel key={feature.title} as="article" className="p-6">
              <h3 className="mb-3 text-xl font-black text-slate-100">{feature.title}</h3>
              <p className="text-slate-300">{feature.text}</p>
            </Panel>
          ))}
        </div>
      </section>
    </main>
  );
}
