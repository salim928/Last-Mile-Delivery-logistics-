'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Navigation,
  User,
  History,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import clsx from 'clsx';
import api from '@/lib/api';

const navItems = [
  { href: '/rider', icon: Navigation, label: 'Route', exact: true },
  { href: '/rider/history', icon: History, label: 'History' },
  { href: '/rider/profile', icon: User, label: 'Profile' },
];

export default function RiderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [riderName, setRiderName] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    // Check if logged in (has token)
    const token = api.getToken();
    if (!token && pathname !== '/rider/login' && pathname !== '/rider/setup') {
      router.push('/rider/login');
      return;
    }

    // Get rider name from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('rider_profile');
      if (stored) {
        try {
          const profile = JSON.parse(stored);
          setRiderName(profile.name || '');
        } catch (e) {
          // ignore
        }
      }
    }
  }, [pathname, router]);

  const handleLogout = () => {
    api.clearToken();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('rider_profile');
    }
    router.push('/rider/login');
  };

  // Don't show layout on login/setup pages
  if (pathname === '/rider/login' || pathname === '/rider/setup') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top Header */}
      <header className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-20 safe-top">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🚚</span>
          <div>
            <h1 className="font-bold text-lg leading-tight">Last-Mile</h1>
            <p className="text-blue-200 text-xs">{riderName || 'Rider Portal'}</p>
          </div>
        </div>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 hover:bg-blue-500 rounded-lg transition-colors"
        >
          {showMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Dropdown Menu */}
      {showMenu && (
        <div className="absolute top-14 right-4 z-30 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-48">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 pb-20 overflow-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom z-10">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex flex-col items-center py-3 px-6 transition-colors',
                  isActive
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <item.icon className={clsx('w-6 h-6', isActive && 'stroke-[2.5]')} />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}
