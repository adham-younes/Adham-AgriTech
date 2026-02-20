import { Panel } from '@/components/ui/panel';

export default function ContactPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl space-y-6 px-6 py-10 text-slate-100">
      <h1 className="text-4xl font-black">تواصل معنا</h1>
      <Panel as="article" className="p-6">
        <p className="text-slate-300">للاستفسارات التجارية أو التكامل المؤسسي:</p>
        <a href="mailto:hello@adham-agritech.com" className="mt-3 inline-block text-lg font-bold text-emerald-300 hover:text-emerald-200">
          hello@adham-agritech.com
        </a>
      </Panel>
    </main>
  );
}
