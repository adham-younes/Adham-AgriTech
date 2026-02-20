'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

const NdviChartCore = dynamic(() => import('./ndvi-chart-core').then((module) => module.NdviChartCore), {
  ssr: false,
  loading: () => <div className="h-56 w-full animate-pulse rounded-2xl bg-white/5" />
});

export function NdviChart({ data }: { data: Array<{ date: string; value: number }> }) {
  const [shouldRender, setShouldRender] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px 0px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div ref={containerRef}>{shouldRender ? <NdviChartCore data={data} /> : <div className="h-56 w-full rounded-2xl bg-white/5" />}</div>;
}
