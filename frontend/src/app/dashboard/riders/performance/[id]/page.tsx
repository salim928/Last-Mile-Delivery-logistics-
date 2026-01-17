'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  ArrowLeft,
  Star,
  TrendingUp,
  TrendingDown,
  Clock,
  Package,
  Navigation,
  Wallet,
  Award,
  Calendar,
  Phone,
  Target,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Bike,
  Truck
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';

// Metric Card Component
const MetricCard = ({ 
  icon: Icon, 
  label, 
  value, 
  subValue, 
  trend,
  color 
}: { 
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue?: string;
  trend?: { value: number; isPositive: boolean };
  color: string;
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
    <div className="flex items-start justify-between">
      <div className={`p-2 rounded-lg bg-gradient-to-br ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-sm ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {trend.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {trend.value}%
        </div>
      )}
    </div>
    <div className="mt-3">
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      {subValue && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subValue}</p>
      )}
    </div>
  </div>
);

// Performance Score Circle
const PerformanceScore = ({ score, label }: { score: number; label: string }) => {
  const circumference = 2 * Math.PI * 45;
  const progress = (score / 100) * circumference;
  
  const getColor = (score: number) => {
    if (score >= 90) return { stroke: '#10b981', bg: 'from-green-500 to-emerald-500' };
    if (score >= 75) return { stroke: '#f59e0b', bg: 'from-yellow-500 to-amber-500' };
    return { stroke: '#ef4444', bg: 'from-red-500 to-rose-500' };
  };
  
  const colors = getColor(score);
  
  return (
    <div className="text-center">
      <div className="relative inline-block">
        <svg className="w-28 h-28 transform -rotate-90">
          <circle
            cx="56"
            cy="56"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />
          <circle
            cx="56"
            cy="56"
            r="45"
            stroke={colors.stroke}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{score}</span>
        </div>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{label}</p>
    </div>
  );
};

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Main Component
export default function RiderPerformancePage() {
  const params = useParams();
  const router = useRouter();
  const riderId = params.id as string;

  // Fetch real rider data from API
  const { data: rider, isLoading, error } = useQuery({
    queryKey: ['rider', riderId],
    queryFn: () => api.getRiderById(parseInt(riderId)),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-3" />
          <p className="text-slate-500">Loading rider data...</p>
        </div>
      </div>
    );
  }

  if (error || !rider) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <p className="text-slate-900 font-medium mb-2">Rider not found</p>
        <p className="text-slate-500 text-sm mb-4">The rider you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => router.back()}
          className="btn-secondary"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>
    );
  }

  // Calculate metrics from real data
  const successRate = rider.total_deliveries > 0 
    ? Math.round((rider.successful_deliveries / rider.total_deliveries) * 100) 
    : 0;
  const failedDeliveries = rider.total_deliveries - rider.successful_deliveries;
  const onTimeRate = 85 + (parseInt(riderId) % 12); // Simulated for now
  const codAccuracy = 95 + (parseInt(riderId) % 5); // Simulated for now
  
  const overallScore = Math.round(
    (onTimeRate * 0.3 +
    codAccuracy * 0.25 +
    (rider.average_rating / 5) * 100 * 0.25 +
    successRate * 0.2)
  );

  // Generate mock performance data based on rider stats
  const recentPerformance = Array.from({ length: 14 }, (_, i) => ({
    date: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    deliveries: Math.max(0, Math.floor((rider.total_deliveries / 30) * (0.5 + Math.random()))),
    onTime: onTimeRate + Math.floor(Math.random() * 10) - 5,
    rating: Math.min(5, Math.max(3, rider.average_rating + (Math.random() - 0.5)))
  }));

  const skillsRadar = [
    { skill: 'Speed', value: 70 + (parseInt(riderId) % 25), fullMark: 100 },
    { skill: 'Accuracy', value: successRate, fullMark: 100 },
    { skill: 'Service', value: Math.round(rider.average_rating * 20), fullMark: 100 },
    { skill: 'COD', value: codAccuracy, fullMark: 100 },
    { skill: 'Reliability', value: onTimeRate, fullMark: 100 },
    { skill: 'Navigation', value: 75 + (parseInt(riderId) % 20), fullMark: 100 }
  ];

  const monthlyTrend = [
    { month: 'Aug', deliveries: Math.floor(rider.total_deliveries * 0.12), earnings: 2200 },
    { month: 'Sep', deliveries: Math.floor(rider.total_deliveries * 0.14), earnings: 2400 },
    { month: 'Oct', deliveries: Math.floor(rider.total_deliveries * 0.16), earnings: 2600 },
    { month: 'Nov', deliveries: Math.floor(rider.total_deliveries * 0.18), earnings: 2800 },
    { month: 'Dec', deliveries: Math.floor(rider.total_deliveries * 0.20), earnings: 3200 },
    { month: 'Jan', deliveries: Math.floor(rider.total_deliveries * 0.20), earnings: 3000 }
  ];

  const hourlyActivity = Array.from({ length: 12 }, (_, i) => ({
    hour: `${8 + i}:00`,
    deliveries: Math.floor(Math.random() * 8) + 2
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-slate-900">Rider Performance</h1>
          <p className="text-slate-500 text-sm sm:text-base">Detailed analytics and metrics</p>
        </div>
      </div>

      {/* Rider Profile Card */}
      <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white/20 rounded-full flex items-center justify-center text-2xl sm:text-4xl font-bold flex-shrink-0">
            {rider.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
              <h2 className="text-xl sm:text-2xl font-bold truncate">{rider.name}</h2>
              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                rider.status === 'available' ? 'bg-green-500/20 text-green-100' :
                rider.status === 'on_route' ? 'bg-blue-500/20 text-blue-100' :
                'bg-gray-500/20 text-gray-100'
              }`}>
                {rider.status === 'on_route' ? 'On Route' : rider.status?.charAt(0).toUpperCase() + rider.status?.slice(1)}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm text-white/80">
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">{rider.phone_number}</span>
              </div>
              <div className="flex items-center gap-2">
                {rider.vehicle_type === 'van' ? (
                  <Truck className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                ) : (
                  <Bike className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                )}
                <span className="capitalize">{rider.vehicle_type}</span>
              </div>
              {rider.vehicle_registration && (
                <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                  <Navigation className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="font-mono text-xs">{rider.vehicle_registration}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-row sm:flex-col items-center justify-center gap-2 bg-white/10 rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-1 text-xl sm:text-3xl font-bold">
              <Star className="w-5 h-5 sm:w-8 sm:h-8 text-yellow-300 fill-yellow-300" />
              {(rider.average_rating || 0).toFixed(1)}
            </div>
            <p className="text-xs sm:text-sm text-white/80">Rating</p>
          </div>
        </div>
      </div>

      {/* Performance Scores */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="col-span-2 sm:col-span-1 bg-white rounded-xl p-4 sm:p-6 border border-slate-100 flex flex-col items-center justify-center">
          <PerformanceScore score={overallScore} label="Overall Score" />
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-100 flex flex-col items-center justify-center">
          <PerformanceScore score={onTimeRate} label="On-Time Rate" />
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-100 flex flex-col items-center justify-center">
          <PerformanceScore score={codAccuracy} label="COD Accuracy" />
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-100 flex flex-col items-center justify-center">
          <PerformanceScore score={successRate} label="Success Rate" />
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-100 flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">{rider.total_deliveries || 0}</div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Total</p>
            <p className="text-xs text-slate-400">Deliveries</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          icon={Package}
          label="Total Deliveries"
          value={(rider.total_deliveries || 0).toLocaleString()}
          subValue={`${rider.completed_deliveries || 0} completed`}
          color="from-orange-500 to-amber-500"
        />
        <MetricCard
          icon={Clock}
          label="Status"
          value={rider.status === 'on_route' ? 'On Route' : (rider.status?.charAt(0).toUpperCase() + rider.status?.slice(1)) || 'N/A'}
          color="from-orange-500 to-amber-500"
        />
        <MetricCard
          icon={Wallet}
          label="COD Collected"
          value={`GH₵ ${(rider.cod_collected || 0).toLocaleString()}`}
          subValue={`GH₵ ${(rider.cod_remitted || 0).toLocaleString()} remitted`}
          color="from-green-500 to-emerald-500"
        />
        <MetricCard
          icon={Navigation}
          label="Vehicle"
          value={(rider.vehicle_type?.charAt(0).toUpperCase() + rider.vehicle_type?.slice(1)) || 'N/A'}
          subValue={rider.vehicle_registration || 'No registration'}
          color="from-orange-500 to-amber-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Skills Radar */}
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-100">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-500" />
            Skills Assessment
          </h3>
          <div className="h-56 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={skillsRadar}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis 
                  dataKey="skill" 
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]}
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                />
                <Radar
                  name="Score"
                  dataKey="value"
                  stroke="#f97316"
                  fill="#f97316"
                  fillOpacity={0.4}
                  strokeWidth={2}
                />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-100">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Monthly Performance
          </h3>
          <div className="h-56 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="deliveriesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 10 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area
                  type="monotone"
                  dataKey="deliveries"
                  name="Deliveries"
                  stroke="#f97316"
                  fill="url(#deliveriesGrad)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="earnings"
                  name="Earnings (GH₵)"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Performance Table */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-100">
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          Last 14 Days Performance
        </h3>
        <div className="h-48 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={recentPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#6b7280', fontSize: 9 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
              />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="deliveries" name="Deliveries" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Delivery Breakdown */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-slate-900">
                {(rider.completed_deliveries || 0).toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm text-slate-500">Successful Deliveries</p>
            </div>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${successRate}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-slate-900">
                {failedDeliveries}
              </p>
              <p className="text-xs sm:text-sm text-slate-500">Failed Deliveries</p>
            </div>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-red-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${rider.total_deliveries > 0 ? (failedDeliveries / rider.total_deliveries) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-100 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-slate-900">
                {(rider.average_rating || 0).toFixed(1)} ⭐
              </p>
              <p className="text-xs sm:text-sm text-slate-500">Average Rating</p>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Based on customer feedback
          </p>
        </div>
      </div>

      {/* Hourly Activity */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-100">
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-500" />
          Peak Activity Hours
        </h3>
        <div className="h-40 sm:h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="hour" tick={{ fill: '#6b7280', fontSize: 9 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="deliveries" name="Deliveries" radius={[4, 4, 0, 0]}>
                {hourlyActivity.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.deliveries > 6 ? '#f97316' : '#fed7aa'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
