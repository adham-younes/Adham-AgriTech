'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';
import { Locale } from '@/lib/i18n';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export function CopilotPanel({ locale, tenantId }: { locale: Locale; tenantId?: string | null }) {
  const copy = useMemo(
    () =>
      locale === 'ar'
        ? {
            intro: 'مرحبًا، أنا مساعدك الزراعي. اسألني عن الري، صحة الحقول، والتنبيهات.',
            placeholder: 'اكتب سؤالك الزراعي هنا...',
            send: 'إرسال',
            sending: 'جارٍ التحليل...',
            error: 'تعذر الاتصال بالمساعد الآن. تحقق من GROQ_API_KEY ثم أعد المحاولة.',
            model: 'النموذج',
            user: 'أنت',
            assistant: 'المساعد'
          }
        : {
            intro: 'Hi, I am your agritech copilot. Ask about irrigation, field health, and alerts.',
            placeholder: 'Ask your farming question...',
            send: 'Send',
            sending: 'Analyzing...',
            error: 'Assistant is currently unavailable. Verify GROQ_API_KEY and retry.',
            model: 'Model',
            user: 'You',
            assistant: 'Copilot'
          },
    [locale]
  );

  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'assistant', content: copy.intro }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastModel, setLastModel] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const requestMessages = [...messages, { role: 'user' as const, content: trimmed }].slice(-20);
    setInput('');
    setLastError(null);
    setMessages(requestMessages);
    setLoading(true);

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: requestMessages,
          locale,
          tenantId: tenantId ?? undefined,
          temperature: 0.45,
          maxTokens: 1024
        })
      });

      const data = (await response.json().catch(() => null)) as { ok?: boolean; answer?: string; model?: string; error?: string } | null;
      if (!response.ok || !data?.ok) {
        setLastError(data?.error ?? 'assistant_request_failed');
        setMessages((prev) => [...prev, { role: 'assistant', content: copy.error }]);
        return;
      }

      const answer = data.answer?.trim() || copy.error;
      setLastModel(data.model ?? null);
      setMessages((prev) => [...prev, { role: 'assistant', content: answer }]);
    } catch {
      setLastError('network_error');
      setMessages((prev) => [...prev, { role: 'assistant', content: copy.error }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Panel className="max-h-[60vh] space-y-3 overflow-y-auto p-4 agri-scroll">
        {messages.map((message, index) => {
          const isUser = message.role === 'user';
          return (
            <article
              key={`${message.role}-${index}-${message.content.slice(0, 20)}`}
              className={`rounded-2xl border px-4 py-3 ${isUser ? 'ml-auto max-w-[90%] border-emerald-300/40 bg-emerald-500/10' : 'mr-auto max-w-[95%] border-white/10 bg-black/20'}`}
            >
              <p className="mb-1 text-xs font-bold text-slate-400">{isUser ? copy.user : copy.assistant}</p>
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-100">{message.content}</p>
            </article>
          );
        })}
      </Panel>

      <Panel as="form" onSubmit={onSubmit} className="space-y-3 p-4">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={copy.placeholder}
          className="min-h-28 w-full resize-y rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-300/60"
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            {lastModel ? `${copy.model}: ${lastModel}` : null}
            {lastError ? (lastModel ? ` • ${lastError}` : lastError) : null}
          </div>
          <Button type="submit" disabled={loading || !input.trim()}>
            {loading ? copy.sending : copy.send}
          </Button>
        </div>
      </Panel>
    </div>
  );
}
