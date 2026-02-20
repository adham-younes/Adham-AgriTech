import Link from 'next/link';

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400 text-xl font-black text-[#04210b]">A</div>
          <h1 className="text-3xl font-black text-slate-100">تسجيل الدخول</h1>
          <p className="mt-2 text-sm text-slate-400">وصول آمن إلى لوحة إدارة المزرعة الذكية.</p>
        </div>

        <section className="agri-glass rounded-2xl p-6">
          <form className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm text-slate-300">
                البريد الإلكتروني
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
                كلمة المرور
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400"
              />
            </div>

            <button className="w-full rounded-xl bg-emerald-400 px-4 py-3 text-sm font-black text-[#03200a] hover:bg-emerald-300" type="submit">
              دخول لوحة التحكم
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between text-sm">
            <a className="text-slate-400 hover:text-emerald-300" href="#">
              نسيت كلمة المرور؟
            </a>
            <a className="text-emerald-300 hover:text-emerald-200" href="#">
              رابط سحري
            </a>
          </div>
        </section>

        <p className="text-center text-sm text-slate-400">
          لا تملك حسابًا؟
          <Link href="/pricing" className="mr-1 font-bold text-emerald-300 hover:text-emerald-200">
            ابدأ الخطة المناسبة
          </Link>
        </p>
      </div>
    </main>
  );
}
