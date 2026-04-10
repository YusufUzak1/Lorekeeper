import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  userEmail: string | null;
  login: (email: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Baslangicta kimse giris yapmamis durumda
  isAuthenticated: false,
  userEmail: null,

  // Cognito login sonrasi cagrilir
  login: (email) => set({ isAuthenticated: true, userEmail: email }),

  // Kullanici cikisinda cagrilir
  logout: () => set({ isAuthenticated: false, userEmail: null }),
}));

