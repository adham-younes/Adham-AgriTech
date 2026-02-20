import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

Deno.serve(async () => {
  const [orgs, fields, alerts] = await Promise.all([
    supabase.from('organizations').select('id', { count: 'exact', head: true }),
    supabase.from('fields').select('id', { count: 'exact', head: true }),
    supabase.from('alerts').select('id', { count: 'exact', head: true })
  ]);

  return new Response(JSON.stringify({
    status: 'ok',
    counts: {
      organizations: orgs.count ?? 0,
      fields: fields.count ?? 0,
      alerts: alerts.count ?? 0
    }
  }));
});
