export type Locale = 'ar' | 'en';

type SearchValue = string | string[] | undefined;
export type AppSearchParams = Record<string, SearchValue>;

export function normalizeLocale(value: string | null | undefined): Locale {
  return value === 'en' ? 'en' : 'ar';
}

export function localeFromSearchParams(searchParams?: AppSearchParams): Locale {
  const raw = searchParams?.lang;
  if (Array.isArray(raw)) return normalizeLocale(raw[0]);
  return normalizeLocale(raw);
}

export function localeFromAnySearchParams(searchParams: { get(name: string): string | null }): Locale {
  return normalizeLocale(searchParams.get('lang'));
}

export function isRtl(locale: Locale): boolean {
  return locale === 'ar';
}

export function addLangParam(href: string, locale: Locale): string {
  const [path, rawQuery] = href.split('?');
  const params = new URLSearchParams(rawQuery ?? '');
  params.set('lang', locale);
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export function localeDateFormat(locale: Locale): string {
  return locale === 'ar' ? 'ar-EG' : 'en-US';
}

export async function resolveSearchParams(input?: AppSearchParams | Promise<AppSearchParams>): Promise<AppSearchParams | undefined> {
  if (!input) return undefined;
  return await input;
}
