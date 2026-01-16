'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
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
  MapPin,
  Phone,
  Mail,
  Shield,
  Zap,
  Target,
  ThumbsUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';

// Types
interface RiderPerformance {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo?: string;
  vehicleType: 'motorcycle' | 'bicycle' | 'van';
  joinedDate: string;
  status: 'active' | 'inactive' | 'suspended';
  zone: string;
  metrics: {
    totalDeliveries: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    onTimeRate: number;
    avgDeliveryTime: number; // minutes
    codAccuracy: number;
    customerRating: number;
    totalEarnings: number;
    thisMonthEarnings: number;
    totalDistance: number; // km
    avgDeliveriesPerDay: number;
  };
  rankings: {
    overall: number;
    totalRiders: number;
    zone: number;
    zoneTotal: number;
  };
  badges: {
    id: string;
    name: string;
    icon: string;
    earnedAt: string;
  }[];
  recentPerformance: {
    date: string;
    deliveries: number;
    onTime: number;
    rating: number;
  }[];
  skillsRadar: {
    skill: string;
    value: number;
    fullMark: number;
  }[];
  hourlyActivity: {
    hour: string;
    deliveries: number;
  }[];
  monthlyTrend: {
    month: string;
    deliveries: number;
    earnings: number;
    rating: number;
  }[];
}

