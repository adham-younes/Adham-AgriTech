'use client';

import { useEffect } from 'react';
import { useReportWebVitals } from 'next/web-vitals';

type Snapshot = {
  batch: string;
  metric: 'LCP' | 'TTFB';
  value: number;
  path: string;
  capturedAt: string;
};

const STORAGE_KEY = 'agritech-perf-snapshots';

function saveSnapshot(snapshot: Snapshot) {
  if (typeof window === 'undefined') return;
  const previous = window.localStorage.getItem(STORAGE_KEY);
  const parsed: Snapshot[] = previous ? JSON.parse(previous) : [];
  parsed.push(snapshot);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed.slice(-100)));
}

export function PerformanceMonitor() {
  const batch = process.env.NEXT_PUBLIC_RELEASE_BATCH ?? 'local';

  useReportWebVitals((metric) => {
    if (metric.name !== 'LCP' && metric.name !== 'TTFB') return;

    const snapshot: Snapshot = {
      batch,
      metric: metric.name,
      value: Number(metric.value.toFixed(2)),
      path: window.location.pathname,
      capturedAt: new Date().toISOString()
    };

    saveSnapshot(snapshot);
    console.info('[perf]', snapshot);
  });

  useEffect(() => {
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    if (!navEntry) return;

    const ttfbApprox = Number((navEntry.responseStart - navEntry.requestStart).toFixed(2));
    if (!Number.isFinite(ttfbApprox) || ttfbApprox < 0) return;

    const snapshot: Snapshot = {
      batch,
      metric: 'TTFB',
      value: ttfbApprox,
      path: window.location.pathname,
      capturedAt: new Date().toISOString()
    };

    saveSnapshot(snapshot);
  }, [batch]);

  return null;
}
