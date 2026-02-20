'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

const MapClient = dynamic(() => import('./map-preview.client'), {
  ssr: false,
  loading: () => <div className="w-full animate-pulse rounded-2xl bg-white/5" style={{ height: '100%' }} />
});

export function MapPreview({
  lat,
  lng,
  height = 280,
  className = ''
}: {
  lat: number;
  lng: number;
  height?: number;
  className?: string;
}) {
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
      { rootMargin: '240px 0px' }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ height: `${height}px`, width: '100%' }}>
      {shouldRender ? <MapClient lat={lat} lng={lng} height={height} className={className} /> : <div className="h-full w-full rounded-2xl bg-white/5" />}
    </div>
  );
}
