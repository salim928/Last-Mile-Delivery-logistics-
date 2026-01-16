'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Navigation, 
  Camera, 
  CheckCircle, 
  XCircle, 
  Phone,
  MapPin,
  Banknote,
  Package,
  Clock,
  History,
  User,
  LogOut,
  ChevronRight,
  Loader2,
  AlertCircle,
  Check,
  X,
  RefreshCw,
  Zap,
  TrendingUp,
  Award,
  Bell,
  Settings,
  Shield,
  Star,
  Calendar,
  CircleDollarSign,
  Route,
} from 'lucide-react';

// API helper
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const apiCall = async (endpoint: string, token: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (!response.ok) throw new Error('API call failed');
  return response.json();
};

// Types
interface DeliveryStop {
  id: number;
  order_id: number;
  sequence: number;
  customer_name: string;
  customer_phone: string;
  address: string;
  city: string;
  is_cod: boolean;
  cod_amount: number;
  status: 'pending' | 'in_transit' | 'delivered' | 'failed';
  notes?: string;
  package_size?: string;
}

interface ActiveRoute {
  id: number;
  name: string;
  date: string;
  status: string;
  total_stops: number;
  completed_stops: number;
  total_distance_km: number;
  total_cod: number;
  stops: DeliveryStop[];
}

// Auth Hook
function useRiderAuth() {
  const [rider, setRider] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('rider_token');
    const savedRider = localStorage.getItem('rider_data');
    if (savedToken && savedRider) {
      setToken(savedToken);
      setRider(JSON.parse(savedRider));
    }
    setIsHydrated(true);
  }, []);

  const login = async (phone: string, pin: string) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/riders/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, pin }),
      });
      
      if (!response.ok) throw new Error('Login failed');
      
      const data = await response.json();
      setToken(data.access);
      setRider(data.rider);
      localStorage.setItem('rider_token', data.access);
      localStorage.setItem('rider_data', JSON.stringify(data.rider));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setRider(null);
    localStorage.removeItem('rider_token');
    localStorage.removeItem('rider_data');
  };

  return { rider, token, isAuthenticated: !!token, isHydrated, login, logout };
}

// Main App
export default function RiderApp() {
  const { rider, token, isAuthenticated, isHydrated, login, logout } = useRiderAuth();

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-3xl">🚚</span>
          </div>
          <p className="text-white/70">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen login={login} />;
  }

  return <MainApp rider={rider} token={token!} logout={logout} />;
}

// Login Screen
function LoginScreen({ login }: { login: (phone: string, pin: string) => Promise<boolean> }) {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError('');
    
    const success = await login(phone, pin);
    if (!success) {
      setError('Invalid phone number or PIN');
    }
    setLoading(false);
  };

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      // Auto-submit when PIN is complete
      if (newPin.length === 4) {
        setTimeout(() => handleLogin(), 300);
      }
    }
  };

  const handlePinDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-24 h-24 bg-white/10 backdrop-blur rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
          <span className="text-5xl">🚚</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Rider Portal</h1>
        <p className="text-white/60 text-center">Last-Mile Delivery Optimizer</p>
      </div>

      {/* Login Form */}
      <div className="bg-white rounded-t-[32px] p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">
          {showPin ? 'Enter Your PIN' : 'Sign In'}
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {!showPin ? (
          <form onSubmit={(e) => { e.preventDefault(); if (phone.length >= 9) setShowPin(true); }}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  🇬🇭 +233
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="055 123 4567"
                  className="w-full pl-20 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={phone.length < 9}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-2xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all shadow-lg shadow-blue-500/25"
            >
              Continue
            </button>
          </form>
        ) : (
          <div>
            {/* PIN Display */}
            <div className="flex justify-center gap-4 mb-8">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all ${
                    pin.length > i
                      ? 'bg-blue-500 border-blue-500 scale-105'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  {pin.length > i && (
                    <div className="w-3 h-3 bg-white rounded-full" />
                  )}
                </div>
              ))}
            </div>

            {/* PIN Keypad */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handlePinInput(digit.toString())}
                  className="h-16 bg-slate-100 rounded-2xl text-2xl font-semibold text-slate-800 active:bg-slate-200 active:scale-95 transition-all"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={() => { setShowPin(false); setPin(''); }}
                className="h-16 bg-slate-100 rounded-2xl text-slate-500 active:bg-slate-200 transition-all flex items-center justify-center"
              >
                <ChevronRight className="w-6 h-6 rotate-180" />
              </button>
              <button
                type="button"
                onClick={() => handlePinInput('0')}
                className="h-16 bg-slate-100 rounded-2xl text-2xl font-semibold text-slate-800 active:bg-slate-200 active:scale-95 transition-all"
              >
                0
              </button>
              <button
                type="button"
                onClick={handlePinDelete}
                className="h-16 bg-slate-100 rounded-2xl text-slate-500 active:bg-slate-200 transition-all flex items-center justify-center"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={pin.length !== 4 || loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-2xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        )}

        <p className="text-center text-slate-500 text-sm mt-6">
          Having trouble? Contact your dispatcher
        </p>
      </div>
    </div>
  );
}

