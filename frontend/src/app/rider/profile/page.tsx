'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  User,
  Phone,
  Mail,
  Truck,
  Star,
  Package,
  CheckCircle2,
  XCircle,
  Loader2,
  LogOut,
  Shield,
} from 'lucide-react';
import clsx from 'clsx';
import api from '@/lib/api';

export default function RiderProfilePage() {
  const router = useRouter();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['rider-profile'],
    queryFn: () => api.getRiderProfile(),
  });

  const offlineMutation = useMutation({
    mutationFn: () => api.riderGoOffline(),
    onSuccess: () => {
      api.clearToken();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('rider_profile');
      }
      router.push('/rider/login');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const successRate =
    profile?.total_deliveries > 0
      ? ((profile.successful_deliveries / profile.total_deliveries) * 100).toFixed(1)
      : 0;

  return (
    <div className="pb-4">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 text-center">
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <User className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold">{profile?.name}</h1>
        <p className="text-blue-200">{profile?.merchant_name}</p>
        
        {/* Status Badge */}
        <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 rounded-full">
          <div
            className={clsx(
              'w-2 h-2 rounded-full',
              profile?.status === 'available' && 'bg-green-400',
              profile?.status === 'on_route' && 'bg-yellow-400',
              profile?.status === 'offline' && 'bg-gray-400'
            )}
          />
          <span className="text-sm font-medium capitalize">
            {profile?.status?.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 -mt-4">
        <div className="bg-white rounded-xl shadow-lg p-4 grid grid-cols-4 gap-2">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{profile?.total_deliveries || 0}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{profile?.successful_deliveries || 0}</p>
            <p className="text-xs text-gray-500">Success</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-500">{profile?.failed_deliveries || 0}</p>
            <p className="text-xs text-gray-500">Failed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{successRate}%</p>
            <p className="text-xs text-gray-500">Rate</p>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="mt-6 px-4">
        <h3 className="font-semibold text-gray-900 mb-3">Contact Info</h3>
        <div className="bg-white rounded-xl divide-y divide-gray-100">
          <div className="flex items-center gap-4 p-4">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone Number</p>
              <p className="font-medium text-gray-900">{profile?.phone_number}</p>
            </div>
          </div>
          {profile?.email && (
            <div className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{profile?.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Vehicle Info */}
      <div className="mt-6 px-4">
        <h3 className="font-semibold text-gray-900 mb-3">Vehicle</h3>
        <div className="bg-white rounded-xl divide-y divide-gray-100">
          <div className="flex items-center gap-4 p-4">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Vehicle Type</p>
              <p className="font-medium text-gray-900 capitalize">{profile?.vehicle_type}</p>
            </div>
          </div>
          {profile?.vehicle_registration && (
            <div className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Registration</p>
                <p className="font-medium text-gray-900">{profile?.vehicle_registration}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rating */}
      <div className="mt-6 px-4">
        <h3 className="font-semibold text-gray-900 mb-3">Performance</h3>
        <div className="bg-white rounded-xl p-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-yellow-50 rounded-xl flex items-center justify-center">
              <Star className="w-7 h-7 text-yellow-500 fill-yellow-500" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {(profile?.average_rating || 5).toFixed(1)}
              </p>
              <p className="text-sm text-gray-500">Average Rating</p>
            </div>
            <div className="ml-auto flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={clsx(
                    'w-5 h-5',
                    star <= Math.round(profile?.average_rating || 5)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-200'
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Go Offline / Logout */}
      <div className="mt-8 px-4">
        <button
          onClick={() => offlineMutation.mutate()}
          disabled={offlineMutation.isPending}
          className="w-full py-4 bg-red-50 text-red-600 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
        >
          {offlineMutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <LogOut className="w-5 h-5" />
              Go Offline & Logout
            </>
          )}
        </button>
        <p className="text-center text-gray-500 text-sm mt-2">
          This will mark you as offline and log you out
        </p>
      </div>
    </div>
  );
}
