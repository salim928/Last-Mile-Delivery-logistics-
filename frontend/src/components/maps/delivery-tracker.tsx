'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface DeliveryTrackerProps {
  riderLocation?:  { lat: number; lng: number };
  destinationLocation:  { lat: number; lng: number; address:  string };
  estimatedArrival?: string;
  height?: string;
}

export function DeliveryTracker({
  riderLocation,
  destinationLocation,
  estimatedArrival,
  height = '300px',
}: DeliveryTrackerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L. Map | null>(null);
  const riderMarkerRef = useRef<L. Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView(
      [destinationLocation.lat, destinationLocation.lng],
      14
    );
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // Add destination marker
    const destIcon = L.divIcon({
      html: `
        <div class="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white">
          📍
        </div>
      `,
      className: 'custom-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    L.marker([destinationLocation.lat, destinationLocation.lng], { icon: destIcon })
      .bindPopup(`<b>Delivery Location</b><br/>${destinationLocation.address}`)
      .addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [destinationLocation]);

  // Update rider location
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !riderLocation) return;

    const riderIcon = L.divIcon({
      html: `
        <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white animate-pulse">
          🏍️
        </div>
      `,
      className: 'custom-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    if (riderMarkerRef.current) {
      riderMarkerRef.current.setLatLng([riderLocation. lat, riderLocation.lng]);
    } else {
      riderMarkerRef.current = L.marker([riderLocation.lat, riderLocation.lng], {
        icon: riderIcon,
      })
        .bindPopup('Your rider is here!')
        .addTo(map);
    }

    // Fit both markers in view
    const bounds = L.latLngBounds(
      [riderLocation.lat, riderLocation.lng],
      [destinationLocation.lat, destinationLocation.lng]
    );
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [riderLocation, destinationLocation]);

  return (
    <div className="relative">
      <div
        ref={mapRef}
        style={{ height, width: '100%' }}
        className="rounded-lg overflow-hidden border border-gray-200"
      />
      {estimatedArrival && (
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-3">
          <p className="text-sm text-gray-500">Estimated arrival</p>
          <p className="text-lg font-bold text-gray-900">{estimatedArrival}</p>
        </div>
      )}
    </div>
  );
}