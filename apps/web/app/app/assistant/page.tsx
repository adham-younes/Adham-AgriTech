import { CopilotPanel } from '@/components/assistant/copilot-panel';
import { Badge } from '@/components/ui/badge';
import { Panel } from '@/components/ui/panel';
import { AppSearchParams, localeFromSearchParams, resolveSearchParams } from '@/lib/i18n';
import { createSupabaseServiceServerClient } from '@/lib/supabase/server';

async function resolveDefaultTenantId() {
  try {
    const supabase = createSupabaseServiceServerClient();
    const { data } = await supabase
      .from('tenants')
      .select('id')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    return data?.id ?? null;
  } catch {
    return null;
  }
}

export default async function AssistantPage({
  searchParams
}: {
  searchParams?: Promise<AppSearchParams>;
}) {
  const locale = localeFromSearchParams(await resolveSearchParams(searchParams));
  const tenantId = await resolveDefaultTenantId();
  const copy =
    locale === 'ar'
      ? {
          title: 'المساعد الذكي الزراعي',
          subtitle: 'مساعد مرتبط ببيانات التطبيق لمتابعة الري، NDVI، والتنبيهات التشغيلية.',
          live: 'Live Copilot'
        }
      : {
          title: 'Smart Agritech Copilot',
          subtitle: 'An assistant connected to app data for irrigation, NDVI, and operations alerts.',
          live: 'Live Copilot'
        };

  return (
    <section className="space-y-5">
      <div>
        <Badge>{copy.live}</Badge>
        <h1 className="mt-2 text-3xl font-black">{copy.title}</h1>
        <p className="mt-1 text-sm text-slate-400">{copy.subtitle}</p>
      </div>

      <Panel className="p-4">
        <CopilotPanel locale={locale} tenantId={tenantId} />
      </Panel>
    </section>
  );
}
