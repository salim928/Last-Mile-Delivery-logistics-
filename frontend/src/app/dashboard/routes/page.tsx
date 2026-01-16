'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Route as RouteIcon,
  Plus,
  MapPin,
  Clock,
  Fuel,
  TrendingDown,
  Download,
  Play,
  User,
  Loader2,
  CheckCircle2,
  Search,
  X,
  Package,
  Phone,
  Calendar,
  Bike,
  Car,
  ChevronRight,
  GripVertical,
  UserPlus,
  Sparkles,
  ArrowRight,
  Eye,
  Zap,
  AlertCircle,
} from 'lucide-react';
import clsx from 'clsx';
import api from '@/lib/api';

const statusColors: Record<string, { bg: string; text: string; ring: string }> = {
  draft: { bg: 'from-slate-100 to-gray-100', text: 'text-slate-700', ring: 'ring-slate-200/50' },
  optimized: { bg: 'from-orange-100 to-amber-100', text: 'text-orange-700', ring: 'ring-orange-200/50' },
  assigned: { bg: 'from-amber-100 to-yellow-100', text: 'text-amber-700', ring: 'ring-amber-200/50' },
  in_progress: { bg: 'from-orange-100 to-amber-100', text: 'text-orange-700', ring: 'ring-orange-200/50' },
  completed: { bg: 'from-green-100 to-emerald-100', text: 'text-green-700', ring: 'ring-green-200/50' },
};

