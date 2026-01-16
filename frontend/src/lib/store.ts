/**
 * Global State Management with Zustand
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Merchant {
  id: number;
  email: string;
  business_name: string;
  business_type: string;
  phone_number?: string;
  city: string;
  address?: string;
  subscription_status: string;
  trial_ends_at?: string;
}

interface AuthState {
  merchant: Merchant | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setMerchant: (merchant: Merchant | null) => void;
  logout: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      merchant: null,
      isAuthenticated: false,
      isHydrated: false,
      setMerchant: (merchant) => set({ merchant, isAuthenticated: !!merchant }),
      logout: () => {
        set({ merchant: null, isAuthenticated: false });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
      },
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar:  () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen:  open }),
}));