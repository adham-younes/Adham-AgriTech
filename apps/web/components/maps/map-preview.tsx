'use client';

import dynamic from 'next/dynamic';

const MapClient = dynamic(() => import('./map-preview.client'), { ssr: false });

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
  return <MapClient lat={lat} lng={lng} height={height} className={className} />;
}
