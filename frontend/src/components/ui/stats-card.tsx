'use client';

import { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'error' | 'primary';
}

const variantStyles = {
  default: {
    bg: 'bg-slate-100',
    icon: 'text-slate-600',
    accent: 'text-slate-600',
  },
  success: {
    bg: 'bg-green-100',
    icon: 'text-green-600',
    accent: 'text-green-600',
  },
  warning: {
    bg: 'bg-amber-100',
    icon: 'text-amber-600',
    accent: 'text-amber-600',
  },
  error: {
    bg: 'bg-red-100',
    icon: 'text-red-600',
    accent: 'text-red-600',
  },
  primary: {
    bg: 'bg-navy-100',
    icon: 'text-navy-600',
    accent: 'text-navy-600',
  },
};

export function StatsCard({ title, value, subtitle, icon: Icon, trend, variant = 'default' }: StatsCardProps) {
  const styles = variantStyles[variant];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-soft hover:shadow-medium transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
          )}
          {trend && (
            <div className={clsx(
              'flex items-center gap-1 mt-2 text-sm font-medium',
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            )}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-slate-400 font-normal">vs last period</span>
            </div>
          )}
        </div>
        <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center', styles.bg)}>
          <Icon className={clsx('w-6 h-6', styles.icon)} />
        </div>
      </div>
    </div>
  );
}

interface StatsCardGradientProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  gradient: 'blue' | 'green' | 'purple' | 'orange' | 'pink';
}

const gradientStyles = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  purple: 'from-purple-500 to-purple-600',
  orange: 'from-orange-500 to-orange-600',
  pink: 'from-pink-500 to-pink-600',
};

export function StatsCardGradient({ title, value, subtitle, icon: Icon, gradient }: StatsCardGradientProps) {
  return (
    <div className={clsx(
      'rounded-2xl p-5 text-white shadow-medium',
      'bg-gradient-to-br',
      gradientStyles[gradient]
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-white/80 mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {subtitle && (
            <p className="text-sm text-white/70 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
