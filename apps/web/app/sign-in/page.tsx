import Link from 'next/link';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { Button } from '@/components/ui/button';
import { addLangParam, AppSearchParams, localeFromSearchParams, resolveSearchParams } from '@/lib/i18n';

export default async function SignInPage({
  searchParams
}: {
  searchParams?: Promise<AppSearchParams>;
}) {
  const locale = localeFromSearchParams(await resolveSearchParams(searchParams));
  const copy =
    locale === 'ar'
      ? {
          title: 'تسجيل الدخول',
          subtitle: 'وصول آمن إلى لوحة إدارة المزرعة الذكية.',
          email: 'البريد الإلكتروني',
          password: 'كلمة المرور',
          submit: 'دخول لوحة التحكم',
          forgot: 'نسيت كلمة المرور؟',
          magic: 'رابط سحري',
          noAccount: 'لا تملك حسابًا؟',
          startPlan: 'ابدأ الخطة المناسبة'
        }
      : {
          title: 'Sign In',
          subtitle: 'Secure access to your smart farm operations dashboard.',
          email: 'Email',
          password: 'Password',
          submit: 'Open Dashboard',
          forgot: 'Forgot password?',
          magic: 'Magic Link',
          noAccount: "Don't have an account?",
          startPlan: 'Choose a plan'
        };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-end">
          <LanguageToggle />
        </div>
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400 text-xl font-black text-agri-ink">A</div>
          <h1 className="text-3xl font-black text-slate-100">{copy.title}</h1>
          <p className="mt-2 text-sm text-slate-400">{copy.subtitle}</p>
        </div>

        <section className="agri-glass rounded-2xl p-6">
          <form className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm text-slate-300">
                {copy.email}
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@farm.com"
                className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm text-slate-300">
                {copy.password}
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
              />
            </div>

            <Button className="w-full py-3" type="submit">
              {copy.submit}
            </Button>
          </form>

          <div className="mt-4 flex items-center justify-between text-sm">
            <a className="text-slate-400 hover:text-emerald-300" href="#">
              {copy.forgot}
            </a>
            <a className="text-emerald-300 hover:text-emerald-200" href="#">
              {copy.magic}
            </a>
          </div>
        </section>

        <p className="text-center text-sm text-slate-400">
          {copy.noAccount}
          <Link href={addLangParam('/pricing', locale)} className="ms-1 font-bold text-emerald-300 hover:text-emerald-200">
            {copy.startPlan}
          </Link>
        </p>
      </div>
    </main>
  );
}
