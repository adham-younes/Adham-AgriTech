import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

Deno.serve(async (req) => {
  const payload = await req.json();
  const month = payload.month ?? new Date().toISOString().slice(0, 7) + '-01';

  const { data: orgs } = payload.mode === 'batch'
    ? await supabase.from('organizations').select('id,name').limit(1000)
    : { data: [{ id: payload.org_id, name: 'Org' }] };

  for (const org of orgs ?? []) {
    const wapor = await fetch((Deno.env.get('WAPOR_BASE_URL') ?? 'https://data.apps.fao.org/gismgr/api/v2') + '/catalog/workspaces/WAPOR-3/mosaicsets').then((r) => r.json());
    const token = crypto.randomUUID().replaceAll('-', '');
    const html = `<html><body><h1>تقرير إنتاجية المياه</h1><p>المنظمة: ${org.name}</p><p>الشهر: ${month}</p></body></html>`;
    const path = `reports/${org.id}/${month}.html`;

    await supabase.storage.from('reports').upload(path, new TextEncoder().encode(html), { contentType: 'text/html', upsert: true });
    const { data: pub } = supabase.storage.from('reports').getPublicUrl(path);

    await supabase.from('reports').insert({
      org_id: org.id,
      month,
      type: 'wapor_water_productivity',
      status: 'ready',
      public_token: token,
      artifact_url: pub.publicUrl,
      payload: { source: 'WaPOR v3', sample: wapor?.response?.length ?? 0 }
    });
  }

  return new Response(JSON.stringify({ ok: true, month }));
});
