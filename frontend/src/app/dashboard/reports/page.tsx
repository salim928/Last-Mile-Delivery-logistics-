'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  Download,
  TrendingDown,
  Clock,
  Fuel,
  CheckCircle2,
  DollarSign,
  Calendar,
  Loader2,
  BarChart3,
  ArrowRight,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import clsx from 'clsx';
import api from '@/lib/api';
import { StatsCardGradient, StatsCard } from '@/components/ui/stats-card';

// Quick range presets
const DATE_PRESETS = [
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'Last 90 Days', days: 90 },
];

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [activePreset, setActivePreset] = useState<number | null>(30);
  const [downloading, setDownloading] = useState(false);

  const { data: report, isLoading, refetch } = useQuery({
    queryKey: ['savings-report', dateRange],
    queryFn: () => api.getSavingsReport(dateRange.start, dateRange.end),
  });

  // Set date range from preset
  const setPreset = (days: number) => {
    const end = new Date();
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
    setDateRange({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    });
    setActivePreset(days);
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      const blob = await api.downloadSavingsReportPDF(dateRange.start, dateRange.end);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `savings_report_${dateRange.start}_${dateRange.end}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download PDF:', error);
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-navy-600 mx-auto mb-3" />
          <p className="text-slate-500">Loading report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ROI & Savings Report</h1>
          <p className="text-slate-600 mt-1">Track your delivery optimization performance and cost savings</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => refetch()}
            className="btn-secondary"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button 
            onClick={handleDownloadPDF} 
            disabled={downloading || !report}
            className="btn-primary"
          >
            {downloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Download PDF
          </button>
        </div>
      </div>

      {/* Date range selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-navy-100 rounded-lg">
              <Calendar className="w-5 h-5 text-navy-600" />
            </div>
            <span className="text-sm font-medium text-slate-600">Date Range</span>
          </div>
          
          {/* Preset buttons */}
          <div className="flex flex-wrap gap-2">
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset.days}
                onClick={() => setPreset(preset.days)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  activePreset === preset.days
                    ? 'bg-navy-100 text-navy-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2 ml-auto">
            <input
              type="date"
              className="input w-auto"
              value={dateRange.start}
              max={dateRange.end}
              onChange={(e) => {
                setDateRange({ ...dateRange, start: e.target.value });
                setActivePreset(null);
              }}
            />
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              className="input w-auto"
              value={dateRange.end}
              min={dateRange.start}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => {
                setDateRange({ ...dateRange, end: e.target.value });
                setActivePreset(null);
              }}
            />
          </div>
        </div>
      </div>

      {report ? (
        <>
          {/* Key metrics - Gradient cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCardGradient
              title="Distance Saved"
              value={`${report.distance_savings?.saved_percent || 0}%`}
              subtitle={`${report.distance_savings?.saved_km || 0} km total`}
              icon={TrendingDown}
              gradient="blue"
            />
            <StatsCardGradient
              title="Time Saved"
              value={`${report.time_savings?.saved_percent || 0}%`}
              subtitle={`${Math.round(report.time_savings?.saved_minutes || 0)} min total`}
              icon={Clock}
              gradient="purple"
            />
            <StatsCardGradient
              title="Fuel Cost Saved"
              value={`GHS ${report.cost_savings?.fuel_cost_saved || 0}`}
              subtitle="Total savings"
              icon={Fuel}
              gradient="green"
            />
            <StatsCardGradient
              title="Success Rate"
              value={`${report.summary?.success_rate_percent || 0}%`}
              subtitle={`${report.summary?.successful_deliveries || 0}/${report.summary?.total_deliveries || 0} deliveries`}
              icon={CheckCircle2}
              gradient="orange"
            />
          </div>

          {/* Savings chart */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-soft p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Daily Savings Trend</h3>
                <p className="text-sm text-slate-500">Distance saved over the selected period</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-slate-600">Distance Saved (km)</span>
              </div>
            </div>
            <div className="h-80">
              {report.daily_breakdown && report.daily_breakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={report.daily_breakdown}>
                    <defs>
                      <linearGradient id="colorSavedReport" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getDate()}/${date.getMonth() + 1}`;
                      }}
                    />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                      formatter={(value: number) => [`${value.toFixed(2)} km`, 'Distance Saved']}
                      labelFormatter={(label) => new Date(label).toLocaleDateString('en-GH', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    />
                    <Area
                      type="monotone"
                      dataKey="distance_saved_km"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorSavedReport)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No data available for this period</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comparison table */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-soft overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Optimization Comparison</h3>
              <p className="text-sm text-slate-500">Before vs after route optimization</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left py-4 px-6 font-medium text-slate-500 text-sm">Metric</th>
                    <th className="text-right py-4 px-6 font-medium text-slate-500 text-sm">Without Optimization</th>
                    <th className="text-right py-4 px-6 font-medium text-slate-500 text-sm">With Optimization</th>
                    <th className="text-right py-4 px-6 font-medium text-green-600 text-sm">Savings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <TrendingDown className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-medium text-slate-900">Total Distance</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right text-slate-600 font-medium">
                      {report.distance_savings?.naive_km || 0} km
                    </td>
                    <td className="py-4 px-6 text-right text-slate-600 font-medium">
                      {report.distance_savings?.optimized_km || 0} km
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-lg font-semibold text-sm">
                        {report.distance_savings?.saved_km || 0} km ({report.distance_savings?.saved_percent || 0}%)
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="font-medium text-slate-900">Total Time</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right text-slate-600 font-medium">
                      {Math.round(report.time_savings?.naive_minutes || 0)} min
                    </td>
                    <td className="py-4 px-6 text-right text-slate-600 font-medium">
                      {Math.round(report.time_savings?.optimized_minutes || 0)} min
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-lg font-semibold text-sm">
                        {Math.round(report.time_savings?.saved_minutes || 0)} min ({report.time_savings?.saved_percent || 0}%)
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <Fuel className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="font-medium text-slate-900">Fuel Cost</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right text-slate-600 font-medium">
                      GHS {report.cost_savings?.fuel_cost_naive || 0}
                    </td>
                    <td className="py-4 px-6 text-right text-slate-600 font-medium">
                      GHS {report.cost_savings?.fuel_cost_optimized || 0}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-lg font-semibold text-sm">
                        GHS {report.cost_savings?.fuel_cost_saved || 0}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* COD Summary */}
          {report.cod_metrics && (
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-soft p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Cash-On-Delivery Performance</h3>
                  <p className="text-sm text-slate-500">COD collection summary for this period</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-slate-50 rounded-xl">
                  <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="w-6 h-6 text-slate-600" />
                  </div>
                  <p className="text-sm text-slate-500 mb-1">Total Expected</p>
                  <p className="text-2xl font-bold text-slate-900">
                    GHS {(report.cod_metrics.total_expected || 0).toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-6 bg-green-50 rounded-xl">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-sm text-slate-500 mb-1">Total Collected</p>
                  <p className="text-2xl font-bold text-green-600">
                    GHS {(report.cod_metrics.total_collected || 0).toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-6 bg-blue-50 rounded-xl">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <TrendingDown className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-sm text-slate-500 mb-1">Collection Rate</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {report.cod_metrics.collection_rate_percent || 0}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-soft p-12 text-center">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Data Available</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            No report data available for the selected date range. Try adjusting the dates or complete some deliveries first.
          </p>
        </div>
      )}
    </div>
  );
}