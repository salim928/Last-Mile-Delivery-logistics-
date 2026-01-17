'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { 
  Package, 
  Truck, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Phone, 
  MessageCircle,
  Navigation,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Share2,
  Star,
  Shield,
  Zap
} from 'lucide-react';
import Link from 'next/link';

// Types
interface DeliveryStatus {
  id: string;
  label: string;
  description: string;
  icon?: React.ElementType;
  completed_at?: string | null;
  completedAt?: string;
}

interface TrackingData {
  tracking_id: string;
  status: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'failed' | 'returned';
  estimated_delivery: string | null;
  actual_delivery: string | null;
  recipient: {
    name: string;
    address: string;
    area: string;
    city: string;
  };
  sender: {
    name: string;
    business_name?: string;
  };
  rider?: {
    name: string;
    phone: string;
    rating: number;
    vehicle_type: string;
  } | null;
  package: {
    description: string;
    weight?: string | null;
    is_cod: boolean;
    cod_amount?: number | null;
  };
  timeline: DeliveryStatus[];
  last_location?: {
    lat: number;
    lng: number;
    timestamp: string;
    area: string;
  } | null;
}

// Map status icons for timeline
const statusIcons: Record<string, React.ElementType> = {
  order_placed: Package,
  assigned: Truck,
  in_transit: Navigation,
  delivered: CheckCircle2,
};

