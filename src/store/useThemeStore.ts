import { create } from 'zustand';

interface ThemeState {
  accentColor: string;
  setAccentColor: (color: string) => void;
}

const getInitialColor = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('mythos-theme-color') || '#D4AF37';
  }
  return '#D4AF37';
};

export const useThemeStore = create<ThemeState>((set) => ({
  accentColor: getInitialColor(),
  setAccentColor: (color) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mythos-theme-color', color);
      document.documentElement.style.setProperty('--color-mythos-accent', color);
    }
    set({ accentColor: color });
  },
}));
