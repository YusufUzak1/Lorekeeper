import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  isGuest: boolean;
  userEmail: string | null;
  login: (email: string) => void;
  loginAsGuest: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Baslangicta kimse giris yapmamis durumda
  isAuthenticated: false,
  isGuest: false,
  userEmail: null,

  // Cognito login sonrasi cagrilir
  login: (email) => set({ isAuthenticated: true, isGuest: false, userEmail: email }),

  // Misafir girisi — Cognito gerektirmez
  loginAsGuest: () => set({ isAuthenticated: true, isGuest: true, userEmail: 'misafir@lorekeeper' }),

  // Kullanici cikisinda cagrilir
  logout: () => set({ isAuthenticated: false, isGuest: false, userEmail: null }),
}));

