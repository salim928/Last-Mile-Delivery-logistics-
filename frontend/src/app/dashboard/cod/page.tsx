'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Wallet,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  User,
  Calendar,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import clsx from 'clsx';
import api from '@/lib/api';
import { StatsCardGradient, StatsCard } from '@/components/ui/stats-card';
import { StatusBadge } from '@/components/ui/data-table';

export default function CODPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: dailyReport, isLoading: loadingDaily, refetch } = useQuery({
    queryKey: ['cod-daily', selectedDate],
    queryFn: () => api.getDailyCODReport(selectedDate),
  });

  const { data: discrepancies, isLoading: loadingDiscrepancies } = useQuery({
    queryKey: ['cod-discrepancies'],
    queryFn: () => api.getCODDiscrepancies(5),
  });

  // Navigate between dates
  const navigateDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const isLoading = loadingDaily || loadingDiscrepancies;

  // Format date for display
  const formattedDate = useMemo(() => {
    const date = new Date(selectedDate);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (selectedDate === today.toISOString().split('T')[0]) return 'Today';
    if (selectedDate === yesterday.toISOString().split('T')[0]) return 'Yesterday';
    return date.toLocaleDateString('en-GH', { weekday: 'long', month: 'short', day: 'numeric' });
  }, [selectedDate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-navy-600 mx-auto mb-3" />
          <p className="text-slate-500">Loading COD report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">COD Reconciliation</h1>
          <p className="text-slate-600 mt-1">Track and reconcile cash-on-delivery collections</p>
        </div>
        <button
          onClick={() => refetch()}
          className="btn-secondary"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Date selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-navy-100 rounded-lg">
              <Calendar className="w-5 h-5 text-navy-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Viewing report for</p>
              <p className="font-semibold text-slate-900">{formattedDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateDate(-1)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <input
              type="date"
              className="input w-auto"
              value={selectedDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <button
              onClick={() => navigateDate(1)}
              disabled={selectedDate >= new Date().toISOString().split('T')[0]}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Daily summary - Gradient Cards */}
      {dailyReport && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCardGradient
            title="Total Expected"
            value={`GHS ${(dailyReport.total_expected || 0).toLocaleString()}`}
            subtitle={`${dailyReport.total_cod_orders || 0} COD orders`}
            icon={Wallet}
            gradient="blue"
          />
          <StatsCardGradient
            title="Total Collected"
            value={`GHS ${(dailyReport.total_collected || 0).toLocaleString()}`}
            subtitle="Verified collections"
            icon={CheckCircle2}
            gradient="green"
          />
          <StatsCardGradient
            title="Pending Collection"
            value={`GHS ${(dailyReport.total_pending || 0).toLocaleString()}`}
            subtitle="Awaiting delivery"
            icon={Clock}
            gradient="orange"
          />
          <StatsCardGradient
            title="Collection Rate"
            value={`${dailyReport.collection_rate_percent || 0}%`}
            subtitle="Of delivered orders"
            icon={TrendingUp}
            gradient="purple"
          />
        </div>
      )}

      {/* Discrepancy alert */}
      {dailyReport?.discrepancy !== 0 && dailyReport?.discrepancy !== undefined && (
        <div
          className={clsx(
            'flex items-center gap-4 p-5 rounded-xl border',
            dailyReport.discrepancy > 0 
              ? 'bg-red-50 border-red-200' 
              : 'bg-green-50 border-green-200'
          )}
        >
          <div className={clsx(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            dailyReport.discrepancy > 0 ? 'bg-red-100' : 'bg-green-100'
          )}>
            {dailyReport.discrepancy > 0 ? (
              <ArrowDownRight className="w-6 h-6 text-red-600" />
            ) : (
              <ArrowUpRight className="w-6 h-6 text-green-600" />
            )}
          </div>
          <div className="flex-1">
            <p className={clsx('font-semibold', dailyReport.discrepancy > 0 ? 'text-red-800' : 'text-green-800')}>
              {dailyReport.discrepancy > 0 ? 'Collection Shortfall' : 'Over-collection'} Detected
            </p>
            <p className={clsx('text-sm', dailyReport.discrepancy > 0 ? 'text-red-600' : 'text-green-600')}>
              GHS {Math.abs(dailyReport.discrepancy).toLocaleString()} difference from expected amount
            </p>
          </div>
          <div className={clsx(
            'text-2xl font-bold',
            dailyReport.discrepancy > 0 ? 'text-red-600' : 'text-green-600'
          )}>
            {dailyReport.discrepancy > 0 ? '-' : '+'}GHS {Math.abs(dailyReport.discrepancy).toLocaleString()}
          </div>
        </div>
      )}

      {/* Mismatched orders table */}
      {dailyReport?.mismatched_orders && dailyReport.mismatched_orders.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-soft overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Orders with COD Mismatch</h3>
                <p className="text-sm text-slate-500">{dailyReport.mismatched_orders.length} order(s) require attention</p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-slate-500 text-sm">Order ID</th>
                  <th className="text-left py-4 px-6 font-medium text-slate-500 text-sm">Customer</th>
                  <th className="text-right py-4 px-6 font-medium text-slate-500 text-sm">Expected</th>
                  <th className="text-right py-4 px-6 font-medium text-slate-500 text-sm">Collected</th>
                  <th className="text-right py-4 px-6 font-medium text-slate-500 text-sm">Difference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dailyReport.mismatched_orders.map((order: any) => (
                  <tr key={order.order_id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-semibold text-slate-900">
                        #{order.external_order_id || order.order_id}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600">{order.customer_name}</td>
                    <td className="py-4 px-6 text-right text-slate-600 font-medium">
                      GHS {(order.expected || 0).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-right text-slate-600 font-medium">
                      GHS {(order.collected || 0).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className={clsx(
                        'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold text-sm',
                        order.difference > 0 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-green-100 text-green-700'
                      )}>
                        {order.difference > 0 ? (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        )}
                        GHS {Math.abs(order.difference || 0).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Flagged routes */}
      {discrepancies?.flagged_routes && discrepancies.flagged_routes.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-soft p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Routes with Significant Discrepancies</h3>
              <p className="text-sm text-slate-500">Routes with &gt;5% collection shortfall</p>
            </div>
          </div>
          <div className="space-y-3">
            {discrepancies.flagged_routes.slice(0, 5).map((route: any) => (
              <div
                key={route.route_id}
                className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-red-600">#{route.route_id}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Route #{route.route_id}</p>
                    <p className="text-sm text-slate-500">{route.route_date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600 text-lg">{route.discrepancy_percent}%</p>
                  <p className="text-sm text-slate-500">GHS {route.discrepancy} missing</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No data state */}
      {(!dailyReport?.mismatched_orders || dailyReport.mismatched_orders.length === 0) && 
       (!discrepancies?.flagged_routes || discrepancies.flagged_routes.length === 0) && (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-soft p-12 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">All Clear!</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            No COD discrepancies found for {formattedDate}. All collections match expected amounts.
          </p>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-soft p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Daily Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-500">Total COD Orders</p>
              <p className="text-2xl font-bold text-slate-900">{dailyReport?.total_cod_orders || 0}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-500">Orders with Mismatches</p>
              <p className="text-2xl font-bold text-slate-900">{dailyReport?.mismatched_orders?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-soft p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Collection Progress</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-500">Collection Progress</span>
                <span className="font-semibold text-slate-900">{dailyReport?.collection_rate_percent || 0}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${dailyReport?.collection_rate_percent || 0}%` }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Outstanding Amount</span>
              <span className="font-semibold text-amber-600">
                GHS {(dailyReport?.total_pending || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}