// Main App with Tabs
function MainApp({ rider, token, logout }: { rider: any; token: string; logout: () => void }) {
  const [activeTab, setActiveTab] = useState<'deliveries' | 'history' | 'earnings' | 'profile'>('deliveries');
  const [activeRoute, setActiveRoute] = useState<ActiveRoute | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActiveRoute = useCallback(async () => {
    try {
      const data = await apiCall('/api/v1/riders/portal/active-route/', token);
      setActiveRoute(data);
    } catch (error) {
      console.log('No active route');
      setActiveRoute(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchActiveRoute();
    const interval = setInterval(fetchActiveRoute, 30000);
    return () => clearInterval(interval);
  }, [fetchActiveRoute]);

  // Update location periodically
  useEffect(() => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        async (position) => {
          try {
            await apiCall('/api/v1/riders/portal/update-location/', token, {
              method: 'POST',
              body: JSON.stringify({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              }),
            });
          } catch (error) {
            console.error('Failed to update location');
          }
        },
        (error) => console.error('Geolocation error:', error),
        { enableHighAccuracy: true, maximumAge: 30000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [token]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchActiveRoute();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white px-4 pt-12 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center">
              <span className="text-2xl">🚚</span>
            </div>
            <div>
              <p className="text-white/60 text-xs">Welcome back</p>
              <h1 className="font-bold text-lg">{rider?.name || 'Rider'}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleRefresh}
              className="w-10 h-10 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center active:scale-95 transition-transform"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button className="w-10 h-10 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center relative active:scale-95 transition-transform">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold">
                2
              </span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        {activeRoute && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{activeRoute.completed_stops}/{activeRoute.total_stops}</p>
              <p className="text-white/60 text-xs">Deliveries</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{activeRoute.total_distance_km || 0}</p>
              <p className="text-white/60 text-xs">Km Total</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">GHS {activeRoute.total_cod || 0}</p>
              <p className="text-white/60 text-xs">COD Total</p>
            </div>
          </div>
        )}

        {/* Progress bar */}
        {activeRoute && activeRoute.total_stops > 0 && (
          <div>
            <div className="flex justify-between text-xs text-white/60 mb-1">
              <span>Today's Progress</span>
              <span>{Math.round((activeRoute.completed_stops / activeRoute.total_stops) * 100)}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500 rounded-full"
                style={{ width: `${(activeRoute.completed_stops / activeRoute.total_stops) * 100}%` }}
              />
            </div>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-24 -mt-2">
        <div className="bg-slate-100 rounded-t-3xl min-h-full">
          {activeTab === 'deliveries' && (
            <DeliveriesTab 
              route={activeRoute} 
              loading={loading} 
              token={token}
              onUpdate={fetchActiveRoute}
            />
          )}
          {activeTab === 'history' && <HistoryTab token={token} />}
          {activeTab === 'earnings' && <EarningsTab token={token} rider={rider} />}
          {activeTab === 'profile' && <ProfileTab rider={rider} logout={logout} />}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg">
        <div className="grid grid-cols-4 gap-1 p-2 pb-6">
          {[
            { id: 'deliveries', icon: Package, label: 'Deliveries' },
            { id: 'history', icon: History, label: 'History' },
            { id: 'earnings', icon: CircleDollarSign, label: 'Earnings' },
            { id: 'profile', icon: User, label: 'Profile' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all active:scale-95 ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <tab.icon className="w-6 h-6" />
              <span className="text-xs font-medium mt-1">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

// Deliveries Tab
function DeliveriesTab({ route, loading, token, onUpdate }: { 
  route: ActiveRoute | null; 
  loading: boolean;
  token: string;
  onUpdate: () => void;
}) {
  const [selectedStop, setSelectedStop] = useState<DeliveryStop | null>(null);
  const [showPOD, setShowPOD] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-3" />
          <p className="text-slate-500">Loading your route...</p>
        </div>
      </div>
    );
  }

  if (!route || !route.stops || route.stops.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-3xl p-8 text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Active Route</h3>
          <p className="text-slate-500 mb-6">
            You don't have any deliveries assigned yet. Check back soon or contact your dispatcher.
          </p>
          <button className="bg-blue-50 text-blue-600 px-6 py-3 rounded-xl font-medium active:scale-95 transition-transform">
            <Phone className="w-4 h-4 inline mr-2" />
            Contact Dispatch
          </button>
        </div>
      </div>
    );
  }

  const pendingStops = route.stops.filter(s => s.status === 'pending' || s.status === 'in_transit');
  const currentStop = pendingStops[0];

  return (
    <div className="p-4 space-y-4">
      {/* Current Delivery Card */}
      {currentStop && (
        <div>
          <p className="text-sm font-medium text-slate-500 mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Current Delivery
          </p>
          <DeliveryCard 
            stop={currentStop} 
            isCurrent 
            onSelect={() => setSelectedStop(currentStop)}
            onDeliver={() => { setSelectedStop(currentStop); setShowPOD(true); }}
          />
        </div>
      )}

      {/* Upcoming Deliveries */}
      {pendingStops.length > 1 && (
        <div>
          <p className="text-sm font-medium text-slate-500 mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Up Next ({pendingStops.length - 1} remaining)
          </p>
          <div className="space-y-3">
            {pendingStops.slice(1).map((stop) => (
              <DeliveryCard 
                key={stop.id} 
                stop={stop} 
                onSelect={() => setSelectedStop(stop)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Today */}
      {route.completed_stops > 0 && (
        <div className="bg-emerald-50 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Check className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-emerald-800">{route.completed_stops} Completed</p>
            <p className="text-emerald-600 text-sm">Great job! Keep going 💪</p>
          </div>
        </div>
      )}

      {/* Stop Details Modal */}
      {selectedStop && !showPOD && (
        <StopDetailsModal 
          stop={selectedStop} 
          onClose={() => setSelectedStop(null)}
          onDeliver={() => setShowPOD(true)}
        />
      )}

      {/* POD Capture Modal */}
      {showPOD && selectedStop && (
        <PODCaptureModal
          stop={selectedStop}
          token={token}
          onClose={() => { setShowPOD(false); setSelectedStop(null); }}
          onSuccess={() => { 
            setShowPOD(false); 
            setSelectedStop(null); 
            onUpdate();
          }}
        />
      )}
    </div>
  );
}

// Delivery Card Component
function DeliveryCard({ stop, isCurrent, onSelect, onDeliver }: { 
  stop: DeliveryStop; 
  isCurrent?: boolean;
  onSelect: () => void;
  onDeliver?: () => void;
}) {
  const handleNavigate = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(stop.address + ', ' + (stop.city || 'Ghana'))}`;
    window.open(url, '_blank');
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `tel:${stop.customer_phone}`;
  };

  return (
    <div 
      onClick={onSelect}
      className={`bg-white rounded-2xl shadow-sm overflow-hidden active:scale-[0.99] transition-all cursor-pointer ${
        isCurrent ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/10' : 'hover:shadow-md'
      }`}
    >
      {/* Header */}
      <div className={`p-4 ${isCurrent ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' : 'bg-slate-50'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${
            isCurrent ? 'bg-white/20 text-white' : 'bg-white text-slate-700 shadow-sm'
          }`}>
            {stop.sequence}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`font-bold truncate ${isCurrent ? 'text-white' : 'text-slate-900'}`}>
              {stop.customer_name}
            </h3>
            <p className={`text-sm truncate ${isCurrent ? 'text-white/70' : 'text-slate-500'}`}>
              {stop.address}
            </p>
          </div>
          {stop.is_cod && (
            <div className={`px-3 py-1 rounded-full text-sm font-bold ${
              isCurrent ? 'bg-amber-400 text-amber-900' : 'bg-amber-100 text-amber-700'
            }`}>
              GHS {stop.cod_amount}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="p-3 flex gap-2">
        <button
          onClick={handleNavigate}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-3 rounded-xl font-medium active:scale-95 transition-transform"
        >
          <Navigation className="w-5 h-5" />
          Navigate
        </button>
        <button
          onClick={handleCall}
          className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-3 rounded-xl font-medium active:scale-95 transition-transform"
        >
          <Phone className="w-5 h-5" />
          Call
        </button>
        {isCurrent && onDeliver && (
          <button
            onClick={(e) => { e.stopPropagation(); onDeliver(); }}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 rounded-xl font-medium active:scale-95 transition-transform shadow-lg shadow-emerald-500/25"
          >
            <CheckCircle className="w-5 h-5" />
            Deliver
          </button>
        )}
      </div>
    </div>
  );
}

// Stop Details Modal
function StopDetailsModal({ stop, onClose, onDeliver }: { 
  stop: DeliveryStop; 
  onClose: () => void;
  onDeliver: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div 
        className="relative w-full bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2 sticky top-0 bg-white">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Stop #{stop.sequence}</p>
              <h2 className="text-xl font-bold text-slate-900">{stop.customer_name}</h2>
            </div>
            <button onClick={onClose} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Address */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Delivery Address</p>
              <p className="font-medium text-slate-900">{stop.address}</p>
              <p className="text-slate-600">{stop.city || 'Ghana'}</p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Phone Number</p>
              <p className="font-medium text-slate-900">{stop.customer_phone}</p>
            </div>
          </div>

          {/* COD */}
          {stop.is_cod && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Banknote className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Cash on Delivery</p>
                <p className="text-2xl font-bold text-amber-600">GHS {stop.cod_amount}</p>
              </div>
            </div>
          )}

          {/* Package Info */}
          {stop.package_size && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Package Size</p>
                <p className="font-medium text-slate-900 capitalize">{stop.package_size}</p>
              </div>
            </div>
          )}

          {/* Notes */}
          {stop.notes && (
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm text-slate-500 mb-1">Special Instructions</p>
              <p className="text-slate-700">{stop.notes}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 grid grid-cols-2 gap-3 pb-8">
          <button
            onClick={() => {
              const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(stop.address + ', ' + (stop.city || 'Ghana'))}`;
              window.open(url, '_blank');
            }}
            className="flex items-center justify-center gap-2 bg-blue-500 text-white py-4 rounded-2xl font-semibold active:scale-95 transition-transform shadow-lg shadow-blue-500/25"
          >
            <Navigation className="w-5 h-5" />
            Navigate
          </button>
          <button
            onClick={onDeliver}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-2xl font-semibold active:scale-95 transition-transform shadow-lg shadow-emerald-500/25"
          >
            <CheckCircle className="w-5 h-5" />
            Mark Delivered
          </button>
        </div>
      </div>
    </div>
  );
}

// POD Capture Modal
function PODCaptureModal({ stop, token, onClose, onSuccess }: { 
  stop: DeliveryStop;
  token: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [codCollected, setCodCollected] = useState(stop.cod_amount?.toString() || '0');
  const [failReason, setFailReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<'deliver' | 'fail'>('deliver');
  const [error, setError] = useState('');

  const handlePhotoCapture = async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';
      
      input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setPhoto(reader.result as string);
          };
          reader.readAsDataURL(file);
        }
      };
      
      input.click();
    } catch (error) {
      console.error('Camera error:', error);
      setError('Could not access camera');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      if (mode === 'deliver') {
        let position: GeolocationPosition | null = null;
        try {
          position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true });
          });
        } catch (e) {
          console.log('Could not get location');
        }

        await apiCall('/api/v1/pod/', token, {
          method: 'POST',
          body: JSON.stringify({
            order_id: stop.order_id || stop.id,
            photo_base64: photo,
            otp_code: otp || null,
            cod_amount_collected: stop.is_cod ? parseFloat(codCollected) : 0,
            delivery_latitude: position?.coords.latitude,
            delivery_longitude: position?.coords.longitude,
          }),
        });
      } else {
        await apiCall(`/api/v1/orders/${stop.order_id || stop.id}/fail/`, token, {
          method: 'POST',
          body: JSON.stringify({ reason: failReason }),
        });
      }

      onSuccess();
    } catch (err: any) {
      setError('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div 
        className="relative w-full bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2 sticky top-0 bg-white z-10">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
        </div>

        {/* Mode Toggle */}
        <div className="px-6 pb-4">
          <div className="flex bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setMode('deliver')}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                mode === 'deliver' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500'
              }`}
            >
              <CheckCircle className="w-5 h-5 inline mr-2" />
              Delivered
            </button>
            <button
              onClick={() => setMode('fail')}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                mode === 'fail' ? 'bg-white shadow-sm text-red-600' : 'text-slate-500'
              }`}
            >
              <XCircle className="w-5 h-5 inline mr-2" />
              Failed
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-6 mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {mode === 'deliver' ? (
          <div className="px-6 space-y-4">
            {/* Photo Capture */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                📸 Photo Proof
              </label>
              {photo ? (
                <div className="relative rounded-2xl overflow-hidden">
                  <img src={photo} alt="POD" className="w-full h-48 object-cover" />
                  <button
                    onClick={() => setPhoto(null)}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handlePhotoCapture}
                  className="w-full h-48 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-500 active:border-blue-400 active:bg-blue-50 transition-colors"
                >
                  <Camera className="w-10 h-10" />
                  <span>Tap to Take Photo</span>
                </button>
              )}
            </div>

            {/* OTP */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                🔐 Customer OTP (Optional)
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                placeholder="Enter 4-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-2xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* COD */}
            {stop.is_cod && (
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  💵 Cash Collected (GHS)
                </label>
                <input
                  type="number"
                  value={codCollected}
                  onChange={(e) => setCodCollected(e.target.value)}
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {parseFloat(codCollected) !== stop.cod_amount && (
                  <p className="text-amber-600 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Amount differs from expected (GHS {stop.cod_amount})
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="px-6">
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Reason for Failed Delivery
            </label>
            <div className="space-y-2 mb-4">
              {['Customer not available', 'Wrong address', 'Customer refused', 'Cannot access location', 'Other'].map((reason) => (
                <button
                  key={reason}
                  onClick={() => setFailReason(reason)}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    failReason === reason
                      ? 'bg-red-50 border-2 border-red-300 text-red-700'
                      : 'bg-slate-50 border border-slate-200 text-slate-700'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
            {failReason === 'Other' && (
              <textarea
                placeholder="Please describe the reason..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-24"
                onChange={(e) => setFailReason(e.target.value)}
              />
            )}
          </div>
        )}

        {/* Submit Button */}
        <div className="p-6 pb-8">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || (mode === 'fail' && !failReason)}
            className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-transform shadow-lg ${
              mode === 'deliver' 
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-emerald-500/25' 
                : 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-500/25'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : mode === 'deliver' ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Confirm Delivery
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5" />
                Mark as Failed
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// History Tab
function HistoryTab({ token }: { token: string }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await apiCall('/api/v1/riders/portal/history/', token);
        setHistory(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch history');
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-3xl p-8 text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <History className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No History Yet</h3>
          <p className="text-slate-500">Your completed deliveries will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {history.map((item: any, index: number) => (
        <div key={index} className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-slate-900">{item.customer_name}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              item.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
            }`}>
              {item.status}
            </span>
          </div>
          <p className="text-sm text-slate-500 mb-2">{item.address}</p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">{item.delivered_at ? new Date(item.delivered_at).toLocaleDateString() : '-'}</span>
            {item.cod_amount > 0 && (
              <span className="text-amber-600 font-medium">GHS {item.cod_amount}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Earnings Tab
function EarningsTab({ token, rider }: { token: string; rider: any }) {
  return (
    <div className="p-4 space-y-4">
      {/* Today's Earnings */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20">
        <p className="text-white/70 text-sm mb-1">Today's Earnings</p>
        <h2 className="text-4xl font-bold mb-4">GHS 125.00</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur rounded-xl p-3">
            <p className="text-white/70 text-xs">Deliveries</p>
            <p className="text-xl font-bold">12</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-3">
            <p className="text-white/70 text-xs">COD Collected</p>
            <p className="text-xl font-bold">GHS 850</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-sm text-slate-500">This Week</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">GHS 720</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-slate-500">This Month</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">GHS 2,850</p>
        </div>
      </div>

      {/* Performance */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          Performance Rating
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className={`w-6 h-6 ${star <= 4 ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
              ))}
            </div>
            <p className="text-sm text-slate-500">Based on 48 deliveries</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-slate-900">4.8</p>
            <p className="text-emerald-600 text-sm font-medium">Excellent</p>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="font-semibold text-slate-900 mb-3">Recent Transactions</h3>
        <div className="space-y-3">
          {[
            { type: 'delivery', amount: 15, time: '2 hours ago' },
            { type: 'bonus', amount: 25, time: '5 hours ago' },
            { type: 'delivery', amount: 12, time: 'Yesterday' },
          ].map((tx, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  tx.type === 'bonus' ? 'bg-purple-100' : 'bg-emerald-100'
                }`}>
                  {tx.type === 'bonus' ? (
                    <Zap className="w-4 h-4 text-purple-600" />
                  ) : (
                    <Package className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-slate-900 text-sm capitalize">{tx.type}</p>
                  <p className="text-xs text-slate-500">{tx.time}</p>
                </div>
              </div>
              <span className="font-semibold text-emerald-600">+GHS {tx.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Profile Tab
function ProfileTab({ rider, logout }: { rider: any; logout: () => void }) {
  return (
    <div className="p-4 space-y-4">
      {/* Profile Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/20">
          <span className="text-4xl text-white font-bold">
            {rider?.name?.charAt(0) || 'R'}
          </span>
        </div>
        <h2 className="text-xl font-bold text-slate-900">{rider?.name || 'Rider'}</h2>
        <p className="text-slate-500">{rider?.phone}</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
            Active Rider
          </span>
          <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
            ⭐ 4.8
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-slate-900">248</p>
          <p className="text-xs text-slate-500">Total Deliveries</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-slate-900">98%</p>
          <p className="text-xs text-slate-500">Success Rate</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-slate-900">45</p>
          <p className="text-xs text-slate-500">Days Active</p>
        </div>
      </div>

      {/* Menu */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {[
          { icon: Settings, label: 'Settings', color: 'text-slate-600' },
          { icon: Shield, label: 'Privacy & Security', color: 'text-slate-600' },
          { icon: Bell, label: 'Notifications', color: 'text-slate-600' },
          { icon: Phone, label: 'Contact Support', color: 'text-slate-600' },
        ].map((item, i) => (
          <button key={i} className="w-full flex items-center gap-4 p-4 border-b border-slate-100 last:border-0 active:bg-slate-50 transition-colors">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
            <span className="flex-1 text-left font-medium text-slate-700">{item.label}</span>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-4 rounded-2xl font-semibold active:scale-[0.98] transition-transform"
      >
        <LogOut className="w-5 h-5" />
        Sign Out
      </button>

      <p className="text-center text-slate-400 text-sm">
        Version 1.0.0
      </p>
    </div>
  );
}