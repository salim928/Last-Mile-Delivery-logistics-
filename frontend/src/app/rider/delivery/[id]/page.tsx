'use client';

import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Navigation,
  Phone,
  MapPin,
  Banknote,
  CheckCircle2,
  XCircle,
  Loader2,
  Camera,
  MessageSquare,
  Package,
  AlertCircle,
  Clock,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import clsx from 'clsx';
import api from '@/lib/api';

export default function DeliveryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const stopId = Number(params.id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showFailedModal, setShowFailedModal] = useState(false);
  const [codCollected, setCodCollected] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [failureReason, setFailureReason] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['rider-active-route'],
    queryFn: () => api.getRiderActiveRoute(),
  });

  const completeMutation = useMutation({
    mutationFn: (data: { status: 'completed' | 'failed'; cod_collected?: number; failure_reason?: string; recipient_name?: string }) =>
      api.completeDelivery(stopId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rider-active-route'] });
      router.push('/rider');
    },
  });

  const otpMutation = useMutation({
    mutationFn: (orderId: number) => api.generateOTP(orderId),
    onSuccess: () => {
      setOtpSent(true);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: ({ orderId, code }: { orderId: number; code: string }) =>
      api.verifyOTP(orderId, code),
    onSuccess: () => {
      setOtpVerified(true);
    },
  });

  // Find the stop from the route data
  const stop = data?.stops?.find((s: any) => s.id === stopId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!stop) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-900">Stop not found</h2>
        <button
          onClick={() => router.push('/rider')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Back to Route
        </button>
      </div>
    );
  }

  const handleNavigate = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${stop.latitude},${stop.longitude}`;
    window.open(url, '_blank');
  };

  const handleCall = () => {
    window.location.href = `tel:${stop.customer_phone}`;
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setPhotoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleComplete = async () => {
    const collected = stop.is_cod ? parseFloat(codCollected) || 0 : 0;
    
    // If there's a photo, upload it first
    if (photoFile) {
      try {
        await api.uploadPODPhoto(stop.order_id, photoFile);
      } catch (err) {
        console.error('Failed to upload photo:', err);
        // Continue with completion even if photo upload fails
      }
    }
    
    completeMutation.mutate({
      status: 'completed',
      cod_collected: collected,
      recipient_name: recipientName,
    });
  };

  const handleFailed = () => {
    completeMutation.mutate({
      status: 'failed',
      failure_reason: failureReason,
    });
  };

  const isCompleted = stop.status !== 'pending';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-14 z-10">
        <button
          onClick={() => router.push('/rider')}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-semibold text-gray-900">Stop #{stop.sequence}</h1>
          <p className="text-sm text-gray-500">{stop.external_order_id || `Order #${stop.order_id}`}</p>
        </div>
        <span
          className={clsx(
            'px-3 py-1 rounded-full text-sm font-medium',
            stop.status === 'completed' && 'bg-green-100 text-green-700',
            stop.status === 'failed' && 'bg-red-100 text-red-700',
            stop.status === 'pending' && 'bg-yellow-100 text-yellow-700'
          )}
        >
          {stop.status.charAt(0).toUpperCase() + stop.status.slice(1)}
        </span>
      </div>

      {/* Customer Info */}
      <div className="bg-white p-4 mt-2">
        <h2 className="text-xl font-bold text-gray-900">{stop.customer_name}</h2>
        
        <div className="mt-4 space-y-3">
          {/* Address */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-900">{stop.delivery_address}</p>
              <p className="text-sm text-gray-500">{stop.delivery_city}</p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-gray-900">{stop.customer_phone}</p>
            </div>
            <button
              onClick={handleCall}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium"
            >
              Call
            </button>
          </div>

          {/* COD */}
          {stop.is_cod && (
            <div className="flex items-center gap-3 bg-yellow-50 p-3 rounded-xl border border-yellow-100">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Banknote className="w-5 h-5 text-yellow-700" />
              </div>
              <div>
                <p className="font-semibold text-yellow-800">Cash on Delivery</p>
                <p className="text-2xl font-bold text-yellow-900">GHS {stop.cod_amount}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Package Details */}
      {(stop.package_description || stop.special_instructions) && (
        <div className="bg-white p-4 mt-2">
          <h3 className="font-semibold text-gray-900 mb-3">Package Details</h3>
          
          {stop.package_description && (
            <div className="flex items-start gap-3 mb-3">
              <Package className="w-5 h-5 text-gray-400 mt-0.5" />
              <p className="text-gray-700">{stop.package_description}</p>
            </div>
          )}
          
          {stop.special_instructions && (
            <div className="flex items-start gap-3 bg-orange-50 p-3 rounded-lg">
              <MessageSquare className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-orange-800">Special Instructions</p>
                <p className="text-orange-700">{stop.special_instructions}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {!isCompleted && (
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-white border-t border-gray-200 safe-bottom">
          <div className="flex gap-3 mb-3">
            <button
              onClick={handleNavigate}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <Navigation className="w-5 h-5" />
              Navigate
            </button>
            <button
              onClick={handleCall}
              className="px-5 py-3 bg-gray-100 text-gray-700 rounded-xl"
            >
              <Phone className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowCompleteModal(true)}
              className="flex-1 py-4 bg-green-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              Delivered
            </button>
            <button
              onClick={() => setShowFailedModal(true)}
              className="flex-1 py-4 bg-red-100 text-red-700 rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <XCircle className="w-5 h-5" />
              Failed
            </button>
          </div>
        </div>
      )}

      {/* Complete Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="bg-white w-full max-w-lg rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto safe-bottom">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Delivery</h3>

            {/* OTP Verification (optional) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OTP Verification (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 4-digit OTP"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-center text-lg tracking-widest"
                  disabled={otpVerified}
                />
                {!otpSent ? (
                  <button
                    onClick={() => otpMutation.mutate(stop.order_id)}
                    disabled={otpMutation.isPending}
                    className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium whitespace-nowrap"
                  >
                    {otpMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send OTP'}
                  </button>
                ) : !otpVerified ? (
                  <button
                    onClick={() => verifyOtpMutation.mutate({ orderId: stop.order_id, code: otpCode })}
                    disabled={verifyOtpMutation.isPending || otpCode.length !== 4}
                    className="px-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium"
                  >
                    {verifyOtpMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify'}
                  </button>
                ) : (
                  <div className="px-4 py-3 bg-green-100 text-green-700 rounded-xl flex items-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
              </div>
              {otpSent && !otpVerified && (
                <p className="text-sm text-gray-500 mt-1">OTP sent to customer's phone</p>
              )}
            </div>

            {/* COD Collection */}
            {stop.is_cod && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  COD Amount Collected
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    GHS
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={codCollected}
                    onChange={(e) => setCodCollected(e.target.value)}
                    placeholder={stop.cod_amount.toString()}
                    className="w-full pl-14 pr-4 py-3 border border-gray-200 rounded-xl text-lg"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">Expected: GHS {stop.cod_amount}</p>
              </div>
            )}

            {/* Recipient Name */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Name (Optional)
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Who received the package?"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl"
              />
            </div>

            {/* Photo Proof of Delivery */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photo Proof (Optional)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoCapture}
                className="hidden"
              />
              
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Delivery proof"
                    className="w-full h-48 object-cover rounded-xl border border-gray-200"
                  />
                  <button
                    onClick={handleRemovePhoto}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-green-500 text-white text-xs rounded-lg flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Photo captured
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-8 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center gap-2 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <Camera className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-500">Tap to take photo</span>
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowCompleteModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleComplete}
                disabled={completeMutation.isPending}
                className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                {completeMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Confirm
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Failed Modal */}
      {showFailedModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="bg-white w-full max-w-lg rounded-t-3xl p-6 safe-bottom">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Report Failed Delivery</h3>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Failure
              </label>
              <div className="space-y-2">
                {[
                  'Customer not available',
                  'Wrong address',
                  'Customer refused delivery',
                  'Unable to locate address',
                  'Other',
                ].map((reason) => (
                  <button
                    key={reason}
                    onClick={() => setFailureReason(reason)}
                    className={clsx(
                      'w-full px-4 py-3 border rounded-xl text-left transition-colors',
                      failureReason === reason
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    {reason}
                  </button>
                ))}
              </div>
              
              {failureReason === 'Other' && (
                <textarea
                  value={failureReason === 'Other' ? '' : failureReason}
                  onChange={(e) => setFailureReason(e.target.value)}
                  placeholder="Describe the reason..."
                  className="w-full mt-3 px-4 py-3 border border-gray-200 rounded-xl resize-none"
                  rows={3}
                />
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowFailedModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleFailed}
                disabled={completeMutation.isPending || !failureReason}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {completeMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <XCircle className="w-5 h-5" />
                    Confirm Failed
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
