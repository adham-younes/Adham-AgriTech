import { NextRequest, NextResponse } from 'next/server';
import { normalizeLocale } from '@/lib/i18n';

export function middleware(req: NextRequest) {
  const response = NextResponse.next();
  const langParam = req.nextUrl.searchParams.get('lang');

  if (langParam) {
    const locale = normalizeLocale(langParam);
    response.cookies.set('lang', locale, {
      path: '/',
      sameSite: 'lax',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 365
    });
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