export default function RoutesPage() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: routes, isLoading } = useQuery({
    queryKey:  ['routes'],
    queryFn: () => api.getRoutes(),
  });

  const { data: riders } = useQuery({
    queryKey: ['riders'],
    queryFn: () => api.getRiders(),
  });

  const optimizeMutation = useMutation({
    mutationFn: (routeId: number) => api.optimizeRoute(routeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      setActionError(null);
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.detail || 'Failed to optimize route');
    },
  });

  const assignMutation = useMutation({
    mutationFn: ({ routeId, riderId }: { routeId:  number; riderId: number }) =>
      api.assignRiderToRoute(routeId, riderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      setActionError(null);
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.detail || 'Failed to assign rider');
    },
  });

  const handleExportPDF = async (routeId: number) => {
    try {
      const blob = await api.exportRoutePDF(routeId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `route_${routeId}.pdf`;
      a.click();
    } catch (err: any) {
      setActionError('Failed to export PDF');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Error Alert */}
      {actionError && (
        <div className="flex items-center gap-3 bg-gradient-to-r from-red-50 to-rose-50 text-red-700 px-5 py-4 rounded-xl border border-red-200/50 shadow-sm animate-slide-down">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <p className="flex-1 font-medium">{actionError}</p>
          <button 
            onClick={() => setActionError(null)}
            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Routes</span>
            <Sparkles className="w-5 h-5 text-purple-500" />
          </h1>
          <p className="text-slate-600 mt-1">Optimize and manage your delivery routes</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Create Route
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/60 p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center shadow-sm">
              <RouteIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{routes?.length || 0}</p>
              <p className="text-xs text-slate-500">Total Routes</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/60 p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center shadow-sm">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {routes?.filter((r: any) => r.status === 'in_progress').length || 0}
              </p>
              <p className="text-xs text-slate-500">In Progress</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/60 p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {routes?.filter((r: any) => r.status === 'completed').length || 0}
              </p>
              <p className="text-xs text-slate-500">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/60 p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center shadow-sm">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {routes?.reduce((acc: number, r: any) => acc + (r.distance_saved_percent || 0), 0) || 0}%
              </p>
              <p className="text-xs text-slate-500">Avg. Saved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Routes grid */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-navy-600 mx-auto mb-3" />
            <p className="text-slate-500">Loading routes...</p>
          </div>
        </div>
      ) : routes?.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-soft text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <RouteIcon className="w-10 h-10 text-purple-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No routes yet</h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            Create your first route to start optimizing deliveries and save on fuel costs
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            Create Your First Route
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {routes?.map((route: any, index: number) => (
            <div 
              key={route.id} 
              className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-soft p-6 hover:shadow-medium transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Route header */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-md">
                    <RouteIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">
                      {route.name || `Route #${route.id}`}
                    </h3>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(route.route_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <span
                  className={clsx(
                    'inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r ring-1 capitalize',
                    statusColors[route.status]?.bg || statusColors.draft.bg,
                    statusColors[route.status]?.text || statusColors.draft.text,
                    statusColors[route.status]?.ring || statusColors.draft.ring
                  )}
                >
                  {route.status === 'in_progress' && (
                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
                  )}
                  {route.status.replace('_', ' ')}
                </span>
              </div>

              {/* Route stats */}
              <div className="grid grid-cols-4 gap-3 mb-5">
                <div className="text-center p-3 bg-slate-50/80 rounded-xl">
                  <MapPin className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-slate-900">{route.total_stops}</p>
                  <p className="text-2xs text-slate-500">Stops</p>
                </div>
                <div className="text-center p-3 bg-slate-50/80 rounded-xl">
                  <RouteIcon className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-slate-900">
                    {route.total_distance_km}
                  </p>
                  <p className="text-2xs text-slate-500">km</p>
                </div>
                <div className="text-center p-3 bg-slate-50/80 rounded-xl">
                  <Clock className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-slate-900">
                    {Math.round(route.total_duration_minutes)}
                  </p>
                  <p className="text-2xs text-slate-500">min</p>
                </div>
                <div className="text-center p-3 bg-slate-50/80 rounded-xl">
                  <Fuel className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-slate-900">
                    {route.estimated_fuel_cost}
                  </p>
                  <p className="text-2xs text-slate-500">GHS</p>
                </div>
              </div>

              {/* Savings highlight */}
              {route.distance_saved_percent > 0 && (
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200/50 mb-5">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <TrendingDown className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-800">
                      {route.distance_saved_percent}% distance saved
                    </p>
                    <p className="text-xs text-green-600">
                      {route.distance_saved_km} km less than unoptimized route
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {route.status === 'draft' && (
                  <button
                    onClick={() => optimizeMutation.mutate(route.id)}
                    disabled={optimizeMutation.isPending}
                    className="btn-success flex items-center gap-2 text-sm"
                  >
                    {optimizeMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                    Optimize
                  </button>
                )}
                {route.status === 'optimized' && !route.rider_id && (
                  <select
                    className="input text-sm py-2 min-w-[140px]"
                    onChange={(e) => {
                      if (e.target.value) {
                        assignMutation.mutate({
                          routeId: route.id,
                          riderId: parseInt(e.target.value),
                        });
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Assign Rider
                    </option>
                    {riders?.map((rider: any) => (
                      <option key={rider.id} value={rider.id}>
                        {rider.name}
                      </option>
                    ))}
                  </select>
                )}
                {route.rider_id && (
                  <div className="flex items-center gap-2 text-sm text-slate-700 bg-slate-100 px-4 py-2 rounded-xl">
                    <div className="w-6 h-6 bg-navy-600 rounded-full flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="font-medium">
                      {riders?.find((r: any) => r.id === route.rider_id)?.name || 'Assigned'}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => handleExportPDF(route.id)}
                  className="btn-secondary flex items-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </button>
                <button
                  onClick={() => setSelectedRoute(route)}
                  className="btn-secondary flex items-center gap-2 text-sm"
                >
                  <Eye className="w-4 h-4" />
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Route Modal */}
      {showCreateModal && (
        <CreateRouteModal onClose={() => setShowCreateModal(false)} />
      )}

      {/* Route Details Modal */}
      {selectedRoute && (
        <RouteDetailsModal
          route={selectedRoute}
          onClose={() => setSelectedRoute(null)}
        />
      )}
    </div>
  );
}

function CreateRouteModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<'orders' | 'assign'>('orders');
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [routeDate, setRouteDate] = useState(new Date().toISOString().split('T')[0]);
  const [routeName, setRouteName] = useState('');
  const [vehicleType, setVehicleType] = useState('motorbike');
  const [selectedRiderId, setSelectedRiderId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [autoOptimize, setAutoOptimize] = useState(true);

  const { data: pendingOrders } = useQuery({
    queryKey: ['orders', 'pending'],
    queryFn: () => api.getOrders({ status: 'pending' }),
  });

  const { data: riders } = useQuery({
    queryKey: ['riders'],
    queryFn: () => api.getRiders(),
  });

  // Filter orders based on search
  const filteredOrders = useMemo(() => {
    if (!pendingOrders) return [];
    if (!searchQuery) return pendingOrders;
    const query = searchQuery.toLowerCase();
    return pendingOrders.filter((order: any) =>
      order.customer_name?.toLowerCase().includes(query) ||
      order.delivery_address?.toLowerCase().includes(query) ||
      order.customer_phone?.includes(query) ||
      order.tracking_id?.toLowerCase().includes(query)
    );
  }, [pendingOrders, searchQuery]);

  // Get selected order objects for display
  const selectedOrderObjects = useMemo(() => {
    if (!pendingOrders) return [];
    return pendingOrders.filter((o: any) => selectedOrders.includes(o.id));
  }, [pendingOrders, selectedOrders]);

  // Calculate totals
  const totals = useMemo(() => {
    const codTotal = selectedOrderObjects.reduce((sum: number, o: any) => 
      sum + (o.is_cod ? parseFloat(o.cod_amount || 0) : 0), 0
    );
    return { orders: selectedOrders.length, cod: codTotal };
  }, [selectedOrderObjects, selectedOrders]);

  // Available riders (not already on a route today)
  const availableRiders = useMemo(() => {
    if (!riders) return [];
    return riders.filter((r: any) => r.status === 'available' || r.status === 'active');
  }, [riders]);

  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      setError(null);
      // Step 1: Create the route
      const route = await api.createRoute(data);
      
      // Step 2: Auto-optimize if enabled
      if (autoOptimize && route.id) {
        try {
          await api.optimizeRoute(route.id);
        } catch (err: any) {
          console.error('Optimization failed:', err);
          // Continue even if optimization fails
        }
      }
      
      // Step 3: Assign rider if selected
      if (selectedRiderId && route.id) {
        try {
          await api.assignRiderToRoute(route.id, selectedRiderId);
        } catch (err: any) {
          console.error('Rider assignment failed:', err);
          // Continue even if assignment fails
        }
      }
      
      return route;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      onClose();
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || err.message || 'Failed to create route');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name: routeName || `Route ${routeDate}`,
      route_date: routeDate,
      vehicle_type: vehicleType,
      order_ids: selectedOrders,
    });
  };

  const toggleOrder = (orderId: number) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const selectAll = () => {
    if (filteredOrders.length === selectedOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map((o: any) => o.id));
    }
  };

  const removeOrder = (orderId: number) => {
    setSelectedOrders(prev => prev.filter(id => id !== orderId));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header with steps */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Create New Route</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Step indicator */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setStep('orders')}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
                step === 'orders' 
                  ? 'bg-navy-800 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              <Package className="w-4 h-4" />
              1. Select Orders
              {selectedOrders.length > 0 && (
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                  {selectedOrders.length}
                </span>
              )}
            </button>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <button
              onClick={() => selectedOrders.length > 0 && setStep('assign')}
              disabled={selectedOrders.length === 0}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
                step === 'assign' 
                  ? 'bg-navy-800 text-white' 
                  : selectedOrders.length > 0
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              )}
            >
              <UserPlus className="w-4 h-4" />
              2. Assign Rider
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          {step === 'orders' ? (
            <>
              {/* Route settings row */}
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="label text-xs">Route Name</label>
                    <input
                      type="text"
                      className="input text-sm"
                      placeholder="e.g., East Legon Morning"
                      value={routeName}
                      onChange={(e) => setRouteName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label text-xs">Date</label>
                    <input
                      type="date"
                      className="input text-sm"
                      value={routeDate}
                      onChange={(e) => setRouteDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label text-xs">Vehicle</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setVehicleType('motorbike')}
                        className={clsx(
                          'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border transition-colors',
                          vehicleType === 'motorbike'
                            ? 'bg-navy-800 text-white border-navy-800'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <Bike className="w-4 h-4" />
                        <span className="text-sm">Bike</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setVehicleType('van')}
                        className={clsx(
                          'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border transition-colors',
                          vehicleType === 'van'
                            ? 'bg-navy-800 text-white border-navy-800'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <Car className="w-4 h-4" />
                        <span className="text-sm">Van</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="label text-xs">Auto-optimize</label>
                    <button
                      type="button"
                      onClick={() => setAutoOptimize(!autoOptimize)}
                      className={clsx(
                        'w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border transition-colors',
                        autoOptimize
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-white text-gray-600 border-gray-200'
                      )}
                    >
                      <CheckCircle2 className={clsx('w-4 h-4', autoOptimize && 'text-green-600')} />
                      <span className="text-sm">{autoOptimize ? 'Enabled' : 'Disabled'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Search and select all */}
              <div className="p-4 border-b border-gray-200 flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, address, phone..."
                    className="input pl-10 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={selectAll}
                  className="btn-secondary text-sm whitespace-nowrap"
                >
                  {filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length
                    ? 'Deselect All'
                    : `Select All (${filteredOrders.length})`}
                </button>
              </div>

              {/* Orders list */}
              <div className="flex-1 overflow-y-auto">
                {filteredOrders.length === 0 ? (
                  <div className="p-8 text-center">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      {searchQuery ? 'No orders match your search' : 'No pending orders available'}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredOrders.map((order: any) => (
                      <label
                        key={order.id}
                        className={clsx(
                          'flex items-center gap-4 p-4 cursor-pointer transition-colors',
                          selectedOrders.includes(order.id) 
                            ? 'bg-navy-50 border-l-4 border-navy-600' 
                            : 'hover:bg-gray-50 border-l-4 border-transparent'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => toggleOrder(order.id)}
                          className="w-5 h-5 rounded border-gray-300 text-navy-600 focus:ring-navy-500"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">{order.customer_name}</p>
                            {order.is_cod && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                COD: GHS {order.cod_amount}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {order.delivery_address}
                          </p>
                          <p className="text-sm text-gray-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" />
                            {order.customer_phone}
                          </p>
                        </div>
                        {order.tracking_id && (
                          <span className="text-xs text-gray-400 font-mono">
                            #{order.tracking_id.slice(-6)}
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Step 2: Assign Rider */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left: Selected orders summary */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Selected Orders ({selectedOrders.length})
                    </h3>
                    <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                      {selectedOrderObjects.map((order: any, index: number) => (
                        <div
                          key={order.id}
                          className="flex items-center gap-3 p-3 border-b border-gray-100 last:border-0"
                        >
                          <span className="w-6 h-6 bg-navy-100 text-navy-700 rounded-full flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {order.customer_name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {order.delivery_address}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeOrder(order.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    {/* Summary stats */}
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Total Stops</p>
                        <p className="text-xl font-bold text-gray-900">{totals.orders}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">COD to Collect</p>
                        <p className="text-xl font-bold text-green-600">GHS {totals.cod.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Rider selection */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Assign Rider (Optional)
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Select a rider to assign this route immediately, or leave empty to assign later.
                    </p>
                    
                    <div className="space-y-2">
                      {/* No rider option */}
                      <label
                        className={clsx(
                          'flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors',
                          selectedRiderId === null
                            ? 'border-navy-600 bg-navy-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <input
                          type="radio"
                          name="rider"
                          checked={selectedRiderId === null}
                          onChange={() => setSelectedRiderId(null)}
                          className="w-4 h-4 text-navy-600"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">Assign Later</p>
                          <p className="text-sm text-gray-500">Create route without assigning a rider</p>
                        </div>
                      </label>

                      {availableRiders.length === 0 ? (
                        <div className="p-4 bg-yellow-50 rounded-lg text-center">
                          <p className="text-sm text-yellow-700">No available riders</p>
                          <p className="text-xs text-yellow-600 mt-1">Add riders in the Riders page</p>
                        </div>
                      ) : (
                        availableRiders.map((rider: any) => (
                          <label
                            key={rider.id}
                            className={clsx(
                              'flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors',
                              selectedRiderId === rider.id
                                ? 'border-navy-600 bg-navy-50'
                                : 'border-gray-200 hover:border-gray-300'
                            )}
                          >
                            <input
                              type="radio"
                              name="rider"
                              checked={selectedRiderId === rider.id}
                              onChange={() => setSelectedRiderId(rider.id)}
                              className="w-4 h-4 text-navy-600"
                            />
                            <div className="w-10 h-10 bg-navy-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-navy-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{rider.name}</p>
                              <p className="text-sm text-gray-500">{rider.phone_number}</p>
                            </div>
                            <div className="text-right">
                              <span className={clsx(
                                'px-2 py-1 rounded-full text-xs font-medium',
                                rider.vehicle_type === 'motorbike' 
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-purple-100 text-purple-700'
                              )}>
                                {rider.vehicle_type === 'motorbike' ? '🏍️ Bike' : '🚐 Van'}
                              </span>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            {/* Error message */}
            {error && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {selectedOrders.length > 0 && (
                  <span className="font-medium">{selectedOrders.length} orders selected</span>
                )}
                {totals.cod > 0 && (
                  <span className="ml-3 text-green-600">• GHS {totals.cod.toFixed(2)} COD</span>
                )}
              </div>
              <div className="flex gap-3">
                {step === 'assign' && (
                  <button
                    type="button"
                    onClick={() => setStep('orders')}
                    className="btn-secondary"
                    disabled={createMutation.isPending}
                  >
                    Back
                  </button>
                )}
                <button type="button" onClick={onClose} className="btn-secondary" disabled={createMutation.isPending}>
                  Cancel
                </button>
                {step === 'orders' ? (
                  <button
                    type="button"
                    onClick={() => setStep('assign')}
                    disabled={selectedOrders.length === 0}
                    className="btn-primary flex items-center gap-2"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={selectedOrders.length === 0 || createMutation.isPending}
                    className="btn-primary min-w-[160px]"
                  >
                    {createMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : (
                      <>
                        Create Route
                        {autoOptimize && ' & Optimize'}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function RouteDetailsModal({
  route,
  onClose,
}: {
  route:  any;
  onClose: () => void;
}) {
  const { data: routeDetails } = useQuery({
    queryKey: ['route', route.id],
    queryFn: () => api.getRoute(route.id),
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {route.name || `Route #${route.id}`}
            </h2>
            <p className="text-sm text-gray-500">{route.route_date}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="font-medium text-gray-900 mb-4">Delivery Sequence</h3>
          <div className="space-y-3">
            {routeDetails?.stops?.map((stop: any, index: number) => (
              <div
                key={stop. id}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{stop.customer_name}</p>
                  <p className="text-sm text-gray-500">{stop. customer_phone}</p>
                  <p className="text-sm text-gray-600 mt-1">{stop.address}</p>
                  {stop.is_cod && (
                    <p className="text-sm font-medium text-green-600 mt-1">
                      COD: GHS {stop.cod_amount}
                    </p>
                  )}
                </div>
                {stop.distance_from_previous_km && (
                  <div className="text-right text-sm text-gray-500">
                    <p>{stop.distance_from_previous_km. toFixed(1)} km</p>
                    <p>{Math.round(stop.duration_from_previous_minutes)} min</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}