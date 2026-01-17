'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Plus, 
  Phone, 
  Bike, 
  Truck, 
  MoreVertical, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Key, 
  Lock,
  Star,
  TrendingUp,
  MapPin,
  Search,
  Filter,
  X,
  AlertCircle,
  RefreshCw,
  BarChart3,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import clsx from 'clsx';
import api from '@/lib/api';
import { StatsCard } from '@/components/ui/stats-card';

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  available: { label: 'Available', color: 'text-green-700', bgColor: 'bg-green-100' },
  on_route: { label: 'On Route', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  offline: { label: 'Offline', color: 'text-slate-600', bgColor: 'bg-slate-100' },
};

export default function RidersPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRider, setSelectedRider] = useState<any>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [activeMenu, setActiveMenu] = useState<number | null>(null);

  const { data: riders, isLoading, refetch } = useQuery({
    queryKey: ['riders'],
    queryFn: () => api.getRiders(),
  });

  // Filter riders
  const filteredRiders = useMemo(() => {
    if (!riders) return [];
    let result = riders;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((rider: any) => 
        rider.name?.toLowerCase().includes(query) ||
        rider.phone_number?.includes(query)
      );
    }
    
    if (statusFilter) {
      result = result.filter((rider: any) => rider.status === statusFilter);
    }
    
    return result;
  }, [riders, searchQuery, statusFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!riders) return { total: 0, available: 0, onRoute: 0, avgRating: 0 };
    return {
      total: riders.length,
      available: riders.filter((r: any) => r.status === 'available').length,
      onRoute: riders.filter((r: any) => r.status === 'on_route').length,
      avgRating: riders.length > 0 
        ? (riders.reduce((sum: number, r: any) => sum + (r.average_rating || 0), 0) / riders.length).toFixed(1)
        : 0,
    };
  }, [riders]);

  const handleSetPin = (rider: any) => {
    setActiveMenu(null);
    setSelectedRider(rider);
    setShowPinModal(true);
  };

  const handleEditRider = (rider: any) => {
    setActiveMenu(null);
    setSelectedRider(rider);
    setShowEditModal(true);
  };

  const handleDeleteRider = (rider: any) => {
    setActiveMenu(null);
    setSelectedRider(rider);
    setShowDeleteModal(true);
  };

  const toggleMenu = (riderId: number) => {
    setActiveMenu(activeMenu === riderId ? null : riderId);
  };

  return (
    <div className="space-y-6" onClick={() => setActiveMenu(null)}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Riders</h1>
          <p className="text-slate-600 mt-1">Manage your delivery personnel and track performance</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => refetch()}
            className="btn-secondary"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            Add Rider
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Riders"
          value={stats.total}
          icon={Users}
          variant="primary"
        />
        <StatsCard
          title="Available"
          value={stats.available}
          icon={CheckCircle2}
          variant="success"
        />
        <StatsCard
          title="On Route"
          value={stats.onRoute}
          icon={MapPin}
          variant="warning"
        />
        <StatsCard
          title="Avg Rating"
          value={`⭐ ${stats.avgRating}`}
          icon={Star}
          variant="default"
        />
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-auto min-w-[150px]"
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="on_route">On Route</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>

      {/* Riders grid */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-3" />
            <p className="text-slate-500">Loading riders...</p>
          </div>
        </div>
      ) : filteredRiders?.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-soft text-center py-16 px-6">
          <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {searchQuery || statusFilter ? 'No riders found' : 'No riders yet'}
          </h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            {searchQuery || statusFilter 
              ? 'Try adjusting your search or filter criteria' 
              : 'Add your first rider to start assigning routes and tracking deliveries'}
          </p>
          {!searchQuery && !statusFilter && (
            <button onClick={() => setShowAddModal(true)} className="btn-primary">
              <Plus className="w-4 h-4" />
              Add Your First Rider
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRiders?.map((rider: any) => {
            const status = statusConfig[rider.status] || statusConfig.offline;
            const successRate = rider.total_deliveries > 0 
              ? Math.round((rider.successful_deliveries / rider.total_deliveries) * 100) 
              : 0;
            
            return (
              <div 
                key={rider.id} 
                className="bg-white rounded-2xl border border-slate-200/60 shadow-soft overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Header with avatar and status */}
                <div className="p-5 border-b border-slate-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-14 h-14 bg-gradient-to-br from-navy-500 to-navy-700 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-xl font-bold text-white">{rider.name.charAt(0)}</span>
                        </div>
                        {rider.status === 'available' && (
                          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 text-lg">{rider.name}</h3>
                        <div className="flex items-center gap-1.5 text-sm text-slate-500">
                          <Phone className="w-3.5 h-3.5" />
                          {rider.phone_number}
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions Menu */}
                    <div className="relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleMenu(rider.id); }}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-slate-400" />
                      </button>
                      
                      {activeMenu === rider.id && (
                        <div 
                          className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-20"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleSetPin(rider)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Key className="w-4 h-4 text-amber-500" />
                            Set Login PIN
                          </button>
                          <button
                            onClick={() => handleEditRider(rider)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Edit3 className="w-4 h-4 text-blue-500" />
                            Edit Details
                          </button>
                          <button
                            onClick={() => router.push(`/dashboard/riders/performance/${rider.id}`)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <BarChart3 className="w-4 h-4 text-green-500" />
                            View Performance
                          </button>
                          <div className="border-t border-slate-100 my-1" />
                          <button
                            onClick={() => handleDeleteRider(rider)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Rider
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="mt-3">
                    <span className={clsx(
                      'px-3 py-1 rounded-full text-xs font-semibold',
                      status.bgColor,
                      status.color
                    )}>
                      {status.label}
                    </span>
                  </div>
                </div>

                {/* Vehicle info */}
                <div className="px-5 py-3 bg-slate-50 flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    {rider.vehicle_type === 'van' ? (
                      <Truck className="w-4 h-4 text-slate-400" />
                    ) : (
                      <Bike className="w-4 h-4 text-slate-400" />
                    )}
                    <span className="capitalize font-medium">{rider.vehicle_type}</span>
                  </div>
                  {rider.vehicle_registration && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="text-sm text-slate-500 font-mono">{rider.vehicle_registration}</span>
                    </>
                  )}
                </div>

                {/* Performance stats */}
                <div className="p-5">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-900">{rider.total_deliveries}</p>
                      <p className="text-xs text-slate-500 font-medium">Deliveries</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{successRate}%</p>
                      <p className="text-xs text-slate-500 font-medium">Success</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-amber-500">⭐ {rider.average_rating?.toFixed(1) || '0.0'}</p>
                      <p className="text-xs text-slate-500 font-medium">Rating</p>
                    </div>
                  </div>

                  {/* Success rate bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500">Performance</span>
                      <span className="text-slate-700 font-medium">{successRate}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={clsx(
                          'h-full rounded-full transition-all',
                          successRate >= 80 ? 'bg-green-500' : successRate >= 60 ? 'bg-amber-500' : 'bg-red-500'
                        )}
                        style={{ width: `${successRate}%` }}
                      />
                    </div>
                  </div>

                  {/* Set PIN Button */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditRider(rider)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-50 text-blue-700 rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors text-sm font-medium"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleSetPin(rider)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-50 text-amber-700 rounded-xl border border-amber-200 hover:bg-amber-100 transition-colors text-sm font-medium"
                    >
                      <Key className="w-4 h-4" />
                      Set PIN
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Rider Modal */}
      {showAddModal && <AddRiderModal onClose={() => setShowAddModal(false)} />}
      
      {/* Edit Rider Modal */}
      {showEditModal && selectedRider && (
        <EditRiderModal 
          rider={selectedRider} 
          onClose={() => {
            setShowEditModal(false);
            setSelectedRider(null);
          }} 
        />
      )}
      
      {/* Delete Rider Modal */}
      {showDeleteModal && selectedRider && (
        <DeleteRiderModal 
          rider={selectedRider} 
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedRider(null);
          }} 
        />
      )}
      
      {/* Set PIN Modal */}
      {showPinModal && selectedRider && (
        <SetPinModal 
          rider={selectedRider} 
          onClose={() => {
            setShowPinModal(false);
            setSelectedRider(null);
          }} 
        />
      )}
    </div>
  );
}

function AddRiderModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    vehicle_type: 'motorbike',
    vehicle_registration: '',
  });
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createRider(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['riders'] });
      onClose();
    },
    onError: (err: any) => {
      // Handle different error formats from DRF
      const errorData = err?.response?.data;
      if (errorData) {
        // Check for field-level errors (DRF format)
        if (errorData.phone_number) {
          const phoneError = Array.isArray(errorData.phone_number) 
            ? errorData.phone_number[0] 
            : errorData.phone_number;
          setError(`Phone number: ${phoneError}`);
        } else if (errorData.name) {
          const nameError = Array.isArray(errorData.name) 
            ? errorData.name[0] 
            : errorData.name;
          setError(`Name: ${nameError}`);
        } else if (errorData.detail) {
          setError(errorData.detail);
        } else if (typeof errorData === 'object') {
          // Try to extract first error from any field
          const firstError = Object.entries(errorData).find(([_, v]) => v);
          if (firstError) {
            const [field, value] = firstError;
            const errorMsg = Array.isArray(value) ? value[0] : value;
            setError(`${field}: ${errorMsg}`);
          } else {
            setError('Failed to add rider. Please try again.');
          }
        } else {
          setError('Failed to add rider. Please try again.');
        }
      } else {
        setError('Failed to add rider. Please check your connection and try again.');
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Basic validation
    if (!formData.name.trim()) {
      setError('Please enter a rider name');
      return;
    }
    
    // Phone number validation
    const phoneClean = formData.phone_number.replace(/[\s-]/g, '');
    if (!phoneClean || phoneClean.length < 10) {
      setError('Please enter a valid phone number (at least 10 digits)');
      return;
    }
    
    createMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Add New Rider</h2>
            <p className="text-sm text-slate-500">Enter rider details</p>
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
          <div>
            <label className="label">Full Name *</label>
            <input
              type="text"
              required
              className="input"
              placeholder="Enter rider's full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Phone Number *</label>
            <input
              type="tel"
              required
              className="input"
              placeholder="+233 XX XXX XXXX"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
            />
            <p className="text-xs text-slate-500 mt-1">This will be used for rider app login</p>
          </div>
          <div>
            <label className="label">Vehicle Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, vehicle_type: 'motorbike' })}
                className={clsx(
                  'flex items-center gap-3 p-4 rounded-xl border-2 transition-all',
                  formData.vehicle_type === 'motorbike'
                    ? 'border-navy-500 bg-navy-50'
                    : 'border-slate-200 hover:border-slate-300'
                )}
              >
                <Bike className={clsx('w-6 h-6', formData.vehicle_type === 'motorbike' ? 'text-navy-600' : 'text-slate-400')} />
                <span className={clsx('font-medium', formData.vehicle_type === 'motorbike' ? 'text-navy-700' : 'text-slate-600')}>
                  Motorbike
                </span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, vehicle_type: 'van' })}
                className={clsx(
                  'flex items-center gap-3 p-4 rounded-xl border-2 transition-all',
                  formData.vehicle_type === 'van'
                    ? 'border-navy-500 bg-navy-50'
                    : 'border-slate-200 hover:border-slate-300'
                )}
              >
                <Truck className={clsx('w-6 h-6', formData.vehicle_type === 'van' ? 'text-navy-600' : 'text-slate-400')} />
                <span className={clsx('font-medium', formData.vehicle_type === 'van' ? 'text-navy-700' : 'text-slate-600')}>
                  Van
                </span>
              </button>
            </div>
          </div>
          <div>
            <label className="label">Vehicle Registration (Optional)</label>
            <input
              type="text"
              className="input"
              placeholder="e.g., GR-1234-21"
              value={formData.vehicle_registration}
              onChange={(e) => setFormData({ ...formData, vehicle_registration: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={createMutation.isPending} className="btn-primary flex-1">
              {createMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Rider
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditRiderModal({ rider, onClose }: { rider: any; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: rider.name || '',
    phone_number: rider.phone_number || '',
    vehicle_type: rider.vehicle_type || 'motorbike',
    vehicle_registration: rider.vehicle_registration || '',
    status: rider.status || 'offline',
    is_active: rider.is_active ?? true,
  });
  const [error, setError] = useState<string | null>(null);

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.updateRider(rider.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['riders'] });
      onClose();
    },
    onError: (err: any) => {
      const errorData = err?.response?.data;
      if (errorData?.phone_number) {
        setError(`Phone number: ${Array.isArray(errorData.phone_number) ? errorData.phone_number[0] : errorData.phone_number}`);
      } else if (errorData?.detail) {
        setError(errorData.detail);
      } else {
        setError('Failed to update rider. Please try again.');
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    updateMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Edit Rider</h2>
            <p className="text-sm text-slate-500">Update rider details</p>
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
          <div>
            <label className="label">Full Name *</label>
            <input
              type="text"
              required
              className="input"
              placeholder="Enter rider's full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Phone Number *</label>
            <input
              type="tel"
              required
              className="input"
              placeholder="+233 XX XXX XXXX"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Vehicle Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, vehicle_type: 'motorbike' })}
                className={clsx(
                  'flex items-center gap-3 p-4 rounded-xl border-2 transition-all',
                  formData.vehicle_type === 'motorbike'
                    ? 'border-navy-500 bg-navy-50'
                    : 'border-slate-200 hover:border-slate-300'
                )}
              >
                <Bike className={clsx('w-6 h-6', formData.vehicle_type === 'motorbike' ? 'text-navy-600' : 'text-slate-400')} />
                <span className={clsx('font-medium', formData.vehicle_type === 'motorbike' ? 'text-navy-700' : 'text-slate-600')}>
                  Motorbike
                </span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, vehicle_type: 'van' })}
                className={clsx(
                  'flex items-center gap-3 p-4 rounded-xl border-2 transition-all',
                  formData.vehicle_type === 'van'
                    ? 'border-navy-500 bg-navy-50'
                    : 'border-slate-200 hover:border-slate-300'
                )}
              >
                <Truck className={clsx('w-6 h-6', formData.vehicle_type === 'van' ? 'text-navy-600' : 'text-slate-400')} />
                <span className={clsx('font-medium', formData.vehicle_type === 'van' ? 'text-navy-700' : 'text-slate-600')}>
                  Van
                </span>
              </button>
            </div>
          </div>
          <div>
            <label className="label">Vehicle Registration</label>
            <input
              type="text"
              className="input"
              placeholder="e.g., GR-1234-21"
              value={formData.vehicle_registration}
              onChange={(e) => setFormData({ ...formData, vehicle_registration: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="available">Available</option>
              <option value="on_route">On Route</option>
              <option value="offline">Offline</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-navy-600 rounded border-slate-300 focus:ring-navy-500"
            />
            <label htmlFor="is_active" className="text-sm text-slate-700">
              Active rider (can be assigned to routes)
            </label>
          </div>
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={updateMutation.isPending} className="btn-primary flex-1">
              {updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteRiderModal({ rider, onClose }: { rider: any; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteRider(rider.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['riders'] });
      onClose();
    },
    onError: (err: any) => {
      setError(err?.response?.data?.detail || 'Failed to delete rider. Please try again.');
    },
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Delete Rider?</h2>
          <p className="text-slate-500">
            Are you sure you want to delete <strong>{rider.name}</strong>? This action cannot be undone.
          </p>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
          
          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button 
              onClick={() => deleteMutation.mutate()} 
              disabled={deleteMutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold disabled:opacity-50"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SetPinModal({ rider, onClose }: { rider: any; onClose: () => void }) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const setPinMutation = useMutation({
    mutationFn: () => api.setRiderPin(rider.id, pin),
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || 'Failed to set PIN');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    setPinMutation.mutate();
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">PIN Set Successfully!</h3>
          <p className="text-gray-600">
            <strong>{rider.name}</strong> can now login to the Rider Portal using:
          </p>
          <div className="mt-4 p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500">Phone Number</p>
            <p className="font-mono font-semibold text-gray-900">{rider.phone_number}</p>
            <p className="text-sm text-gray-500 mt-3">PIN</p>
            <p className="font-mono font-semibold text-gray-900 tracking-widest">{pin}</p>
          </div>
          <p className="text-xs text-amber-600 mt-4">
            ⚠️ Share these credentials securely with the rider
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Set Login PIN</h2>
          <p className="text-gray-500 text-sm mt-1">
            Set a 4-digit PIN for <strong>{rider.name}</strong> to access the Rider Portal
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-blue-600">{rider.name.charAt(0)}</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{rider.name}</p>
                <p className="text-sm text-gray-500">{rider.phone_number}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="label">New 4-Digit PIN *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                required
                className="input pl-10 text-center tracking-[0.5em] font-mono"
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              />
            </div>
          </div>

          <div>
            <label className="label">Confirm PIN *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                required
                className="input pl-10 text-center tracking-[0.5em] font-mono"
                placeholder="••••"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={setPinMutation.isPending || pin.length !== 4} 
              className="btn-primary flex-1"
            >
              {setPinMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                'Set PIN'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}