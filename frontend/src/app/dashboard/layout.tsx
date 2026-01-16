'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore, useUIStore } from '@/lib/store';
import {
  Truck,
  LayoutDashboard,
  Package,
  Route,
  Users,
  FileText,
  Wallet,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  Sparkles,
  Moon,
  Sun,
  HelpCircle,
  BarChart3,
} from 'lucide-react';
import clsx from 'clsx';
import FeedbackWidget from '@/components/ui/FeedbackWidget';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, color: 'from-orange-500 to-amber-500' },
  { href: '/dashboard/orders', label: 'Orders', icon: Package, color: 'from-green-500 to-emerald-500' },
  { href: '/dashboard/routes', label: 'Routes', icon: Route, color: 'from-orange-500 to-amber-500' },
  { href: '/dashboard/riders', label: 'Riders', icon: Users, color: 'from-orange-500 to-amber-500' },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3, color: 'from-orange-500 to-amber-500' },
  { href: '/dashboard/cod', label: 'COD', icon: Wallet, color: 'from-cyan-500 to-teal-500' },
  { href: '/dashboard/reports', label: 'Reports', icon: FileText, color: 'from-pink-500 to-rose-500' },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, color: 'from-slate-500 to-gray-500' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { merchant, isAuthenticated, isHydrated, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const [searchFocused, setSearchFocused] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Prefetch common routes on mount for faster navigation
  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      // Prefetch the most commonly visited pages
      router.prefetch('/dashboard/orders');
      router.prefetch('/dashboard/routes');
      router.prefetch('/dashboard/riders');
    }
  }, [isHydrated, isAuthenticated, router]);

  useEffect(() => {
    // Only redirect after hydration is complete
    if (isHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isHydrated, router]);

  // Memoized logout handler
  const handleLogout = useCallback(() => {
    logout();
    router.push('/login');
  }, [logout, router]);

  // Show loading while hydrating
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-navy-700 to-navy-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-navy-800/20">
              <Truck className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4">
              <span className="flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
              </span>
            </div>
          </div>
          <p className="text-slate-500 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Collapsible Sidebar - Enhanced Enterprise Style */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 bg-white/95 backdrop-blur-md border-r border-slate-200/80 transform transition-all duration-300 ease-out',
          sidebarOpen ? 'w-64' : 'w-0 lg:w-20',
          'lg:translate-x-0 shadow-lg lg:shadow-none'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo Area - Enhanced */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200/80 bg-gradient-to-r from-white to-slate-50/50">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="relative group">
                <div className="w-10 h-10 bg-gradient-to-br from-navy-700 to-navy-900 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-navy-800/20 group-hover:shadow-lg transition-shadow duration-300">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3">
                  <span className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 ring-2 ring-white"></span>
                  </span>
                </div>
              </div>
              {sidebarOpen && (
                <div className="transition-all duration-200 animate-fade-in">
                  <h1 className="font-bold text-navy-900 text-sm leading-tight">Last-Mile</h1>
                  <p className="text-2xs text-slate-500 uppercase tracking-widest font-medium">Optimizer</p>
                </div>
              )}
            </div>
            <button onClick={toggleSidebar} className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Navigation - Enhanced with animations */}
          <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
            {navItems.map((item, index) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group relative overflow-hidden',
                    isActive
                      ? 'bg-gradient-to-r from-navy-50 to-slate-50 text-navy-900 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  )}
                  title={!sidebarOpen ? item.label : undefined}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-navy-600 to-navy-800 rounded-r-full" />
                  )}
                  
                  <div className={clsx(
                    'flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 flex-shrink-0',
                    isActive 
                      ? `bg-gradient-to-br ${item.color} text-white shadow-sm`
                      : 'text-slate-400 group-hover:text-slate-600'
                  )}>
                    <item.icon className="w-[18px] h-[18px]" />
                  </div>
                  {sidebarOpen && (
                    <span className="truncate">{item.label}</span>
                  )}
                  
                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </Link>
              );
            })}
          </nav>

          {/* Quick Actions */}
          {sidebarOpen && (
            <div className="px-3 py-4 border-t border-slate-200/80 animate-fade-in">
              <div className="bg-gradient-to-br from-navy-50 to-slate-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-navy-600" />
                  <span className="text-xs font-semibold text-navy-800">Pro Tip</span>
                </div>
                <p className="text-2xs text-slate-600 leading-relaxed">
                  Optimize routes to save up to 30% on fuel costs!
                </p>
                <Link 
                  href="/dashboard/routes" 
                  className="mt-3 inline-flex items-center text-xs font-semibold text-navy-700 hover:text-navy-900 transition-colors"
                >
                  Create Route →
                </Link>
              </div>
            </div>
          )}

          {/* User Section - Enhanced */}
          <div className="border-t border-slate-200/80 p-4 bg-gradient-to-t from-slate-50/50 to-transparent">
            {sidebarOpen ? (
              <>
                <div className="flex items-center gap-3 mb-3 p-2 rounded-xl hover:bg-white/80 transition-colors cursor-pointer group">
                  <div className="w-10 h-10 bg-gradient-to-br from-navy-600 to-navy-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow">
                    <span className="text-sm font-bold text-white">
                      {merchant?.business_name?.charAt(0) || 'M'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-navy-900 truncate">
                      {merchant?.business_name}
                    </p>
                    <p className="text-2xs text-slate-500 truncate">{merchant?.email}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-red-600 transition-colors w-full px-2 py-2 rounded-xl hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="btn-icon w-full"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={clsx('transition-all duration-300', sidebarOpen ? 'lg:pl-64' : 'lg:pl-20')}>
        {/* Top Navigation Bar - Enhanced Enterprise Style */}
        <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            {/* Left: Mobile Menu + Search */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              {/* Quick Search - Enhanced */}
              <div className={clsx(
                'hidden md:flex items-center gap-2 rounded-xl px-4 py-2.5 w-80 transition-all duration-200',
                searchFocused 
                  ? 'bg-white shadow-md ring-2 ring-navy-500/30' 
                  : 'bg-slate-100 hover:bg-slate-200/70'
              )}>
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search orders, routes, riders..."
                  className="bg-transparent border-none outline-none text-sm text-slate-900 placeholder:text-slate-400 w-full"
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
                <kbd className="hidden lg:inline-flex px-2 py-1 text-2xs font-medium text-slate-400 bg-slate-200/50 rounded">
                  ⌘K
                </kbd>
              </div>
            </div>

            {/* Right: Actions - Enhanced */}
            <div className="flex items-center gap-2">
              {merchant?.subscription_status === 'trial' && (
                <div className="hidden sm:inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 px-3 py-1.5 rounded-xl text-xs font-semibold ring-1 ring-amber-200/50">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Trial Account
                </div>
              )}
              
              {/* Help Button */}
              <button className="hidden md:flex p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors">
                <HelpCircle className="w-5 h-5" />
              </button>
              
              {/* Notifications - Enhanced */}
              <div className="relative">
                <button 
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                </button>
                
                {/* Notification dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-strong border border-slate-200 overflow-hidden animate-slide-down z-50">
                    <div className="p-4 border-b border-slate-100">
                      <h3 className="font-semibold text-slate-900">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      <div className="p-4 hover:bg-slate-50 cursor-pointer border-b border-slate-100">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Package className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">Route Optimized</p>
                            <p className="text-xs text-slate-500 mt-0.5">Your morning route saved 15% on fuel</p>
                            <p className="text-2xs text-slate-400 mt-1">2 minutes ago</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 hover:bg-slate-50 cursor-pointer">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Users className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">New Rider Available</p>
                            <p className="text-xs text-slate-500 mt-0.5">John Doe is now online</p>
                            <p className="text-2xs text-slate-400 mt-1">15 minutes ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 border-t border-slate-100">
                      <button className="w-full text-center text-xs font-semibold text-navy-600 hover:text-navy-700">
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Settings */}
              <Link 
                href="/dashboard/settings" 
                className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </Link>
              
              {/* Profile Quick Access - Desktop */}
              <div className="hidden lg:flex items-center gap-3 pl-3 ml-2 border-l border-slate-200">
                <div className="w-9 h-9 bg-gradient-to-br from-navy-600 to-navy-700 rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-sm font-bold text-white">
                    {merchant?.business_name?.charAt(0) || 'M'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content - Enhanced with animations */}
        <main className="p-4 lg:p-8 max-w-[1600px] mx-auto animate-fade-in">
          {children}
        </main>
        
        {/* Footer */}
        <footer className="py-6 px-8 border-t border-slate-200/60 bg-white/30 backdrop-blur-sm">
          <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} Movva Technologies Ltd.</p>
            <div className="flex items-center gap-4">
              <a href="/help" className="hover:text-slate-700 transition-colors">Help Center</a>
              <a href="/docs" className="hover:text-slate-700 transition-colors">Documentation</a>
              <a href="/privacy" className="hover:text-slate-700 transition-colors">Privacy Policy</a>
            </div>
          </div>
        </footer>
      </div>

      {/* Feedback Widget */}
      <FeedbackWidget />
    </div>
  );
}