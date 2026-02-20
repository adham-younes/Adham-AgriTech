export const unifiedValueProposition = 'شغّل مزرعتك بقرار يومي واضح: ري أدق، تنبيهات NDVI أسرع، وتقارير جاهزة للمشاركة.';

export const primaryCtaLabel = 'ابدأ التشغيل الآن';

export const primaryAppCtaLabel = 'افتح لوحة التنفيذ';

export type UiState = 'ready' | 'loading' | 'empty' | 'error';

export function resolveUiState(value?: string): UiState {
  if (value === 'loading' || value === 'empty' || value === 'error') {
    return value;
  }
  return 'ready';
}

