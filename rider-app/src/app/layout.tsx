'use client';

import './globals.css';
import { useState, useEffect, createContext, useContext } from 'react';

// Auth context for rider app
interface RiderAuthContextType {
  rider: any;
  token: string | null;
  isAuthenticated: boolean;
  login: (phone: string, pin: string) => Promise<boolean>;
  logout: () => void;
}

const RiderAuthContext = createContext<RiderAuthContextType | null>(null);

export function useRiderAuth() {
  const context = useContext(RiderAuthContext);
  if (!context) throw new Error('useRiderAuth must be used within RiderAuthProvider');
  return context;
}

function RiderAuthProvider({ children }: { children: React.ReactNode }) {
  const [rider, setRider] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Restore from localStorage
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
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
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

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gradient-navy flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-3xl">🚚</span>
          </div>
          <p className="text-white/70">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <RiderAuthContext.Provider value={{ rider, token, isAuthenticated: !!token, login, logout }}>
      {children}
    </RiderAuthContext.Provider>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#1E3A5F" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <title>Rider App - Last-Mile Delivery</title>
      </head>
      <body className="bg-slate-50 min-h-screen">
        <RiderAuthProvider>
          {children}
        </RiderAuthProvider>
      </body>
    </html>
  );
}
