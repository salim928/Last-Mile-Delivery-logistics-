'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  Package,
  Banknote,
  Loader2,
  ChevronRight,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import api from '@/lib/api';

export default function RiderHistoryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['rider-history'],
    queryFn: () => api.getRiderHistory(),
  });

  const history = data?.history || [];

  // Calculate totals
  const totalDeliveries = history.reduce((sum: number, r: any) => sum + r.total_stops, 0);
  const totalCOD = history.reduce((sum: number, r: any) => sum + r.cod_collected, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="pb-4">
      {/* Stats Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5">
        <h1 className="text-xl font-bold mb-4">Delivery History</h1>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-500/30 rounded-xl p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-1 opacity-80" />
            <p className="text-3xl font-bold">{totalDeliveries}</p>
            <p className="text-sm text-blue-200">Total Deliveries</p>
          </div>
          <div className="bg-blue-500/30 rounded-xl p-4 text-center">
            <Banknote className="w-6 h-6 mx-auto mb-1 opacity-80" />
            <p className="text-3xl font-bold">GHS {totalCOD.toFixed(0)}</p>
            <p className="text-sm text-blue-200">COD Collected</p>
          </div>
        </div>
        <p className="text-sm text-blue-200 mt-3 text-center">Last 30 days</p>
      </div>

      {/* History List */}
      <div className="px-4 mt-4">
        {history.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No History Yet</h3>
            <p className="text-gray-500">Your completed routes will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((route: any) => (
              <div
                key={route.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{route.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(route.route_date).toLocaleDateString('en-GB', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Completed</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {route.total_stops} deliveries
                      </span>
                    </div>
                    {route.cod_collected > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Banknote className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-green-600">
                          GHS {route.cod_collected}
                        </span>
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
