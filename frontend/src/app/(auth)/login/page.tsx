'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Truck, 
  Mail, 
  Lock, 
  Loader2, 
  Building2, 
  Bike, 
  Phone,
  ArrowLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';

type Role = 'merchant' | 'rider' | null;

const merchantSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const riderSchema = z.object({
  phone_number: z.string().min(10, 'Enter a valid phone number'),
  pin: z.string().length(4, 'PIN must be 4 digits'),
});

type MerchantForm = z.infer<typeof merchantSchema>;
type RiderForm = z.infer<typeof riderSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setMerchant } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState<Role>(null);
  const [error, setError] = useState('');

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Merchant form
  const merchantForm = useForm<MerchantForm>({
    resolver: zodResolver(merchantSchema),
  });

  // Rider form
  const riderForm = useForm<RiderForm>({
    resolver: zodResolver(riderSchema),
  });

  const merchantMutation = useMutation({
    mutationFn: async (data: MerchantForm) => {
      return api.login(data.email, data.password);
    },
    onSuccess: (data) => {
      setMerchant(data.merchant);
      
      // Track login event
      analytics.trackLogin(
        data.merchant.id.toString(),
        data.merchant.email
      );
      
      router.push('/dashboard');
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    },
  });

  const riderMutation = useMutation({
    mutationFn: async (data: RiderForm) => {
      return api.riderLogin(data.phone_number, data.pin);
    },
    onSuccess: (data) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('rider_profile', JSON.stringify(data.rider));
      }
      router.push('/rider');
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || 'Login failed. Check your phone number and PIN.');
    },
  });

  const onMerchantSubmit = (data: MerchantForm) => {
    setError('');
    merchantMutation.mutate(data);
  };

  const onRiderSubmit = (data: RiderForm) => {
    setError('');
    riderMutation.mutate(data);
  };

  // Role Selection Screen (or loading state before hydration)
  if (!role) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          {/* Gradient Orbs */}
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-orange-500/30 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex flex-col justify-center px-16">
            <Link href="/" className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Movva</span>
            </Link>
            
            <h1 className="text-4xl font-bold text-white mb-4">
              Welcome back
            </h1>
            <p className="text-xl text-slate-400 mb-8 max-w-md">
              Sign in to manage your deliveries, track your fleet, and optimize your routes.
            </p>

            <div className="space-y-4">
              {[
                'AI-powered route optimization',
                'Real-time GPS tracking',
                'COD reconciliation',
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-orange-400" />
                  </div>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <Link href="/" className="inline-flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">Movva</span>
              </Link>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 shadow-2xl"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Sign in to Movva</h2>
                <p className="text-slate-500 mt-2">
                  {mounted ? 'Select your role to continue' : 'Loading...'}
                </p>
              </div>

              {mounted && (
                <div className="space-y-4">
                  <button
                    onClick={() => setRole('merchant')}
                    className="w-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5 border-2 border-transparent hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/10 transition-all group text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900">Business Dashboard</h3>
                        <p className="text-sm text-slate-500">Merchants & dispatchers</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>

                  <button
                    onClick={() => setRole('rider')}
                    className="w-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5 border-2 border-transparent hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10 transition-all group text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                        <Bike className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900">Rider Portal</h3>
                        <p className="text-sm text-slate-500">Delivery riders & drivers</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-slate-200 text-center">
                <p className="text-slate-500 text-sm">
                  Don't have an account?{' '}
                  <Link href="/register" className="text-orange-500 hover:text-orange-600 font-semibold">
                    Start free trial
                  </Link>
                </p>
              </div>
            </motion.div>

            <p className="text-center text-slate-500 text-sm mt-6">
              <Link href="/" className="hover:text-white transition-colors">
                ← Back to home
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Merchant Login Form
  if (role === 'merchant') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-orange-500/30 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex flex-col justify-center px-16">
            <Link href="/" className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Movva</span>
            </Link>
            
            <h1 className="text-4xl font-bold text-white mb-4">
              Business Dashboard
            </h1>
            <p className="text-xl text-slate-400 mb-8 max-w-md">
              Access your dashboard to manage orders, track deliveries, and optimize routes.
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            <div className="lg:hidden text-center mb-8">
              <Link href="/" className="inline-flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">Movva</span>
              </Link>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 shadow-2xl"
            >
              <button
                onClick={() => { setRole(null); setError(''); }}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to role selection
              </button>

              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Business Login</h2>
                  <p className="text-slate-500 text-sm">Sign in with your email</p>
                </div>
              </div>

              <form onSubmit={merchantForm.handleSubmit(onMerchantSubmit)} className="space-y-5">
                {error && (
                  <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      {...merchantForm.register('email')}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
                      placeholder="you@company.com"
                    />
                  </div>
                  {merchantForm.formState.errors.email && (
                    <p className="text-red-500 text-sm mt-1.5">{merchantForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      {...merchantForm.register('password')}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                  {merchantForm.formState.errors.password && (
                    <p className="text-red-500 text-sm mt-1.5">{merchantForm.formState.errors.password.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={merchantMutation.isPending}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/25 disabled:opacity-70 transition-all flex items-center justify-center gap-2"
                >
                  {merchantMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-200 text-center">
                <p className="text-slate-500 text-sm">
                  Don't have an account?{' '}
                  <Link href="/register" className="text-orange-500 hover:text-orange-600 font-semibold">
                    Start free trial
                  </Link>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Rider Login Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-green-500/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col justify-center px-16">
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Movva</span>
          </Link>
          
          <h1 className="text-4xl font-bold text-white mb-4">
            Rider Portal
          </h1>
          <p className="text-xl text-slate-400 mb-8 max-w-md">
            Access your deliveries, navigate to customers, and complete orders on the go.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Movva</span>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 shadow-2xl"
          >
            <button
              onClick={() => { setRole(null); setError(''); }}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to role selection
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <Bike className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Rider Login</h2>
                <p className="text-slate-500 text-sm">Sign in with your phone & PIN</p>
              </div>
            </div>

            <form onSubmit={riderForm.handleSubmit(onRiderSubmit)} className="space-y-5">
              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="tel"
                    {...riderForm.register('phone_number')}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                    placeholder="+233 20 123 4567"
                  />
                </div>
                {riderForm.formState.errors.phone_number && (
                  <p className="text-red-500 text-sm mt-1.5">{riderForm.formState.errors.phone_number.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">4-Digit PIN</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    {...riderForm.register('pin', {
                      onChange: (e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                        e.target.value = val;
                      }
                    })}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none tracking-[0.5em] text-center text-xl"
                    placeholder="••••"
                  />
                </div>
                {riderForm.formState.errors.pin && (
                  <p className="text-red-500 text-sm mt-1.5">{riderForm.formState.errors.pin.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={riderMutation.isPending}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/25 disabled:opacity-70 transition-all flex items-center justify-center gap-2"
              >
                {riderMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
              <p className="text-sm text-amber-800">
                <strong>Don't have a PIN?</strong> Contact your company admin to set up your rider account.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}