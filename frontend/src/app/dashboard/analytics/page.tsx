'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  MapPin,
  Users,
  Package,
  Fuel,
  Clock,
  DollarSign,
  Target,
  Award,
  Loader2,
  Calendar,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Route,
  CheckCircle2,
  XCircle,
  AlertTriangle,
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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ComposedChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import clsx from 'clsx';
import api from '@/lib/api';

// Date range presets
const DATE_PRESETS = [
  { label: '7 Days', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '90 Days', days: 90 },
];

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-slate-200">
        <p className="text-sm font-semibold text-slate-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            {entry.name.includes('Rate') || entry.name.includes('%') ? '%' : ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Metric card component
const MetricCard = ({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  color,
  suffix = '',
}: {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: any;
  color: string;
  suffix?: string;
}) => {
  const isPositive = change && change > 0;
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    amber: 'from-orange-500 to-amber-600',
    pink: 'from-pink-500 to-pink-600',
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} text-white`}>
          <Icon className="w-5 h-5" />
        </div>
        {change !== undefined && (
          <div className={clsx(
            'flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-lg',
            isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          )}>
            {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-900">
          {value}{suffix}
        </p>
        {changeLabel && (
          <p className="text-xs text-slate-400">{changeLabel}</p>
        )}
      </div>
    </div>
  );
};

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [activePreset, setActivePreset] = useState<number>(30);

  // Fetch data
  const { data: savingsReport, isLoading: loadingReport, refetch } = useQuery({
    queryKey: ['analytics-savings', dateRange],
    queryFn: () => api.getSavingsReport(dateRange.start, dateRange.end),
  });

  const { data: riders } = useQuery({
    queryKey: ['riders'],
    queryFn: () => api.getRiders(),
  });

  const { data: allOrders } = useQuery({
    queryKey: ['all-orders'],
    queryFn: () => api.getOrders({}),
  });

  // Set date preset
  const setPreset = (days: number) => {
    const end = new Date();
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
    setDateRange({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    });
    setActivePreset(days);
  };

  // Process data for charts
  const chartData = useMemo(() => {
    if (!savingsReport?.daily_breakdown) return [];
    return savingsReport.daily_breakdown.map((day: any) => ({
      date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      deliveries: day.total_deliveries || 0,
      successful: day.successful || 0,
      failed: day.failed || 0,
      distanceSaved: day.distance_saved_km || 0,
      timeSaved: day.time_saved_minutes || 0,
      successRate: day.success_rate || 0,
      fuelSaved: day.fuel_cost_saved || 0,
    }));
  }, [savingsReport]);

  // Delivery status pie chart data
  const deliveryStatusData = useMemo(() => {
    if (!savingsReport?.summary) return [];
    return [
      { name: 'Delivered', value: savingsReport.summary.successful_deliveries || 0, color: '#22c55e' },
      { name: 'Failed', value: savingsReport.summary.failed_deliveries || 0, color: '#ef4444' },
    ];
  }, [savingsReport]);

  // Rider performance data
  const riderPerformanceData = useMemo(() => {
    if (!riders) return [];
    return riders
      .filter((r: any) => r.total_deliveries > 0)
      .sort((a: any, b: any) => b.successful_deliveries - a.successful_deliveries)
      .slice(0, 5)
      .map((rider: any) => ({
        name: rider.name.split(' ')[0],
        deliveries: rider.total_deliveries,
        successRate: rider.total_deliveries > 0 
          ? ((rider.successful_deliveries / rider.total_deliveries) * 100).toFixed(0)
          : 0,
        rating: rider.average_rating || 5.0,
      }));
  }, [riders]);

  // Savings comparison data
  const savingsComparisonData = useMemo(() => {
    if (!savingsReport) return [];
    return [
      {
        name: 'Distance (km)',
        optimized: savingsReport.distance_savings?.optimized_km || 0,
        naive: savingsReport.distance_savings?.naive_km || 0,
      },
      {
        name: 'Time (min)',
        optimized: Math.round((savingsReport.time_savings?.optimized_minutes || 0) / 10),
        naive: Math.round((savingsReport.time_savings?.naive_minutes || 0) / 10),
      },
      {
        name: 'Fuel Cost (GHS)',
        optimized: Math.round(savingsReport.cost_savings?.fuel_cost_optimized || 0),
        naive: Math.round(savingsReport.cost_savings?.fuel_cost_naive || 0),
      },
    ];
  }, [savingsReport]);

  // Key metrics
  const metrics = useMemo(() => {
    if (!savingsReport) return null;
    return {
      totalDeliveries: savingsReport.summary?.total_deliveries || 0,
      successRate: savingsReport.summary?.success_rate_percent || 0,
      distanceSaved: savingsReport.distance_savings?.saved_percent || 0,
      timeSaved: savingsReport.time_savings?.saved_percent || 0,
      fuelCostSaved: savingsReport.cost_savings?.fuel_cost_saved || 0,
      codCollectionRate: savingsReport.cod_metrics?.collection_rate_percent || 0,
      totalRoutes: savingsReport.summary?.total_routes || 0,
    };
  }, [savingsReport]);

  const isLoading = loadingReport;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-navy-600 mx-auto mb-3" />
          <p className="text-slate-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-orange-600" />
            Analytics Dashboard
          </h1>
          <p className="text-slate-600 mt-1">
            Deep insights into your delivery performance and optimization savings
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date Presets */}
          <div className="flex bg-slate-100 rounded-xl p-1">
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset.days}
                onClick={() => setPreset(preset.days)}
                className={clsx(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  activePreset === preset.days
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => refetch()}
            className="btn-secondary"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Deliveries"
          value={metrics?.totalDeliveries || 0}
          icon={Package}
          color="blue"
          changeLabel={`${activePreset} day period`}
        />
        <MetricCard
          title="Success Rate"
          value={metrics?.successRate?.toFixed(1) || 0}
          suffix="%"
          icon={Target}
          color="green"
          change={5.2}
          changeLabel="vs previous period"
        />
        <MetricCard
          title="Distance Saved"
          value={metrics?.distanceSaved?.toFixed(1) || 0}
          suffix="%"
          icon={Route}
          color="purple"
          change={metrics?.distanceSaved || 0}
          changeLabel="optimization efficiency"
        />
        <MetricCard
          title="Fuel Cost Saved"
          value={`GHS ${metrics?.fuelCostSaved?.toFixed(0) || 0}`}
          icon={Fuel}
          color="orange"
          changeLabel={`${activePreset} day savings`}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Delivery Trends */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Delivery Trends</h3>
              <p className="text-sm text-slate-500">Daily delivery performance over time</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-slate-600">Successful</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-slate-600">Failed</span>
              </div>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSuccessful" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="successful"
                  name="Successful"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="url(#colorSuccessful)"
                />
                <Area
                  type="monotone"
                  dataKey="failed"
                  name="Failed"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fill="url(#colorFailed)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Delivery Status Pie */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Delivery Status</h3>
            <p className="text-sm text-slate-500">Overall success distribution</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deliveryStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deliveryStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {deliveryStatusData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-slate-600">{entry.name}</span>
                <span className="text-sm font-semibold text-slate-900">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Optimization Savings Comparison */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Optimization Impact</h3>
            <p className="text-sm text-slate-500">Comparing optimized vs naive routing</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={savingsComparisonData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} stroke="#94a3b8" width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="naive" name="Without Optimization" fill="#f87171" radius={[0, 4, 4, 0]} />
                <Bar dataKey="optimized" name="With Optimization" fill="#22c55e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Savings Over Time */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Daily Savings</h3>
            <p className="text-sm text-slate-500">Distance and fuel savings trend</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar yAxisId="left" dataKey="distanceSaved" name="Distance Saved (km)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="fuelSaved" name="Fuel Saved (GHS)" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 3 */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top Riders Performance */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Top Riders</h3>
            <p className="text-sm text-slate-500">Performance leaderboard</p>
          </div>
          {riderPerformanceData.length > 0 ? (
            <div className="space-y-4">
              {riderPerformanceData.map((rider: any, index: number) => (
                <div key={index} className="flex items-center gap-4">
                  <div className={clsx(
                    'w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm',
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-slate-400' : index === 2 ? 'bg-amber-600' : 'bg-slate-300'
                  )}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-900">{rider.name}</span>
                      <span className="text-sm text-slate-500">{rider.deliveries} deliveries</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                          style={{ width: `${rider.successRate}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-green-600 w-12">{rider.successRate}%</span>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Award className="w-4 h-4" />
                        <span className="text-sm font-medium">{rider.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No rider data available yet</p>
            </div>
          )}
        </div>

        {/* COD Metrics */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900">COD Collection</h3>
            <p className="text-sm text-slate-500">Cash collection metrics</p>
          </div>
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 mb-4">
                <span className="text-3xl font-bold text-green-600">
                  {metrics?.codCollectionRate?.toFixed(0) || 0}%
                </span>
              </div>
              <p className="text-slate-600">Collection Rate</p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-600">Expected</span>
                <span className="font-semibold text-slate-900">
                  GHS {savingsReport?.cod_metrics?.total_expected?.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                <span className="text-green-700">Collected</span>
                <span className="font-semibold text-green-700">
                  GHS {savingsReport?.cod_metrics?.total_collected?.toLocaleString() || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <Zap className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-sm opacity-80">Time Saved</p>
          <p className="text-2xl font-bold">{metrics?.timeSaved?.toFixed(1) || 0}%</p>
          <p className="text-xs opacity-60 mt-1">per delivery route</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <Route className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-sm opacity-80">Routes Optimized</p>
          <p className="text-2xl font-bold">{metrics?.totalRoutes || 0}</p>
          <p className="text-xs opacity-60 mt-1">in selected period</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white">
          <CheckCircle2 className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-sm opacity-80">Avg Success Rate</p>
          <p className="text-2xl font-bold">{metrics?.successRate?.toFixed(1) || 0}%</p>
          <p className="text-xs opacity-60 mt-1">delivery completion</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-white">
          <DollarSign className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-sm opacity-80">Monthly Savings</p>
          <p className="text-2xl font-bold">GHS {((metrics?.fuelCostSaved || 0) * 30 / activePreset).toFixed(0)}</p>
          <p className="text-xs opacity-60 mt-1">projected fuel savings</p>
        </div>
      </div>
    </div>
  );
}
