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
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={12}
      scrollWheelZoom={false}
      className={className}
      style={{ height: `${height}px`, width: '100%', borderRadius: '16px' }}
    >
      <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[lat, lng]} />
    </MapContainer>
  );
}
