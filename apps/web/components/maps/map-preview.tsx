'use client';

import dynamic from 'next/dynamic';

const MapClient = dynamic(() => import('./map-preview.client'), { ssr: false });

export function MapPreview({ lat, lng }: { lat: number; lng: number }) {
  return <MapClient lat={lat} lng={lng} />;
}
