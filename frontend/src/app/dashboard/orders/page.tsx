'use client';

import { useState, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Package,
  Plus,
  Upload,
  Search,
  Filter,
  MoreVertical,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  Loader2,
  Trash2,
  Edit,
  MapPin,
  Phone,
  AlertCircle,
  Download,
  RefreshCw,
  Eye,
  X,
} from 'lucide-react';
import clsx from 'clsx';
import api from '@/lib/api';
import { StatusBadge } from '@/components/ui/data-table';
import { StatsCard } from '@/components/ui/stats-card';

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  assigned: { label: 'Assigned', color: 'bg-blue-100 text-blue-800', icon: Truck },
  in_transit: { label: 'In Transit', color: 'bg-purple-100 text-purple-800', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-800', icon: XCircle },
};

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState<any>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<Set<number>>(new Set());

  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['orders', statusFilter],
    queryFn: () => api.getOrders({ status: statusFilter || undefined }),
  });

  // Filter orders by search query
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    if (!searchQuery.trim()) return orders;
    
    const query = searchQuery.toLowerCase();
    return orders.filter((order: any) => 
      order.customer_name?.toLowerCase().includes(query) ||
      order.customer_phone?.includes(query) ||
      order.delivery_address?.toLowerCase().includes(query) ||
      order.external_order_id?.toString().includes(query)
    );
  }, [orders, searchQuery]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!orders) return { total: 0, pending: 0, delivered: 0, failed: 0, codTotal: 0 };
    return {
      total: orders.length,
      pending: orders.filter((o: any) => o.status === 'pending').length,
      delivered: orders.filter((o: any) => o.status === 'delivered').length,
      failed: orders.filter((o: any) => o.status === 'failed').length,
      codTotal: orders.filter((o: any) => o.is_cod).reduce((sum: number, o: any) => sum + (o.cod_amount || 0), 0),
    };
  }, [orders]);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => api.uploadOrdersCSV(file),
    onSuccess: (data) => {
      setUploadResult(data);
      setUploadError(null);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: any) => {
      setUploadError(error?.response?.data?.detail || 'Failed to upload CSV. Please check the file format.');
      setUploadResult(null);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.updateOrder(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setActiveDropdown(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setActiveDropdown(null);
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleOrderSelection = (orderId: number) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map((o: any) => o.id)));
    }
  };

  return (
    <div className="space-y-6" onClick={() => setActiveDropdown(null)}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-slate-600 mt-1">Manage and track your delivery orders</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => refetch()}
            className="btn-secondary"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
            className="btn-secondary"
          >
            {uploadMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Upload CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            Add Order
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total Orders"
          value={stats.total}
          icon={Package}
          variant="primary"
        />
        <StatsCard
          title="Pending"
          value={stats.pending}
          icon={Clock}
          variant={stats.pending > 0 ? 'warning' : 'default'}
        />
        <StatsCard
          title="Delivered"
          value={stats.delivered}
          icon={CheckCircle2}
          variant="success"
        />
        <StatsCard
          title="Failed"
          value={stats.failed}
          icon={XCircle}
          variant={stats.failed > 0 ? 'error' : 'default'}
        />
        <StatsCard
          title="COD Total"
          value={`GHS ${stats.codTotal.toLocaleString()}`}
          icon={Package}
          variant="default"
        />
      </div>

      {/* Upload result / error alerts */}
      {uploadResult && (
        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">
                CSV Upload Complete: {uploadResult.total_created} orders created
              </p>
              {uploadResult.total_failed > 0 && (
                <p className="text-sm text-red-600">
                  {uploadResult.total_failed} orders failed to import
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setUploadResult(null)}
            className="text-green-600 hover:text-green-800 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {uploadError && (
        <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="font-medium text-red-800">{uploadError}</p>
          </div>
          <button
            onClick={() => setUploadError(null)}
            className="text-red-600 hover:text-red-800 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by customer name, phone, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input w-auto min-w-[150px]"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
        
        {/* Bulk Actions */}
        {selectedOrders.size > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200 flex items-center gap-4">
            <span className="text-sm text-slate-600">
              {selectedOrders.size} order{selectedOrders.size > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => setSelectedOrders(new Set())}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              Clear selection
            </button>
          </div>
        )}
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">
                  <input
                    type="checkbox"
                    checked={filteredOrders.length > 0 && selectedOrders.size === filteredOrders.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-navy-600 focus:ring-navy-500"
                  />
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">
                  Order
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">
                  Customer
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">
                  Delivery Location
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">
                  COD
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">
                  Status
                </th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-400 mb-2" />
                    <p className="text-slate-500">Loading orders...</p>
                  </td>
                </tr>
              ) : filteredOrders?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600 font-medium mb-1">No orders found</p>
                    <p className="text-sm text-slate-500">
                      {searchQuery ? 'Try a different search term' : 'Upload a CSV or add orders manually'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders?.map((order: any) => {
                  const status = statusConfig[order.status] || statusConfig.pending;
                  const StatusIcon = status.icon;

                  return (
                    <tr 
                      key={order.id} 
                      className={clsx(
                        'hover:bg-slate-50 transition-colors',
                        selectedOrders.has(order.id) && 'bg-navy-50'
                      )}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedOrders.has(order.id)}
                          onChange={() => toggleOrderSelection(order.id)}
                          className="w-4 h-4 rounded border-slate-300 text-navy-600 focus:ring-navy-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            #{order.external_order_id || order.id}
                          </p>
                          <p className="text-sm text-slate-500">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900">{order.customer_name}</p>
                          <p className="text-sm text-slate-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {order.customer_phone}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-slate-900 max-w-[200px] truncate">
                              {order.delivery_address}
                            </p>
                            <p className="text-sm text-slate-500">{order.delivery_city}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {order.is_cod ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-lg font-semibold text-sm">
                            GHS {order.cod_amount}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4 relative">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowViewModal(order);
                            }}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(activeDropdown === order.id ? null : order.id);
                            }}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {activeDropdown === order.id && (
                            <div className="absolute right-6 top-12 z-20 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1">
                              {order.status === 'pending' && (
                                <button
                                  onClick={() => updateStatusMutation.mutate({ id: order.id, status: 'assigned' })}
                                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center gap-2"
                                >
                                  <Truck className="w-4 h-4 text-blue-500" />
                                  Mark Assigned
                                </button>
                              )}
                              {order.status === 'assigned' && (
                                <button
                                  onClick={() => updateStatusMutation.mutate({ id: order.id, status: 'in_transit' })}
                                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center gap-2"
                                >
                                  <Truck className="w-4 h-4 text-purple-500" />
                                  Mark In Transit
                                </button>
                              )}
                              {(order.status === 'in_transit' || order.status === 'assigned') && (
                                <>
                                  <button
                                    onClick={() => updateStatusMutation.mutate({ id: order.id, status: 'delivered' })}
                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center gap-2"
                                  >
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    Mark Delivered
                                  </button>
                                  <button
                                    onClick={() => updateStatusMutation.mutate({ id: order.id, status: 'failed' })}
                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center gap-2"
                                  >
                                    <XCircle className="w-4 h-4 text-red-500" />
                                    Mark Failed
                                  </button>
                                </>
                              )}
                              <div className="border-t border-slate-100 my-1"></div>
                              <button
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this order?')) {
                                    deleteMutation.mutate(order.id);
                                  }
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete Order
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Table footer with count */}
        {filteredOrders && filteredOrders.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
            <p className="text-sm text-slate-600">
              Showing {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>
        )}
      </div>

      {/* Add Order Modal */}
      {showAddModal && (
        <AddOrderModal onClose={() => setShowAddModal(false)} />
      )}

      {/* View Order Modal */}
      {showViewModal && (
        <ViewOrderModal order={showViewModal} onClose={() => setShowViewModal(null)} />
      )}
    </div>
  );
}

// View Order Modal Component
function ViewOrderModal({ order, onClose }: { order: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Order #{order.external_order_id || order.id}
            </h2>
            <p className="text-sm text-slate-500">
              Created on {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Customer Info */}
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-3">Customer Information</h3>
            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
              <p className="font-semibold text-slate-900">{order.customer_name}</p>
              <p className="text-slate-600 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {order.customer_phone}
              </p>
            </div>
          </div>

          {/* Delivery Info */}
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-3">Delivery Location</h3>
            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-slate-400" />
                <span className="text-slate-900">{order.delivery_address}</span>
              </p>
              <p className="text-slate-600 ml-6">{order.delivery_city}</p>
              {order.delivery_landmark && (
                <p className="text-slate-500 text-sm ml-6">
                  Landmark: {order.delivery_landmark}
                </p>
              )}
            </div>
          </div>

          {/* Package & Payment */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-3">Status</h3>
              <StatusBadge status={order.status} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-3">Payment</h3>
              {order.is_cod ? (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg font-semibold">
                  COD: GHS {order.cod_amount}
                </span>
              ) : (
                <span className="text-slate-600">Prepaid</span>
              )}
            </div>
          </div>

          {order.package_description && (
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-3">Package Description</h3>
              <p className="text-slate-600 bg-slate-50 rounded-xl p-4 whitespace-pre-wrap break-words">{order.package_description}</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 flex-shrink-0">
          <button onClick={onClose} className="btn-secondary w-full">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function AddOrderModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    delivery_address: '',
    delivery_city: 'Accra',
    delivery_landmark: '',
    is_cod: false,
    cod_amount: 0,
    package_description: '',
  });
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      onClose();
    },
    onError: (err: any) => {
      setError(err?.response?.data?.detail || 'Failed to create order. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    createMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Add New Order</h2>
            <p className="text-sm text-slate-500">Enter customer and delivery details</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        {error && (
          <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="label">Customer Name *</label>
              <input
                type="text"
                required
                className="input"
                placeholder="Enter full name"
                value={formData.customer_name}
                onChange={(e) =>
                  setFormData({ ...formData, customer_name: e.target.value })
                }
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="label">Phone Number *</label>
              <input
                type="tel"
                required
                className="input"
                placeholder="+233 XX XXX XXXX"
                value={formData.customer_phone}
                onChange={(e) =>
                  setFormData({ ...formData, customer_phone: e.target.value })
                }
              />
            </div>
          </div>
          
          <div>
            <label className="label">Delivery Address *</label>
            <textarea
              required
              className="input min-h-[80px]"
              placeholder="Enter full delivery address"
              rows={2}
              value={formData.delivery_address}
              onChange={(e) =>
                setFormData({ ...formData, delivery_address: e.target.value })
              }
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">City</label>
              <select
                className="input"
                value={formData.delivery_city}
                onChange={(e) =>
                  setFormData({ ...formData, delivery_city: e.target.value })
                }
              >
                <option>Accra</option>
                <option>Kumasi</option>
                <option>Tema</option>
                <option>Takoradi</option>
                <option>Tamale</option>
                <option>Cape Coast</option>
                <option>Koforidua</option>
                <option>Sunyani</option>
              </select>
            </div>
            <div>
              <label className="label">Landmark</label>
              <input
                type="text"
                className="input"
                placeholder="Near a famous location..."
                value={formData.delivery_landmark}
                onChange={(e) =>
                  setFormData({ ...formData, delivery_landmark: e.target.value })
                }
              />
            </div>
          </div>
          
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.is_cod}
                  onChange={(e) =>
                    setFormData({ ...formData, is_cod: e.target.checked, cod_amount: e.target.checked ? formData.cod_amount : 0 })
                  }
                  className="w-5 h-5 rounded border-slate-300 text-navy-600 focus:ring-navy-500"
                />
                <span className="font-medium text-slate-700">Cash on Delivery (COD)</span>
              </label>
            </div>
            {formData.is_cod && (
              <div>
                <label className="label">COD Amount (GHS) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="input"
                  placeholder="0.00"
                  value={formData.cod_amount || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, cod_amount: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            )}
          </div>
          
          <div>
            <label className="label">Package Description</label>
            <input
              type="text"
              className="input"
              placeholder="e.g., Small box, electronics, fragile"
              value={formData.package_description}
              onChange={(e) =>
                setFormData({ ...formData, package_description: e.target.value })
              }
            />
          </div>
          
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="btn-primary flex-1"
            >
              {createMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Order
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}