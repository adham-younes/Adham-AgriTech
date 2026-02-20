export type Plan = 'free' | 'pro' | 'b2b';

export interface FieldSummary {
  id: string;
  farmId: string;
  name: string;
  cropType: string;
  areaHa: number;
  centroidLat: number;
  centroidLng: number;
  ndviSeries: Array<{ date: string; value: number }>;
  weatherToday: { tempC: number; windKmh: number; humidity: number };
  irrigationToday: { et0Mm: number; recommendedMm: number; confidence: number };
}

export interface AlertItem {
  id: string;
  fieldId: string;
  type: 'heat' | 'wind' | 'cold' | 'ndvi_drop' | 'water_stress' | 'system';
  severity: number;
  message: string;
  date: string;
}
