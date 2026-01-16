'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Navigation,
  Phone,
  MapPin,
  Banknote,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  ChevronRight,
  AlertCircle,
  Package,
} from 'lucide-react';
import clsx from 'clsx';
import api from '@/lib/api';

interface Stop {
  id: number;
  sequence: number;
  status: string;
  order_id: number;
  external_order_id: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  delivery_city: string;
  latitude: number;
  longitude: number;
  is_cod: boolean;
  cod_amount: number;
  package_description: string;
  special_instructions: string;
  order_status: string;
}

export default function RiderDashboardPage() {
  const queryClient = useQueryClient();
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['rider-active-route'],
    queryFn: () => api.getRiderActiveRoute(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Update location periodically
  useEffect(() => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          api.updateRiderLocation(
            position.coords.latitude,
            position.coords.longitude
          ).catch(() => {});
        },
        () => {},
        { enableHighAccuracy: true, timeout: 10000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  const handleNavigate = (stop: Stop) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${stop.latitude},${stop.longitude}`;
    window.open(url, '_blank');
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-900">Error loading route</h2>
        <p className="text-gray-500 mb-4">Please try again</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  const route = data?.route;
  const stops = data?.stops || [];
  const nextStop = data?.next_stop;

  // No active route
  if (!route) {
    return (
      <div className="p-6 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Package className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Active Route</h2>
        <p className="text-gray-500 mb-6">
          You don't have any assigned deliveries yet. Check back later or contact your dispatcher.
        </p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>
    );
  }

  const completedCount = stops.filter((s: Stop) => s.status === 'completed').length;
  const failedCount = stops.filter((s: Stop) => s.status === 'failed').length;
  const progress = ((completedCount + failedCount) / stops.length) * 100;

  return (
    <div className="pb-4">
      {/* Route Summary Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold">{route.name}</h2>
            <p className="text-blue-200 text-sm">
              {new Date(route.route_date).toLocaleDateString('en-GB', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="p-2 bg-blue-500/30 rounded-lg hover:bg-blue-500/50 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span className="font-semibold">
              {completedCount + failedCount}/{stops.length} stops
            </span>
          </div>
          <div className="h-2 bg-blue-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-blue-500/30 rounded-lg p-2">
            <p className="text-2xl font-bold">{completedCount}</p>
            <p className="text-xs text-blue-200">Delivered</p>
          </div>
          <div className="bg-blue-500/30 rounded-lg p-2">
            <p className="text-2xl font-bold">{stops.length - completedCount - failedCount}</p>
            <p className="text-xs text-blue-200">Pending</p>
          </div>
          <div className="bg-blue-500/30 rounded-lg p-2">
            <p className="text-2xl font-bold">GHS {route.total_cod_collected}</p>
            <p className="text-xs text-blue-200">COD Collected</p>
          </div>
        </div>
      </div>

      {/* Next Stop Highlight */}
      {nextStop && (
        <div className="mx-4 -mt-4">
          <Link
            href={`/rider/delivery/${nextStop.id}`}
            className="block bg-white rounded-xl shadow-lg border-2 border-blue-500 p-4"
          >
            <div className="flex items-center gap-2 text-blue-600 text-sm font-medium mb-2">
              <Navigation className="w-4 h-4" />
              NEXT DELIVERY
            </div>
            <h3 className="font-bold text-gray-900 text-lg">{nextStop.customer_name}</h3>
            <p className="text-gray-600 text-sm mt-1">{nextStop.delivery_address}</p>
            {nextStop.is_cod && (
              <div className="mt-3 flex items-center gap-2 text-green-600 font-semibold">
                <Banknote className="w-5 h-5" />
                Collect GHS {nextStop.cod_amount}
              </div>
            )}
            <div className="mt-3 flex gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigate(nextStop);
                }}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <Navigation className="w-5 h-5" />
                Navigate
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleCall(nextStop.customer_phone);
                }}
                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg"
              >
                <Phone className="w-5 h-5" />
              </button>
            </div>
          </Link>
        </div>
      )}

      {/* All Stops List */}
      <div className="mt-6 px-4">
        <h3 className="font-semibold text-gray-900 mb-3">All Stops ({stops.length})</h3>
        <div className="space-y-3">
          {stops.map((stop: Stop) => (
            <Link
              key={stop.id}
              href={`/rider/delivery/${stop.id}`}
              className={clsx(
                'block bg-white rounded-xl p-4 shadow-sm border transition-all',
                stop.status === 'completed' && 'border-green-200 bg-green-50/50',
                stop.status === 'failed' && 'border-red-200 bg-red-50/50',
                stop.status === 'pending' && 'border-gray-200 hover:border-blue-300'
              )}
            >
              <div className="flex items-start gap-3">
                {/* Sequence Badge */}
                <div
                  className={clsx(
                    'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0',
                    stop.status === 'completed' && 'bg-green-100 text-green-700',
                    stop.status === 'failed' && 'bg-red-100 text-red-700',
                    stop.status === 'pending' && 'bg-blue-100 text-blue-700'
                  )}
                >
                  {stop.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : stop.status === 'failed' ? (
                    <XCircle className="w-5 h-5" />
                  ) : (
                    stop.sequence
                  )}
                </div>

                {/* Stop Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {stop.customer_name}
                    </h4>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>
                  <p className="text-sm text-gray-500 truncate mt-0.5">
                    {stop.delivery_address}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    {stop.is_cod && (
                      <span className="text-sm font-medium text-green-600">
                        GHS {stop.cod_amount}
                      </span>
                    )}
                    <span
                      className={clsx(
                        'text-xs font-medium px-2 py-0.5 rounded-full',
                        stop.status === 'completed' && 'bg-green-100 text-green-700',
                        stop.status === 'failed' && 'bg-red-100 text-red-700',
                        stop.status === 'pending' && 'bg-gray-100 text-gray-600'
                      )}
                    >
                      {stop.status.charAt(0).toUpperCase() + stop.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