// Mock data generator
const generateMockRiderData = (id: string): RiderPerformance => {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const names = ['Kwame Asante', 'Ama Serwaa', 'Kofi Mensah', 'Akua Boateng', 'Yaw Owusu'];
  const zones = ['Osu-Cantonments', 'East Legon', 'Tema', 'Accra Central', 'Madina'];
  
  return {
    id,
    name: names[hash % names.length],
    email: `rider${hash % 100}@movva.gh`,
    phone: `+233 ${20 + (hash % 10)} ${String(hash % 1000).padStart(3, '0')} ${String((hash * 7) % 10000).padStart(4, '0')}`,
    vehicleType: ['motorcycle', 'bicycle', 'van'][hash % 3] as RiderPerformance['vehicleType'],
    joinedDate: '2023-06-15',
    status: 'active',
    zone: zones[hash % zones.length],
    metrics: {
      totalDeliveries: 1200 + (hash % 500),
      successfulDeliveries: 1150 + (hash % 450),
      failedDeliveries: 50 + (hash % 50),
      onTimeRate: 85 + (hash % 12),
      avgDeliveryTime: 25 + (hash % 15),
      codAccuracy: 95 + (hash % 5),
      customerRating: 4.2 + (hash % 8) * 0.1,
      totalEarnings: 15000 + (hash % 10000),
      thisMonthEarnings: 2500 + (hash % 1500),
      totalDistance: 5000 + (hash % 3000),
      avgDeliveriesPerDay: 12 + (hash % 8)
    },
    rankings: {
      overall: (hash % 20) + 1,
      totalRiders: 150,
      zone: (hash % 10) + 1,
      zoneTotal: 35
    },
    badges: [
      { id: 'speed_demon', name: 'Speed Demon', icon: '⚡', earnedAt: '2024-01-10' },
      { id: 'perfect_week', name: 'Perfect Week', icon: '🏆', earnedAt: '2024-01-08' },
      { id: 'cod_master', name: 'COD Master', icon: '💰', earnedAt: '2023-12-20' },
      { id: 'five_star', name: '5-Star Rider', icon: '⭐', earnedAt: '2023-11-15' },
      { id: 'marathon', name: 'Marathon Runner', icon: '🏃', earnedAt: '2023-10-01' }
    ].slice(0, 3 + (hash % 3)),
    recentPerformance: Array.from({ length: 14 }, (_, i) => ({
      date: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      deliveries: 10 + Math.floor(Math.random() * 10),
      onTime: 80 + Math.floor(Math.random() * 18),
      rating: 4.0 + Math.random() * 0.9
    })),
    skillsRadar: [
      { skill: 'Speed', value: 75 + (hash % 20), fullMark: 100 },
      { skill: 'Accuracy', value: 80 + (hash % 18), fullMark: 100 },
      { skill: 'Customer Service', value: 70 + (hash % 25), fullMark: 100 },
      { skill: 'COD Handling', value: 85 + (hash % 14), fullMark: 100 },
      { skill: 'Reliability', value: 78 + (hash % 20), fullMark: 100 },
      { skill: 'Navigation', value: 82 + (hash % 16), fullMark: 100 }
    ],
    hourlyActivity: Array.from({ length: 12 }, (_, i) => ({
      hour: `${8 + i}:00`,
      deliveries: Math.floor(Math.random() * 8) + 2
    })),
    monthlyTrend: [
      { month: 'Aug', deliveries: 180, earnings: 2200, rating: 4.3 },
      { month: 'Sep', deliveries: 195, earnings: 2400, rating: 4.4 },
      { month: 'Oct', deliveries: 210, earnings: 2600, rating: 4.5 },
      { month: 'Nov', deliveries: 225, earnings: 2800, rating: 4.5 },
      { month: 'Dec', deliveries: 250, earnings: 3200, rating: 4.6 },
      { month: 'Jan', deliveries: 240, earnings: 3000, rating: 4.7 }
    ]
  };
};

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
  const [rider, setRider] = useState<RiderPerformance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRiderData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setRider(generateMockRiderData(riderId));
      setLoading(false);
    };
    fetchRiderData();
  }, [riderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!rider) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Rider not found</p>
      </div>
    );
  }

  const overallScore = Math.round(
    (rider.metrics.onTimeRate * 0.3 +
    rider.metrics.codAccuracy * 0.25 +
    (rider.metrics.customerRating / 5) * 100 * 0.25 +
    (rider.metrics.successfulDeliveries / rider.metrics.totalDeliveries) * 100 * 0.2)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rider Performance</h1>
          <p className="text-gray-500 dark:text-gray-400">Detailed analytics and metrics</p>
        </div>
      </div>

      {/* Rider Profile Card */}
      <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold">
            {rider.name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold">{rider.name}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                rider.status === 'active' ? 'bg-green-500/20 text-green-100' :
                rider.status === 'inactive' ? 'bg-gray-500/20 text-gray-100' :
                'bg-red-500/20 text-red-100'
              }`}>
                {rider.status.charAt(0).toUpperCase() + rider.status.slice(1)}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {rider.zone}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {rider.phone}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Joined {new Date(rider.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4" />
                {rider.vehicleType.charAt(0).toUpperCase() + rider.vehicleType.slice(1)}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-1 text-3xl font-bold">
              <Star className="w-8 h-8 text-yellow-300 fill-yellow-300" />
              {rider.metrics.customerRating.toFixed(1)}
            </div>
            <p className="text-sm text-white/80">Customer Rating</p>
          </div>
        </div>

        {/* Badges */}
        <div className="mt-6 flex flex-wrap gap-2">
          {rider.badges.map(badge => (
            <div
              key={badge.id}
              className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2"
              title={`Earned on ${new Date(badge.earnedAt).toLocaleDateString()}`}
            >
              <span className="text-xl">{badge.icon}</span>
              <span className="text-sm font-medium">{badge.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Scores */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="col-span-2 md:col-span-1 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center">
          <PerformanceScore score={overallScore} label="Overall Score" />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center">
          <PerformanceScore score={rider.metrics.onTimeRate} label="On-Time Rate" />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center">
          <PerformanceScore score={rider.metrics.codAccuracy} label="COD Accuracy" />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center">
          <PerformanceScore score={Math.round((rider.metrics.successfulDeliveries / rider.metrics.totalDeliveries) * 100)} label="Success Rate" />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">#{rider.rankings.overall}</div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">of {rider.rankings.totalRiders}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Overall Rank</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon={Package}
          label="Total Deliveries"
          value={rider.metrics.totalDeliveries.toLocaleString()}
          subValue={`${rider.metrics.avgDeliveriesPerDay}/day avg`}
          color="from-blue-500 to-indigo-500"
        />
        <MetricCard
          icon={Clock}
          label="Avg Delivery Time"
          value={`${rider.metrics.avgDeliveryTime} min`}
          trend={{ value: 8, isPositive: true }}
          color="from-purple-500 to-violet-500"
        />
        <MetricCard
          icon={Wallet}
          label="This Month"
          value={`GH₵ ${rider.metrics.thisMonthEarnings.toLocaleString()}`}
          subValue={`Total: GH₵ ${rider.metrics.totalEarnings.toLocaleString()}`}
          color="from-green-500 to-emerald-500"
        />
        <MetricCard
          icon={Navigation}
          label="Distance Covered"
          value={`${(rider.metrics.totalDistance / 1000).toFixed(1)}k km`}
          color="from-orange-500 to-amber-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Skills Radar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-500" />
            Skills Assessment
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={rider.skillsRadar}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis 
                  dataKey="skill" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
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
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Monthly Performance
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rider.monthlyTrend}>
                <defs>
                  <linearGradient id="deliveriesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
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
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          Last 14 Days Performance
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rider.recentPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#6b7280', fontSize: 10 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
              />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="deliveries" name="Deliveries" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Delivery Breakdown */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {rider.metrics.successfulDeliveries.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Successful Deliveries</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(rider.metrics.successfulDeliveries / rider.metrics.totalDeliveries) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {rider.metrics.failedDeliveries}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Failed Deliveries</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-red-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(rider.metrics.failedDeliveries / rider.metrics.totalDeliveries) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                #{rider.rankings.zone}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Zone Ranking</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Out of {rider.rankings.zoneTotal} riders in {rider.zone}
          </p>
        </div>
      </div>

      {/* Hourly Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-500" />
          Peak Activity Hours
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rider.hourlyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="hour" tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="deliveries" name="Deliveries" radius={[4, 4, 0, 0]}>
                {rider.hourlyActivity.map((entry, index) => (
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
