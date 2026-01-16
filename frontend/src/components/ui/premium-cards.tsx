'use client';

import { LucideIcon, ArrowUpRight, ArrowDownRight, TrendingUp, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

// ============================================
// METRIC CARD - Premium Stripe-style card
// ============================================

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  sparkline?: number[];
  loading?: boolean;
  variant?: 'default' | 'highlight' | 'success' | 'warning' | 'danger';
}

const metricVariants = {
  default: {
    bg: 'bg-white',
    border: 'border-slate-200/60',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
  },
  highlight: {
    bg: 'bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600',
    border: 'border-transparent',
    iconBg: 'bg-white/20',
    iconColor: 'text-white',
  },
  success: {
    bg: 'bg-white',
    border: 'border-emerald-200/60',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  warning: {
    bg: 'bg-white',
    border: 'border-amber-200/60',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  danger: {
    bg: 'bg-white',
    border: 'border-red-200/60',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
  },
};

export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  sparkline,
  loading = false,
  variant = 'default' 
}: MetricCardProps) {
  const styles = metricVariants[variant];
  const isHighlight = variant === 'highlight';

  // Simple sparkline renderer
  const renderSparkline = () => {
    if (!sparkline || sparkline.length < 2) return null;
    const max = Math.max(...sparkline);
    const min = Math.min(...sparkline);
    const range = max - min || 1;
    const width = 100;
    const height = 32;
    const points = sparkline.map((v, i) => {
      const x = (i / (sparkline.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg 
        width={width} 
        height={height} 
        className="absolute bottom-4 right-4 opacity-30"
        preserveAspectRatio="none"
      >
        <polyline
          fill="none"
          stroke={isHighlight ? 'white' : '#6366f1'}
          strokeWidth="2"
          points={points}
        />
      </svg>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'relative rounded-2xl border p-6 overflow-hidden transition-all duration-300',
        'hover:shadow-lg hover:-translate-y-0.5',
        styles.bg,
        styles.border,
        isHighlight && 'text-white shadow-lg shadow-indigo-500/25'
      )}
    >
      {/* Background pattern for highlight */}
      {isHighlight && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.15),_transparent_70%)]" />
      )}

      {sparkline && renderSparkline()}

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <p className={clsx(
            'text-sm font-medium',
            isHighlight ? 'text-white/80' : 'text-slate-500'
          )}>
            {title}
          </p>
          {Icon && (
            <div className={clsx(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              styles.iconBg
            )}>
              <Icon className={clsx('w-5 h-5', styles.iconColor)} />
            </div>
          )}
        </div>

        {loading ? (
          <div className="space-y-2">
            <div className={clsx(
              'h-8 w-24 rounded-lg animate-pulse',
              isHighlight ? 'bg-white/20' : 'bg-slate-200'
            )} />
            <div className={clsx(
              'h-4 w-16 rounded animate-pulse',
              isHighlight ? 'bg-white/10' : 'bg-slate-100'
            )} />
          </div>
        ) : (
          <>
            <p className={clsx(
              'text-3xl font-bold tracking-tight',
              isHighlight ? 'text-white' : 'text-slate-900'
            )}>
              {value}
            </p>

            <div className="flex items-center gap-3 mt-2">
              {subtitle && (
                <span className={clsx(
                  'text-sm',
                  isHighlight ? 'text-white/70' : 'text-slate-500'
                )}>
                  {subtitle}
                </span>
              )}
              
              {trend && (
                <div className={clsx(
                  'flex items-center gap-1 text-sm font-medium px-2 py-0.5 rounded-full',
                  trend.isPositive 
                    ? isHighlight ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700' 
                    : isHighlight ? 'bg-white/20 text-white' : 'bg-red-100 text-red-700'
                )}>
                  {trend.isPositive ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                  <span>{Math.abs(trend.value)}%</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}


// ============================================
// ACTION CARD - For quick actions
// ============================================

interface ActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  gradient?: string;
}

export function ActionCard({ title, description, icon: Icon, href, onClick, gradient = 'from-indigo-500 to-violet-500' }: ActionCardProps) {
  const Component = href ? 'a' : 'button';
  const props = href ? { href } : { onClick };

  return (
    <Component
      {...props}
      className="group relative block p-6 bg-white rounded-2xl border border-slate-200/60 hover:border-slate-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 text-left"
    >
      <div className={clsx(
        'w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br text-white',
        gradient
      )}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-slate-500">{description}</p>
      
      {/* Hover arrow */}
      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowUpRight className="w-5 h-5 text-indigo-500" />
      </div>
    </Component>
  );
}


// ============================================
// INSIGHT CARD - For AI insights
// ============================================

interface InsightCardProps {
  title: string;
  insight: string;
  metric?: string;
  metricLabel?: string;
  type?: 'success' | 'warning' | 'info';
}

const insightColors = {
  success: {
    bg: 'bg-gradient-to-br from-emerald-50 to-teal-50',
    border: 'border-emerald-200/50',
    icon: 'text-emerald-500',
    metric: 'text-emerald-700',
  },
  warning: {
    bg: 'bg-gradient-to-br from-amber-50 to-orange-50',
    border: 'border-amber-200/50',
    icon: 'text-amber-500',
    metric: 'text-amber-700',
  },
  info: {
    bg: 'bg-gradient-to-br from-indigo-50 to-violet-50',
    border: 'border-indigo-200/50',
    icon: 'text-indigo-500',
    metric: 'text-indigo-700',
  },
};

export function InsightCard({ title, insight, metric, metricLabel, type = 'info' }: InsightCardProps) {
  const colors = insightColors[type];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={clsx(
        'rounded-2xl border p-5',
        colors.bg,
        colors.border
      )}
    >
      <div className="flex items-start gap-3">
        <div className={clsx('p-2 rounded-lg bg-white shadow-sm', colors.icon)}>
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-slate-900 text-sm mb-1">{title}</h4>
          <p className="text-sm text-slate-600 leading-relaxed">{insight}</p>
          {metric && (
            <div className="mt-3 pt-3 border-t border-slate-200/50">
              <span className={clsx('text-2xl font-bold', colors.metric)}>{metric}</span>
              {metricLabel && (
                <span className="text-sm text-slate-500 ml-2">{metricLabel}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}


// ============================================
// PROGRESS CARD - For showing progress
// ============================================

interface ProgressCardProps {
  title: string;
  value: number;
  max: number;
  unit?: string;
  color?: 'indigo' | 'emerald' | 'amber' | 'rose';
}

const progressColors = {
  indigo: 'from-indigo-500 to-violet-500',
  emerald: 'from-emerald-500 to-teal-500',
  amber: 'from-amber-500 to-orange-500',
  rose: 'from-rose-500 to-pink-500',
};

export function ProgressCard({ title, value, max, unit = '', color = 'indigo' }: ProgressCardProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        <span className="text-sm font-semibold text-slate-900">
          {value}{unit} / {max}{unit}
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={clsx('h-full rounded-full bg-gradient-to-r', progressColors[color])}
        />
      </div>
      <p className="text-xs text-slate-400 mt-2">{percentage.toFixed(0)}% complete</p>
    </div>
  );
}


// ============================================
// ACTIVITY ITEM - For activity feeds
// ============================================

interface ActivityItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
  time: string;
  status?: 'success' | 'pending' | 'error';
}

const statusStyles = {
  success: 'bg-emerald-100 text-emerald-600',
  pending: 'bg-amber-100 text-amber-600',
  error: 'bg-red-100 text-red-600',
};

export function ActivityItem({ icon: Icon, title, description, time, status = 'success' }: ActivityItemProps) {
  return (
    <div className="flex items-start gap-4 py-4 first:pt-0 last:pb-0 border-b border-slate-100 last:border-0">
      <div className={clsx(
        'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
        statusStyles[status]
      )}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900">{title}</p>
        <p className="text-sm text-slate-500 truncate">{description}</p>
      </div>
      <span className="text-xs text-slate-400 flex-shrink-0">{time}</span>
    </div>
  );
}
