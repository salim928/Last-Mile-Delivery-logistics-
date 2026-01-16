'use client';

import { ReactNode } from 'react';
import clsx from 'clsx';

interface DataTableProps<T> {
  columns: {
    key: string;
    label: string;
    className?: string;
    render?: (row: T, index: number) => ReactNode;
  }[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  selectedRows?: Set<number>;
  onSelectRow?: (id: number) => void;
  onSelectAll?: () => void;
  showCheckbox?: boolean;
  getRowId?: (row: T) => number;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  isLoading,
  emptyMessage = 'No data found',
  onRowClick,
  selectedRows,
  onSelectRow,
  onSelectAll,
  showCheckbox = false,
  getRowId = (row) => row.id,
}: DataTableProps<T>) {
  const allSelected = data.length > 0 && selectedRows?.size === data.length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-soft overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {showCheckbox && (
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={onSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-navy-600 focus:ring-navy-500"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={clsx(
                    'text-left text-xs font-semibold text-slate-600 uppercase tracking-wider px-4 py-3',
                    col.className
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + (showCheckbox ? 1 : 0)} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-2 border-navy-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-slate-500">Loading...</p>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (showCheckbox ? 1 : 0)} className="px-4 py-12 text-center">
                  <p className="text-slate-500">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              data.map((row, index) => {
                const rowId = getRowId(row);
                const isSelected = selectedRows?.has(rowId);
                return (
                  <tr
                    key={rowId}
                    onClick={() => onRowClick?.(row)}
                    className={clsx(
                      'transition-colors',
                      onRowClick && 'cursor-pointer hover:bg-slate-50',
                      isSelected && 'bg-navy-50'
                    )}
                  >
                    {showCheckbox && (
                      <td className="w-12 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            onSelectRow?.(rowId);
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-navy-600 focus:ring-navy-500"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className={clsx('px-4 py-3', col.className)}>
                        {col.render ? col.render(row, index) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Status Badge component
interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple';
}

const statusVariants: Record<string, StatusBadgeProps['variant']> = {
  pending: 'warning',
  assigned: 'info',
  in_transit: 'purple',
  delivered: 'success',
  failed: 'error',
  completed: 'success',
  draft: 'default',
  optimized: 'info',
  available: 'success',
  on_route: 'purple',
  offline: 'default',
};

const variantColors = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  error: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
};

export function StatusBadge({ status, variant }: StatusBadgeProps) {
  const resolvedVariant = variant || statusVariants[status] || 'default';
  const displayText = status.replace(/_/g, ' ');

  return (
    <span className={clsx(
      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize',
      variantColors[resolvedVariant]
    )}>
      {displayText}
    </span>
  );
}
