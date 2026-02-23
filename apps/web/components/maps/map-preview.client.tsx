'use client';

import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';

export default function MapPreviewClient({
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
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const mapboxStyleId = process.env.NEXT_PUBLIC_MAPBOX_STYLE_ID ?? 'mapbox/dark-v11';
  const hasMapbox = Boolean(mapboxToken);
  const tileUrl = hasMapbox
    ? `https://api.mapbox.com/styles/v1/${mapboxStyleId}/tiles/256/{z}/{x}/{y}@2x?access_token=${mapboxToken}`
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const attribution = hasMapbox
    ? '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; OpenStreetMap contributors'
    : '&copy; OpenStreetMap contributors';

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={12}
      scrollWheelZoom={false}
      className={className}
      style={{ height: `${height}px`, width: '100%', borderRadius: '16px' }}
    >
      <TileLayer attribution={attribution} url={tileUrl} />
      <Marker position={[lat, lng]} />
    </MapContainer>
  );
}
