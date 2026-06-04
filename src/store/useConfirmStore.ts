import { create } from 'zustand';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface ConfirmState {
  isOpen: boolean;
  options: ConfirmOptions | null;
  showConfirm: (options: ConfirmOptions) => void;
  closeConfirm: () => void;
}

export const useConfirmStore = create<ConfirmState>((set) => ({
  isOpen: false,
  options: null,
  showConfirm: (options) => set({ isOpen: true, options }),
  closeConfirm: () => set({ isOpen: false }),
}));
