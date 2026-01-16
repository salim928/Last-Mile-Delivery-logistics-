'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  User, 
  Building2, 
  Phone, 
  MapPin, 
  Lock, 
  Save, 
  Loader2,
  Mail,
  Shield,
  CreditCard,
  Bell,
  Palette,
  Globe,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Crown,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import clsx from 'clsx';

const profileSchema = z.object({
  business_name: z.string().min(2, 'Business name is required'),
  phone_number: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
});

const passwordSchema = z.object({
  current_password: z.string().min(8, 'Password must be at least 8 characters'),
  new_password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string().min(8, 'Password must be at least 8 characters'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

const tabs = [
  { id: 'profile', label: 'Profile', icon: User, description: 'Manage your business information' },
  { id: 'security', label: 'Security', icon: Shield, description: 'Password and authentication' },
  { id: 'billing', label: 'Billing', icon: CreditCard, description: 'Subscription and payments' },
  { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Email and push settings' },
];

export default function SettingsPage() {
  const { merchant, setMerchant } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      business_name: merchant?.business_name || '',
      phone_number: '',
      city: merchant?.city || 'Accra',
      address: '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileForm) => {
      const response = await api.updateProfile(data);
      return response;
    },
    onSuccess: (data) => {
      setMerchant(data);
      setSuccessMessage('Profile updated successfully');
      setErrorMessage('');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.detail || 'Failed to update profile');
      setSuccessMessage('');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordForm) => {
      const response = await api.changePassword(data.current_password, data.new_password);
      return response;
    },
    onSuccess: () => {
      setSuccessMessage('Password changed successfully');
      setErrorMessage('');
      resetPassword();
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.detail || 'Failed to change password');
      setSuccessMessage('');
    },
  });

  const onProfileSubmit = (data: ProfileForm) => {
    updateProfileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: PasswordForm) => {
    changePasswordMutation.mutate(data);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-600 mt-1">Manage your account and business preferences</p>
        </div>
        
        {/* Quick Profile Card */}
        <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-4 shadow-soft">
          <div className="w-14 h-14 bg-gradient-to-br from-navy-600 to-navy-700 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-xl font-bold text-white">
              {merchant?.business_name?.charAt(0) || 'M'}
            </span>
          </div>
          <div>
            <p className="font-semibold text-slate-900">{merchant?.business_name}</p>
            <p className="text-sm text-slate-500">{merchant?.email}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={clsx(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold',
                merchant?.subscription_status === 'trial' 
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-green-100 text-green-700'
              )}>
                {merchant?.subscription_status === 'trial' ? (
                  <><AlertCircle className="w-3 h-3" /> Trial</>
                ) : (
                  <><Crown className="w-3 h-3" /> Pro</>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="flex items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 px-5 py-4 rounded-xl border border-green-200/50 shadow-sm animate-slide-down">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <p className="font-medium">{successMessage}</p>
        </div>
      )}
      {errorMessage && (
        <div className="flex items-center gap-3 bg-gradient-to-r from-red-50 to-rose-50 text-red-700 px-5 py-4 rounded-xl border border-red-200/50 shadow-sm animate-slide-down">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <p className="font-medium">{errorMessage}</p>
        </div>
      )}

      {/* Settings Content */}
      <div className="grid lg:grid-cols-[280px,1fr] gap-6">
        {/* Sidebar Navigation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-4 shadow-soft h-fit">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group',
                    isActive 
                      ? 'bg-gradient-to-r from-navy-50 to-slate-50 shadow-sm' 
                      : 'hover:bg-slate-50'
                  )}
                >
                  <div className={clsx(
                    'w-10 h-10 rounded-lg flex items-center justify-center transition-all',
                    isActive 
                      ? 'bg-gradient-to-br from-navy-600 to-navy-700 text-white shadow-sm' 
                      : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                  )}>
                    <tab.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={clsx(
                      'font-semibold text-sm transition-colors',
                      isActive ? 'text-navy-900' : 'text-slate-700'
                    )}>
                      {tab.label}
                    </p>
                    <p className="text-2xs text-slate-500 truncate">{tab.description}</p>
                  </div>
                  <ChevronRight className={clsx(
                    'w-4 h-4 transition-all',
                    isActive ? 'text-navy-600 translate-x-0' : 'text-slate-300 -translate-x-1 group-hover:translate-x-0'
                  )} />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="space-y-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 lg:p-8 shadow-soft animate-fade-in">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Business Profile</h2>
                  <p className="text-sm text-slate-500">Update your business information</p>
                </div>
              </div>
              
              <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6 max-w-xl">
                {/* Email (read-only) */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={merchant?.email || ''}
                      disabled
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-500 cursor-not-allowed"
                    />
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                  <p className="text-2xs text-slate-500 mt-1.5 flex items-center gap-1">
                    <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                    Email cannot be changed
                  </p>
                </div>

                {/* Business Name */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <Building2 className="w-4 h-4 text-slate-400 group-focus-within:text-navy-600 transition-colors" />
                    Business Name
                  </label>
                  <input
                    type="text"
                    {...registerProfile('business_name')}
                    className="input"
                    placeholder="Enter your business name"
                  />
                  {profileErrors.business_name && (
                    <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {profileErrors.business_name.message}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <Phone className="w-4 h-4 text-slate-400 group-focus-within:text-navy-600 transition-colors" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    {...registerProfile('phone_number')}
                    placeholder="+233 XX XXX XXXX"
                    className="input"
                  />
                </div>

                {/* City */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <Globe className="w-4 h-4 text-slate-400" />
                    City
                  </label>
                  <select {...registerProfile('city')} className="select">
                    <option value="Accra">Accra</option>
                    <option value="Kumasi">Kumasi</option>
                    <option value="Tamale">Tamale</option>
                    <option value="Takoradi">Takoradi</option>
                    <option value="Cape Coast">Cape Coast</option>
                  </select>
                </div>

                {/* Address */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    Business Address
                  </label>
                  <textarea
                    {...registerProfile('address')}
                    rows={3}
                    placeholder="Enter your business address"
                    className="input resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="btn-primary w-full sm:w-auto"
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 lg:p-8 shadow-soft animate-fade-in">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center shadow-md">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Security Settings</h2>
                  <p className="text-sm text-slate-500">Manage your password and authentication</p>
                </div>
              </div>
              
              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6 max-w-xl">
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <Lock className="w-4 h-4 text-slate-400" />
                    Current Password
                  </label>
                  <input
                    type="password"
                    {...registerPassword('current_password')}
                    className="input"
                    placeholder="Enter current password"
                  />
                  {passwordErrors.current_password && (
                    <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {passwordErrors.current_password.message}
                    </p>
                  )}
                </div>

                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <Lock className="w-4 h-4 text-slate-400" />
                    New Password
                  </label>
                  <input
                    type="password"
                    {...registerPassword('new_password')}
                    className="input"
                    placeholder="Enter new password"
                  />
                  {passwordErrors.new_password && (
                    <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {passwordErrors.new_password.message}
                    </p>
                  )}
                </div>

                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <Lock className="w-4 h-4 text-slate-400" />
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    {...registerPassword('confirm_password')}
                    className="input"
                    placeholder="Confirm new password"
                  />
                  {passwordErrors.confirm_password && (
                    <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {passwordErrors.confirm_password.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="btn-primary w-full sm:w-auto"
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Change Password
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <div className="space-y-6 animate-fade-in">
              {/* Current Plan */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 lg:p-8 shadow-soft">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Subscription</h2>
                    <p className="text-sm text-slate-500">Manage your plan and billing</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-navy-50 to-slate-100 rounded-xl p-6 border border-navy-100/50">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-navy-900 text-lg">
                          {merchant?.subscription_status === 'trial' ? 'Free Trial' : 'Pro Plan'}
                        </h3>
                        {merchant?.subscription_status === 'trial' ? (
                          <span className="badge-warning">Trial</span>
                        ) : (
                          <span className="badge-success">Active</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">
                        {merchant?.subscription_status === 'trial' 
                          ? 'You are currently on a 14-day free trial'
                          : 'Full access to all features'}
                      </p>
                    </div>
                    <Sparkles className="w-8 h-8 text-navy-300" />
                  </div>

                  {merchant?.subscription_status === 'trial' && (
                    <div className="mt-4 pt-4 border-t border-navy-200/50">
                      <button className="btn-success w-full sm:w-auto">
                        <Crown className="w-4 h-4" />
                        Upgrade to Pro
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 lg:p-8 shadow-soft">
                <h3 className="font-semibold text-slate-900 mb-4">Payment Method</h3>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="w-12 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">VISA</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">•••• •••• •••• 4242</p>
                    <p className="text-sm text-slate-500">Expires 12/2025</p>
                  </div>
                  <button className="text-sm font-semibold text-navy-600 hover:text-navy-700">
                    Update
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 lg:p-8 shadow-soft animate-fade-in">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-md">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Notification Preferences</h2>
                  <p className="text-sm text-slate-500">Choose how you want to be notified</p>
                </div>
              </div>

              <div className="space-y-4 max-w-xl">
                {[
                  { title: 'Route Optimization Complete', description: 'Get notified when your route is optimized', enabled: true },
                  { title: 'Delivery Updates', description: 'Real-time updates on delivery status', enabled: true },
                  { title: 'COD Collection', description: 'Alerts when riders collect cash', enabled: true },
                  { title: 'Daily Summary', description: 'End of day performance report', enabled: false },
                  { title: 'Weekly Analytics', description: 'Weekly performance insights', enabled: true },
                ].map((notification, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-200/50 hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{notification.title}</p>
                      <p className="text-sm text-slate-500">{notification.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        defaultChecked={notification.enabled} 
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-navy-500/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-navy-600"></div>
                    </label>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <button className="btn-primary">
                  <Save className="w-4 h-4" />
                  Save Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