// Status Badge Component
const StatusBadge = ({ status }: { status: TrackingData['status'] }) => {
  const statusConfig = {
    pending: { 
      label: 'Pending', 
      bg: 'bg-yellow-100', 
      text: 'text-yellow-700',
      dot: 'bg-yellow-500'
    },
    assigned: { 
      label: 'Assigned', 
      bg: 'bg-blue-100', 
      text: 'text-blue-700',
      dot: 'bg-blue-500'
    },
    in_transit: { 
      label: 'In Transit', 
      bg: 'bg-purple-100', 
      text: 'text-purple-700',
      dot: 'bg-purple-500 animate-pulse'
    },
    delivered: { 
      label: 'Delivered', 
      bg: 'bg-green-100', 
      text: 'text-green-700',
      dot: 'bg-green-500'
    },
    failed: { 
      label: 'Delivery Failed', 
      bg: 'bg-red-100', 
      text: 'text-red-700',
      dot: 'bg-red-500'
    },
    returned: { 
      label: 'Returned', 
      bg: 'bg-slate-100', 
      text: 'text-slate-700',
      dot: 'bg-slate-500'
    }
  };

  const config = statusConfig[status] || statusConfig.pending;
  
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

// ETA Countdown Component
const ETACountdown = ({ estimatedDelivery, status }: { estimatedDelivery: string | null; status: string }) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number } | null>(null);

  useEffect(() => {
    if (status === 'delivered' || !estimatedDelivery) return;

    const updateCountdown = () => {
      const now = new Date();
      const eta = new Date(estimatedDelivery);
      const diff = eta.getTime() - now.getTime();
      
      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft({ hours, minutes });
      } else {
        setTimeLeft(null);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [estimatedDelivery, status]);

  if (status === 'delivered') {
    return (
      <div className="text-center">
        <div className="text-3xl font-bold text-green-600">✓</div>
        <div className="text-sm text-slate-500">Delivered</div>
      </div>
    );
  }

  if (!estimatedDelivery || !timeLeft) {
    return (
      <div className="text-center">
        <div className="text-lg font-medium text-orange-600">In Progress</div>
        <div className="text-sm text-slate-500">ETA to be confirmed</div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-lg px-4 py-2">
          <div className="text-2xl font-bold">{timeLeft.hours}</div>
          <div className="text-xs opacity-80">hrs</div>
        </div>
        <span className="text-2xl font-bold text-gray-400">:</span>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-lg px-4 py-2">
          <div className="text-2xl font-bold">{timeLeft.minutes}</div>
          <div className="text-xs opacity-80">min</div>
        </div>
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">Estimated arrival</div>
    </div>
  );
};

// Timeline Component
const DeliveryTimeline = ({ timeline, currentStatus }: { timeline: DeliveryStatus[]; currentStatus: string }) => {
  return (
    <div className="space-y-0">
      {timeline.map((step, index) => {
        const completedAt = step.completed_at || step.completedAt;
        const isCompleted = !!completedAt;
        const prevCompletedAt = index > 0 ? (timeline[index - 1].completed_at || timeline[index - 1].completedAt) : null;
        const isCurrent = !isCompleted && (index === 0 || prevCompletedAt);
        const Icon = statusIcons[step.id] || Package;
        
        return (
          <div key={step.id} className="relative flex gap-4">
            {/* Connector Line */}
            {index < timeline.length - 1 && (
              <div 
                className={`absolute left-5 top-10 w-0.5 h-16 ${
                  isCompleted ? 'bg-green-500' : 'bg-slate-200'
                }`} 
              />
            )}
            
            {/* Icon Circle */}
            <div className={`
              relative z-10 flex items-center justify-center w-10 h-10 rounded-full shrink-0
              ${isCompleted 
                ? 'bg-green-500 text-white' 
                : isCurrent 
                  ? 'bg-orange-500 text-white animate-pulse' 
                  : 'bg-slate-200 text-slate-400'
              }
            `}>
              <Icon className="w-5 h-5" />
            </div>
            
            {/* Content */}
            <div className="flex-1 pb-8">
              <div className="flex items-center justify-between">
                <h4 className={`font-medium ${
                  isCompleted || isCurrent 
                    ? 'text-slate-900' 
                    : 'text-slate-400'
                }`}>
                  {step.label}
                </h4>
                {completedAt && (
                  <span className="text-sm text-slate-500">
                    {new Date(completedAt).toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </span>
                )}
              </div>
              <p className={`text-sm ${
                isCompleted || isCurrent 
                  ? 'text-slate-600' 
                  : 'text-slate-400'
              }`}>
                {step.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Rider Card Component
const RiderCard = ({ rider }: { rider: NonNullable<TrackingData['rider']> }) => {
  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5 border border-orange-100">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
          {rider.name.charAt(0)}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900">{rider.name}</h3>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span>{rider.rating.toFixed(1)}</span>
            <span>•</span>
            <span>{rider.vehicle_type}</span>
          </div>
        </div>
      </div>
      
      <div className="flex gap-3 mt-4">
        <a 
          href={`tel:${rider.phone}`}
          className="flex-1 flex items-center justify-center gap-2 bg-white text-orange-600 py-2.5 rounded-xl font-medium hover:bg-orange-50 transition-colors border border-orange-200"
        >
          <Phone className="w-4 h-4" />
          Call
        </a>
        <a 
          href={`https://wa.me/${rider.phone.replace(/\s+/g, '').replace('+', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-2.5 rounded-xl font-medium hover:bg-green-600 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </a>
      </div>
    </div>
  );
};

// Live Map Placeholder
const LiveMapPlaceholder = ({ location }: { location?: TrackingData['last_location'] }) => {
  return (
    <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl h-64 overflow-hidden">
      {/* Map Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-400" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      
      {/* Location Marker */}
      {location && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="absolute -inset-4 bg-orange-500/20 rounded-full animate-ping" />
            <div className="absolute -inset-2 bg-orange-500/30 rounded-full animate-pulse" />
            <div className="relative bg-orange-500 text-white p-3 rounded-full shadow-lg">
              <Navigation className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}
      
      {/* Location Info Overlay */}
      {location && (
        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-3">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-orange-500" />
            <span className="font-medium text-slate-900">
              Currently in {location.area}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Updated {new Date(location.timestamp).toLocaleTimeString()}
          </p>
        </div>
      )}
      
      {!location && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-slate-500">
            <MapPin className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Live tracking will appear here</p>
            <p className="text-xs">once the rider picks up your package</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Tracking Page Component
export default function TrackingPage() {
  const params = useParams();
  const trackingId = params.trackingId as string;
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrackingData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.trackOrder(trackingId);
        setTrackingData(data);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unable to find tracking information. Please check your tracking ID.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (trackingId) {
      fetchTrackingData();
    }
  }, [trackingId]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Track Package ${trackingId}`,
          text: 'Track your delivery in real-time',
          url
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(url);
      alert('Tracking link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading tracking information...</p>
        </div>
      </div>
    );
  }

  if (error || !trackingData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Tracking Not Found
          </h2>
          <p className="text-slate-600 mb-6">
            {error || 'We couldn\'t find any delivery with this tracking ID.'}
          </p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-orange-600 font-medium hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/"
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </Link>
            
            <div className="flex items-center gap-3">
              <span className="text-2xl">🇬🇭</span>
              <span className="font-bold text-lg bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Movva
              </span>
            </div>
            
            <button
              onClick={handleShare}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              title="Share tracking link"
            >
              <Share2 className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Status Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500 mb-1">Tracking ID</p>
              <p className="font-mono text-lg font-bold text-slate-900">{trackingData.tracking_id}</p>
              <div className="mt-2">
                <StatusBadge status={trackingData.status} />
              </div>
            </div>
            
            <div className="md:text-right">
              <ETACountdown 
                estimatedDelivery={trackingData.estimated_delivery} 
                status={trackingData.status}
              />
            </div>
          </div>
        </div>

        {/* Live Map */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-orange-500" />
            Live Tracking
          </h2>
          <LiveMapPlaceholder location={trackingData.last_location} />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Timeline */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Delivery Progress
            </h2>
            <DeliveryTimeline timeline={trackingData.timeline} currentStatus={trackingData.status} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Rider Info */}
            {trackingData.rider && (
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-orange-500" />
                  Your Rider
                </h2>
                <RiderCard rider={trackingData.rider} />
              </div>
            )}

            {/* Delivery Details */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-500" />
                Package Details
              </h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500">Description</p>
                  <p className="font-medium text-slate-900">{trackingData.package.description}</p>
                </div>
                
                {trackingData.package.weight && (
                  <div>
                    <p className="text-sm text-slate-500">Weight</p>
                    <p className="font-medium text-slate-900">{trackingData.package.weight}</p>
                  </div>
                )}
                
                {trackingData.package.is_cod && (
                  <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                    <div className="flex items-center gap-2 text-yellow-700">
                      <Shield className="w-5 h-5" />
                      <span className="font-medium">Cash on Delivery</span>
                    </div>
                    <p className="text-2xl font-bold text-yellow-700 mt-1">
                      GH₵ {trackingData.package.cod_amount?.toFixed(2)}
                    </p>
                    <p className="text-sm text-yellow-600 mt-1">
                      Please have exact amount ready
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-500" />
                Delivery Address
              </h2>
              
              <div className="space-y-2">
                <p className="font-medium text-slate-900">{trackingData.recipient.name}</p>
                <p className="text-slate-600">{trackingData.recipient.address}</p>
                <p className="text-slate-600">
                  {trackingData.recipient.area}{trackingData.recipient.area ? ', ' : ''}{trackingData.recipient.city}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                <Shield className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-sm font-medium text-slate-900">Secure</p>
              <p className="text-xs text-slate-500">Delivery</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                <Zap className="w-6 h-6 text-orange-500" />
              </div>
              <p className="text-sm font-medium text-slate-900">Real-time</p>
              <p className="text-xs text-slate-500">Updates</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                <Phone className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-sm font-medium text-slate-900">24/7</p>
              <p className="text-xs text-slate-500">Support</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-8">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-slate-500">
            Powered by <span className="font-semibold text-orange-600">Movva</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Ghana&apos;s Most Trusted Delivery Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
