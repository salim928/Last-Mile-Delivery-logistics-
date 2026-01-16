'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Package,
  Route,
  TrendingDown,
  TrendingUp,
  Fuel,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  ArrowRight,
  Wallet,
  AlertTriangle,
  MapPin,
  Loader2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import clsx from 'clsx';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { StatsCard, StatsCardGradient } from '@/components/ui/stats-card';
import { StatusBadge } from '@/components/ui/data-table';

export default function DashboardPage() {
  const { merchant } = useAuthStore();

  const { data: savingsReport, isLoading: loadingReport } = useQuery({
    queryKey: ['savings-report'],
    queryFn: () => api.getSavingsReport(),
  });

  const { data: todayOrders, isLoading: loadingOrders } = useQuery({
    queryKey: ['today-orders'],
    queryFn: () => api.getOrders({ date: new Date().toISOString().split('T')[0] }),
  });

  const { data: riders } = useQuery({
    queryKey: ['riders'],
    queryFn: () => api.getRiders(),
  });

  const { data: pendingOrders } = useQuery({
    queryKey: ['pending-orders'],
    queryFn: () => api.getOrders({ status: 'pending' }),
  });

  // Calculate quick stats
  const activeRiders = riders?.filter((r: any) => r.status === 'on_route').length || 0;
  const availableRiders = riders?.filter((r: any) => r.status === 'available').length || 0;
  const pendingCount = pendingOrders?.length || 0;

  // Pie chart data for delivery status
  const deliveryStatusData = savingsReport ? [
    { name: 'Delivered', value: savingsReport.summary?.successful_deliveries || 0, color: '#22c55e' },
    { name: 'Failed', value: savingsReport.summary?.failed_deliveries || 0, color: '#ef4444' },
    { name: 'Pending', value: pendingCount, color: '#f59e0b' },
  ] : [];

  const isLoading = loadingReport || loadingOrders;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-navy-600 mx-auto mb-3" />
          <p className="text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {merchant?.business_name}! 👋
          </h1>
          <p className="text-slate-600 mt-1">
            Here's what's happening with your deliveries today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/orders" className="btn-secondary">
            <Package className="w-4 h-4" />
            View Orders
          </Link>
          <Link href="/dashboard/routes" className="btn-primary">
            <Route className="w-4 h-4" />
            Create Route
          </Link>
        </div>
      </div>

      {/* Key Metrics - Gradient Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCardGradient
          title="Distance Saved"
          value={`${savingsReport?.distance_savings?.saved_percent || 0}%`}
          subtitle={`${savingsReport?.distance_savings?.saved_km || 0} km saved`}
          icon={TrendingDown}
          gradient="blue"
        />
        <StatsCardGradient
          title="Fuel Cost Saved"
          value={`GHS ${savingsReport?.cost_savings?.fuel_cost_saved || 0}`}
          subtitle="This period"
          icon={Fuel}
          gradient="green"
        />
        <StatsCardGradient
          title="Time Saved"
          value={`${savingsReport?.time_savings?.saved_percent || 0}%`}
          subtitle={`${Math.round(savingsReport?.time_savings?.saved_minutes || 0)} minutes`}
          icon={Clock}
          gradient="purple"
        />
        <StatsCardGradient
          title="Success Rate"
          value={`${savingsReport?.summary?.success_rate_percent || 0}%`}
          subtitle={`${savingsReport?.summary?.successful_deliveries || 0} delivered`}
          icon={CheckCircle2}
          gradient="orange"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Deliveries"
          value={savingsReport?.summary?.total_deliveries || 0}
          icon={Package}
          variant="primary"
        />
        <StatsCard
          title="Pending Orders"
          value={pendingCount}
          subtitle="Need to be routed"
          icon={Clock}
          variant={pendingCount > 10 ? 'warning' : 'default'}
        />
        <StatsCard
          title="Active Riders"
          value={`${activeRiders} / ${riders?.length || 0}`}
          subtitle={`${availableRiders} available`}
          icon={Users}
          variant="success"
        />
        <StatsCard
          title="Failed Deliveries"
          value={savingsReport?.summary?.failed_deliveries || 0}
          icon={XCircle}
          variant={(savingsReport?.summary?.failed_deliveries || 0) > 0 ? 'error' : 'default'}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Savings Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-soft p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Savings Trend</h3>
              <p className="text-sm text-slate-500">Distance saved over the last 30 days</p>
            </div>
            <Link href="/dashboard/reports" className="text-sm text-navy-600 hover:text-navy-700 font-medium flex items-center gap-1">
              View Report <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="h-72">
            {savingsReport?.daily_breakdown && savingsReport.daily_breakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={savingsReport.daily_breakdown}>
                  <defs>
                    <linearGradient id="colorSaved" x1="0" y1="0" x2="0" y2="1">
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
                    formatter={(value: number) => [`${value.toFixed(1)} km`, 'Distance Saved']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Area
                    type="monotone"
                    dataKey="distance_saved_km"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#colorSaved)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No data yet. Complete some deliveries to see trends.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delivery Status Pie Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-soft p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Delivery Status</h3>
          <p className="text-sm text-slate-500 mb-4">Current period breakdown</p>
          
          <div className="h-48">
            {deliveryStatusData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deliveryStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {deliveryStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-slate-400">No delivery data</p>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="space-y-2 mt-4">
            {deliveryStatusData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-slate-600">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-soft p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/dashboard/orders"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-navy-300 hover:bg-navy-50 transition-colors group"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-slate-700">Add Order</span>
            </Link>
            <Link
              href="/dashboard/routes"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-navy-300 hover:bg-navy-50 transition-colors group"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Route className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-slate-700">Create Route</span>
            </Link>
            <Link
              href="/dashboard/riders"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-navy-300 hover:bg-navy-50 transition-colors group"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm font-medium text-slate-700">Manage Riders</span>
            </Link>
            <Link
              href="/dashboard/cod"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-navy-300 hover:bg-navy-50 transition-colors group"
            >
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                <Wallet className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-sm font-medium text-slate-700">COD Report</span>
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-soft p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Recent Orders</h3>
            <Link href="/dashboard/orders" className="text-sm text-navy-600 hover:text-navy-700 font-medium">
              View All
            </Link>
          </div>
          
          {todayOrders && todayOrders.length > 0 ? (
            <div className="space-y-3">
              {todayOrders.slice(0, 5).map((order: any) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                      <Package className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{order.customer_name}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {order.delivery_address?.slice(0, 30)}...
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No orders today</p>
              <Link href="/dashboard/orders" className="text-sm text-navy-600 hover:text-navy-700 font-medium mt-2 inline-block">
                Add your first order
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Alerts Section */}
      {(pendingCount > 10 || (savingsReport?.summary?.failed_deliveries || 0) > 0) && (
        <div className="space-y-3">
          {pendingCount > 10 && (
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-amber-800">
                  You have {pendingCount} pending orders
                </p>
                <p className="text-sm text-amber-600">
                  Create a route to optimize deliveries and reduce fuel costs.
                </p>
              </div>
              <Link href="/dashboard/routes" className="btn-primary text-sm">
                Create Route
              </Link>
            </div>
          )}
          {(savingsReport?.summary?.failed_deliveries || 0) > 0 && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-red-800">
                  {savingsReport?.summary?.failed_deliveries} failed deliveries
                </p>
                <p className="text-sm text-red-600">
                  Review failed orders and reschedule or contact customers.
                </p>
              </div>
              <Link href="/dashboard/orders?status=failed" className="btn-secondary text-sm">
                View Failed
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}