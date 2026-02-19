import { AlertItem, FieldSummary, Plan } from './types';

export const planLimits: Record<Plan, { fields: number; reports: number; ndviChecks: number }> = {
  free: { fields: 1, reports: 1, ndviChecks: 4 },
  pro: { fields: 10, reports: 100, ndviChecks: 40 },
  b2b: { fields: 100, reports: 1000, ndviChecks: 400 }
};

export const farms = [
  { id: 'farm-1', name: 'مزرعة الوادي', country: 'EG', governorate: 'المنيا', orgId: 'org-1' },
  { id: 'farm-2', name: 'مزرعة الدلتا', country: 'EG', governorate: 'الدقهلية', orgId: 'org-1' }
];

export const fields: FieldSummary[] = [
  {
    id: 'field-1',
    farmId: 'farm-1',
    name: 'حقل الطماطم A',
    cropType: 'tomato',
    areaHa: 1.2,
    centroidLat: 28.11,
    centroidLng: 30.74,
    ndviSeries: [
      { date: '2026-01-01', value: 0.72 },
      { date: '2026-01-08', value: 0.69 },
      { date: '2026-01-15', value: 0.66 },
      { date: '2026-01-22', value: 0.63 }
    ],
    weatherToday: { tempC: 36, windKmh: 18, humidity: 34 },
    irrigationToday: { et0Mm: 5.9, recommendedMm: 6.5, confidence: 0.76 }
  },
  {
    id: 'field-2',
    farmId: 'farm-2',
    name: 'حقل القمح B',
    cropType: 'wheat',
    areaHa: 3.4,
    centroidLat: 31.09,
    centroidLng: 31.65,
    ndviSeries: [
      { date: '2026-01-01', value: 0.58 },
      { date: '2026-01-08', value: 0.62 },
      { date: '2026-01-15', value: 0.65 },
      { date: '2026-01-22', value: 0.67 }
    ],
    weatherToday: { tempC: 25, windKmh: 12, humidity: 57 },
    irrigationToday: { et0Mm: 3.8, recommendedMm: 4.1, confidence: 0.81 }
  }
];

export const alerts: AlertItem[] = [
  {
    id: 'alert-1',
    fieldId: 'field-1',
    type: 'heat',
    severity: 4,
    message: 'درجة الحرارة أعلى من 38° محتملة خلال 48 ساعة.',
    date: '2026-02-19'
  },
  {
    id: 'alert-2',
    fieldId: 'field-1',
    type: 'ndvi_drop',
    severity: 3,
    message: 'هبوط NDVI بنسبة 9% عن متوسط 3 أسابيع.',
    date: '2026-02-19'
  }
];
