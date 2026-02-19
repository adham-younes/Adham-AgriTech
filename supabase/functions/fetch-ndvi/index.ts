import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

Deno.serve(async (req) => {
  const payload = await req.json();
  const { data: fields } = await supabase.from('fields').select('id,geometry').limit(1000);

  for (const field of fields ?? []) {
    const ndviMean = Number((Math.random() * 0.5 + 0.2).toFixed(3));
    const date = payload.end_date ?? new Date().toISOString().slice(0, 10);
    await supabase.from('satellite_ndvi_timeseries').upsert({ field_id: field.id, date, ndvi_mean: ndviMean, cloud_pct: 20 }, { onConflict: 'field_id,date' });

    const { data: prev } = await supabase.from('satellite_ndvi_timeseries').select('ndvi_mean').eq('field_id', field.id).order('date', { ascending: false }).limit(4);
    const rolling = (prev ?? []).reduce((acc, row) => acc + Number(row.ndvi_mean), 0) / Math.max((prev ?? []).length, 1);
    if (rolling > 0 && ndviMean < rolling - 0.08) {
      await supabase.from('alerts').insert({ field_id: field.id, date, type: 'ndvi_drop', severity: 3, message: 'انخفاض ملحوظ في NDVI مقارنة بالمتوسط.' });
    }
  }

  return new Response(JSON.stringify({ ok: true, processed: fields?.length ?? 0 }));
});
