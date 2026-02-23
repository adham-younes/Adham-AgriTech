import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServiceServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const requestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string().min(1).max(12000)
      })
    )
    .min(1)
    .max(40),
  tenantId: z.string().uuid().optional(),
  locale: z.enum(['ar', 'en']).default('ar'),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().min(64).max(4096).optional(),
  reasoningEffort: z.enum(['low', 'medium', 'high']).optional()
});

type TenantContext = {
  tenantId: string;
  tenantName: string | null;
  region: string | null;
  farmsCount: number;
  fieldsCount: number;
  openAlertsCount: number;
  latestReportType: string | null;
  latestReportStatus: string | null;
  latestReportAt: string | null;
};

export async function POST(req: NextRequest) {
  const groqKey = process.env.GROQ_API_KEY ?? process.env.XAI_API_KEY;
  if (!groqKey) {
    return NextResponse.json({ ok: false, error: 'missing_groq_api_key' }, { status: 500 });
  }

  let payload: z.infer<typeof requestSchema>;
  try {
    payload = requestSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_request_payload' }, { status: 400 });
  }

  const model = process.env.GROQ_MODEL ?? 'openai/gpt-oss-120b';
  const baseUrl = process.env.GROQ_BASE_URL ?? 'https://api.groq.com/openai/v1';
  const tenantContext = await loadTenantContext(payload.tenantId);

  const systemMessage = buildSystemMessage(payload.locale, tenantContext);
  const modelMessages = [
    { role: 'system', content: systemMessage },
    ...payload.messages
      .filter((message) => message.role !== 'system')
      .map((message) => ({ role: message.role, content: message.content }))
  ];

  const groqRes = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${groqKey}`
    },
    body: JSON.stringify({
      model,
      messages: modelMessages,
      temperature: payload.temperature ?? 0.5,
      max_completion_tokens: payload.maxTokens ?? 1024,
      top_p: 1,
      reasoning_effort: payload.reasoningEffort ?? 'medium',
      stream: false
    })
  });

  if (!groqRes.ok) {
    const errorText = await groqRes.text();
    return NextResponse.json(
      {
        ok: false,
        error: 'groq_request_failed',
        status: groqRes.status,
        details: errorText.slice(0, 800)
      },
      { status: 502 }
    );
  }

  const completion = (await groqRes.json()) as {
    choices?: Array<{ message?: { content?: unknown } }>;
    usage?: unknown;
  };

  const answer = normalizeModelContent(completion.choices?.[0]?.message?.content);
  return NextResponse.json({
    ok: true,
    model,
    answer,
    usage: completion.usage ?? null,
    tenantContext
  });
}

async function loadTenantContext(tenantId?: string): Promise<TenantContext | null> {
  if (!tenantId) return null;

  try {
    const supabase = createSupabaseServiceServerClient();

    const [tenantRes, farmsRes, fieldsRes, alertsRes, reportRes] = await Promise.all([
      supabase.from('tenants').select('id,name,region').eq('id', tenantId).maybeSingle(),
      supabase.from('farms').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
      supabase.from('fields').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
      supabase
        .from('alerts')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .neq('status', 'resolved'),
      supabase
        .from('reports')
        .select('report_type,status,generated_at')
        .eq('tenant_id', tenantId)
        .order('generated_at', { ascending: false })
        .limit(1)
        .maybeSingle()
    ]);

    if (tenantRes.error || !tenantRes.data) return null;

    return {
      tenantId,
      tenantName: tenantRes.data.name ?? null,
      region: tenantRes.data.region ?? null,
      farmsCount: farmsRes.count ?? 0,
      fieldsCount: fieldsRes.count ?? 0,
      openAlertsCount: alertsRes.count ?? 0,
      latestReportType: reportRes.data?.report_type ?? null,
      latestReportStatus: reportRes.data?.status ?? null,
      latestReportAt: reportRes.data?.generated_at ?? null
    };
  } catch {
    return null;
  }
}

function normalizeModelContent(content: unknown): string {
  if (typeof content === 'string') return content.trim();

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') return part;
        if (part && typeof part === 'object' && 'text' in part && typeof part.text === 'string') return part.text;
        return '';
      })
      .join('\n')
      .trim();
  }

  return '';
}

function buildSystemMessage(locale: 'ar' | 'en', tenantContext: TenantContext | null): string {
  const arBase =
    'أنت مساعد زراعي ذكي لتطبيق Adham AgriTech. قدّم إجابات عملية ومباشرة. إذا كانت البيانات ناقصة فاذكر ذلك بوضوح ولا تخمّن.';
  const enBase =
    'You are an agritech copilot for Adham AgriTech. Provide practical, concise guidance. If data is missing, say so clearly and do not hallucinate.';

  if (!tenantContext) return locale === 'ar' ? arBase : enBase;

  const context =
    locale === 'ar'
      ? `سياق المستأجر: الاسم=${tenantContext.tenantName ?? 'غير متوفر'}, المنطقة=${tenantContext.region ?? 'غير متوفر'}, عدد المزارع=${tenantContext.farmsCount}, عدد الحقول=${tenantContext.fieldsCount}, التنبيهات المفتوحة=${tenantContext.openAlertsCount}, آخر تقرير=${tenantContext.latestReportType ?? 'لا يوجد'} (${tenantContext.latestReportStatus ?? 'n/a'})`
      : `Tenant context: name=${tenantContext.tenantName ?? 'n/a'}, region=${tenantContext.region ?? 'n/a'}, farms=${tenantContext.farmsCount}, fields=${tenantContext.fieldsCount}, open_alerts=${tenantContext.openAlertsCount}, latest_report=${tenantContext.latestReportType ?? 'none'} (${tenantContext.latestReportStatus ?? 'n/a'})`;

  return `${locale === 'ar' ? arBase : enBase}\n${context}`;
}
