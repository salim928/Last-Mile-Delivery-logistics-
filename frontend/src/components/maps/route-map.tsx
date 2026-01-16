'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface RouteStop {
  id: number;
  sequence: number;
  latitude: number;
  longitude: number;
  address: string;
  customer_name?:  string;
  is_cod?: boolean;
  cod_amount?: number;
}

interface RouteMapProps {
  stops: RouteStop[];
  startLocation?:  { lat: number; lng: number; address?:  string };
  height?: string;
  showRoute?: boolean;
}

export function RouteMap({
  stops,
  startLocation,
  height = '400px',
  showRoute = true,
}: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map centered on Accra
    const map = L. map(mapRef.current).setView([5.6037, -0.1870], 12);
    mapInstanceRef.current = map;

    // Add OpenStreetMap tiles (FREE)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers and routes
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    // Re-add tile layer if removed
    const hasBaseLayer = Array.from((map as any)._layers).some(
      (layer:  any) => layer instanceof L.TileLayer
    );
    if (!hasBaseLayer) {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);
    }

    const bounds:  L.LatLngBoundsExpression = [];
    const routePoints: L.LatLngExpression[] = [];

    // Add start location marker
    if (startLocation) {
      const startIcon = L.divIcon({
        html: `
          <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg border-2 border-white">
            S
          </div>
        `,
        className: 'custom-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([startLocation.lat, startLocation.lng], { icon: startIcon })
        .bindPopup(`<b>Start: </b> ${startLocation.address || 'Depot'}`)
        .addTo(map);

      bounds.push([startLocation. lat, startLocation.lng]);
      routePoints.push([startLocation.lat, startLocation.lng]);
    }

    // Add stop markers
    stops.forEach((stop) => {
      const stopIcon = L.divIcon({
        html: `
          <div class="w-8 h-8 ${stop.is_cod ? 'bg-orange-500' : 'bg-blue-500'} rounded-full flex items-center justify-center text-white font-bold shadow-lg border-2 border-white">
            ${stop.sequence}
          </div>
        `,
        className: 'custom-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const popupContent = `
        <div class="min-w-[200px]">
          <p class="font-bold text-gray-900">#${stop.sequence} ${stop.customer_name || 'Customer'}</p>
          <p class="text-sm text-gray-600">${stop.address}</p>
          ${stop.is_cod ? `<p class="text-sm font-medium text-orange-600 mt-1">COD:  GHS ${stop.cod_amount}</p>` : ''}
        </div>
      `;

      L.marker([stop.latitude, stop.longitude], { icon: stopIcon })
        .bindPopup(popupContent)
        .addTo(map);

      bounds.push([stop.latitude, stop.longitude]);
      routePoints.push([stop.latitude, stop.longitude]);
    });

    // Draw route line
    if (showRoute && routePoints.length > 1) {
      L.polyline(routePoints, {
        color: '#3b82f6',
        weight: 4,
        opacity: 0.8,
        dashArray: '10, 10',
      }).addTo(map);
    }

    // Fit bounds
    if (bounds.length > 0) {
      map.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [50, 50] });
    }
  }, [stops, startLocation, showRoute]);

  return (
    <div
      ref={mapRef}
      style={{ height, width: '100%' }}
      className="rounded-lg overflow-hidden border border-gray-200"
    />
  );
}