import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { useConfirmStore } from '@/store/useConfirmStore';

export function ConfirmDialog() {
  const { isOpen, options, closeConfirm } = useConfirmStore();

  if (!isOpen || !options) return null;

  const handleConfirm = () => {
    options.onConfirm();
    closeConfirm();
  };

  const handleCancel = () => {
    if (options.onCancel) {
      options.onCancel();
    }
    closeConfirm();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleCancel}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-sm bg-[#0A0A0B] border border-glass-border rounded-xl shadow-2xl p-6 flex flex-col gap-4"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className={`p-2 rounded-lg ${options.danger ? 'bg-red-500/10 text-red-400' : 'bg-mythos-accent/10 text-mythos-accent'}`}>
              <AlertTriangle size={20} />
            </div>
            <button 
              onClick={handleCancel}
              className="p-1 text-white/40 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Content */}
          <div>
            <h3 className="font-serif text-lg text-white/90 mb-1">
              {options.title || 'Onay Gerekli'}
            </h3>
            <p className="text-sm text-white/50 leading-relaxed">
              {options.message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-xs font-medium text-white/50 hover:text-white hover:bg-white/5 rounded-md transition-colors"
            >
              {options.cancelText || 'İptal'}
            </button>
            <button
              onClick={handleConfirm}
              className={`px-4 py-2 rounded-md font-medium text-xs transition-colors ${
                options.danger 
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                  : 'bg-mythos-accent text-black hover:bg-mythos-accent/90'
              }`}
            >
              {options.confirmText || 'Onayla'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
