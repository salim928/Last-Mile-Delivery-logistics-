/**
 * Enterprise UI Component Library
 * Professional, minimal design system with deep navy, slate gray, and white palette
 * 8px grid system, high contrast, polished typography
 */

import { forwardRef, ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes } from 'react';
import clsx from 'clsx';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

/* ===================================
   BUTTON COMPONENTS
   =================================== */

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-navy-800 text-white shadow-soft hover:bg-navy-900 focus:ring-navy-600',
      secondary: 'bg-slate-100 text-navy-900 hover:bg-slate-200 focus:ring-slate-400',
      ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-300',
      danger: 'bg-red-600 text-white shadow-soft hover:bg-red-700 focus:ring-red-500',
      success: 'bg-green-600 text-white shadow-soft hover:bg-green-700 focus:ring-green-500',
    };
    
    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        className={clsx(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

/* Icon Button */
interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'danger';
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'text-slate-600 hover:bg-slate-100 focus:ring-slate-300',
      primary: 'text-navy-700 hover:bg-navy-50 focus:ring-navy-600',
      danger: 'text-red-600 hover:bg-red-50 focus:ring-red-500',
    };

    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center w-10 h-10 rounded-lg focus:outline-none focus:ring-2 active:scale-95 transition-all duration-150',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

/* ===================================
   INPUT COMPONENTS
   =================================== */

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="label">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'input',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

/* ===================================
   SELECT/DROPDOWN COMPONENT
   =================================== */

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string | number; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, id, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="label">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={clsx(
              'select pr-10',
              error && 'border-red-500 focus:ring-red-500',
              className
            )}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

/* ===================================
   CARD COMPONENTS
   =================================== */

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card = ({ children, className, hover }: CardProps) => {
  return (
    <div className={clsx('card', hover && 'cursor-pointer hover:shadow-medium', className)}>
      {children}
    </div>
  );
};

/* KPI Card with Icon */
interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  iconColor?: string;
  className?: string;
}

export const KPICard = ({ title, value, change, trend, icon, iconColor = 'bg-navy-100', className }: KPICardProps) => {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-slate-600',
  };

  return (
    <div className={clsx('kpi-card', className)}>
      <div className="flex items-start justify-between mb-4">
        <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center', iconColor)}>
          {icon}
        </div>
        {change && trend && (
          <span className={clsx('text-sm font-semibold', trendColors[trend])}>
            {change}
          </span>
        )}
      </div>
      <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-1">{title}</p>
      <p className="text-3xl font-bold text-navy-900">{value}</p>
    </div>
  );
};

/* ===================================
   BADGE COMPONENT
   =================================== */

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  className?: string;
}

export const Badge = ({ children, variant = 'neutral', className }: BadgeProps) => {
  const variants = {
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    info: 'badge-info',
    neutral: 'badge-neutral',
  };

  return (
    <span className={clsx(variants[variant], className)}>
      {children}
    </span>
  );
};

/* ===================================
   TOAST/NOTIFICATION COMPONENT
   =================================== */

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
}

export const Toast = ({ message, type = 'info', onClose }: ToastProps) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    error: <AlertTriangle className="w-5 h-5 text-red-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />,
  };

  const classes = {
    success: 'toast-success',
    error: 'toast-error',
    info: 'toast-info',
  };

  return (
    <div className={classes[type]}>
      <div className="flex items-start gap-3">
        {icons[type]}
        <p className="flex-1 text-sm font-medium text-slate-900">{message}</p>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

/* ===================================
   EMPTY STATE COMPONENT
   =================================== */

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-slate-400">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-navy-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
};

/* ===================================
   LOADING SPINNER
   =================================== */

export const Spinner = ({ className }: { className?: string }) => {
  return (
    <div className="flex items-center justify-center">
      <div className={clsx('animate-spin rounded-full border-b-2 border-navy-800 w-8 h-8', className)} />
    </div>
  );
};
