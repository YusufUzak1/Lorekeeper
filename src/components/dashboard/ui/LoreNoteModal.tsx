import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useUniverseStore } from '@/store/useUniverseStore';
import { submitLoreNote } from '@/services/loreService';

interface LoreNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SubmitState = 'idle' | 'loading' | 'success' | 'error';

export function LoreNoteModal({ isOpen, onClose }: LoreNoteModalProps) {
  const { currentUniverseId } = useUniverseStore();

  const [noteText, setNoteText] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const resetForm = () => {
    setNoteText('');
    setSubmitState('idle');
    setErrorMessage('');
  };

  const handleClose = () => {
    if (submitState !== 'loading') {
      resetForm();
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!noteText.trim() || !currentUniverseId) return;

    setSubmitState('loading');
    setErrorMessage('');

    try {
      await submitLoreNote(currentUniverseId, noteText.trim());
      setSubmitState('success');

      // 3 saniye sonra modalı kapat
      setTimeout(() => {
        resetForm();
        onClose();
      }, 3000);
    } catch (err: any) {
      setSubmitState('error');
      setErrorMessage(err.message || 'Bir hata oluştu.');
    }
  };

  const charCount = noteText.length;
  const isDisabled = !noteText.trim() || submitState === 'loading' || submitState === 'success';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
          >
            <div
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-2xl border border-white/10 bg-[#0e0e10]/95 backdrop-blur-xl shadow-[0_0_80px_rgba(212,175,55,0.08)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Ambient glow */}
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-40 bg-mythos-accent/10 rounded-full blur-[80px] pointer-events-none" />

              {/* Sparkle decorations */}
              <div className="absolute top-6 right-16 w-1 h-1 rounded-full bg-mythos-accent/40 animate-pulse" />
              <div className="absolute top-10 right-24 w-0.5 h-0.5 rounded-full bg-mythos-accent/30 animate-pulse" style={{ animationDelay: '0.5s' }} />
              <div className="absolute top-14 right-12 w-0.5 h-0.5 rounded-full bg-mythos-accent/20 animate-pulse" style={{ animationDelay: '1s' }} />

              {/* Header */}
              <div className="relative flex items-center justify-between px-8 pt-8 pb-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-mythos-accent/20 to-mythos-accent/5 border border-mythos-accent/30 flex items-center justify-center">
                      <Sparkles size={16} className="text-mythos-accent" />
                    </div>
                    <h2 className="font-serif text-xl tracking-[0.15em] text-[#E8D48B] uppercase">
                      AI Lore Notu
                    </h2>
                  </div>
                  <p className="text-[0.65rem] text-white/30 mt-2 tracking-wider leading-relaxed max-w-md">
                    Serbest metin yazın — AI karakterleri, mekanları, olayları ve ilişkileri otomatik olarak çıkarsın ve evreninize eklesin.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-2 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="px-8 pb-8 flex flex-col gap-5">
                {/* Textarea */}
                <label className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[0.6rem] uppercase tracking-[0.2em] text-white/40 font-serif">
                      Serbest Not
                    </span>
                    <span className={`text-[0.5rem] tracking-wider font-serif transition-colors ${
                      charCount > 2000 ? 'text-red-400/70' : 'text-white/20'
                    }`}>
                      {charCount} / 3000
                    </span>
                  </div>
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value.slice(0, 3000))}
                    placeholder={`Örnek: "Kara Orman'ın derinliklerinde yaşayan Eldric adında bir büyücü var. Yüzyıllardır Gölge Lordu Malachar'a karşı savaşıyor. Eldric'in en yakın müttefiki, Gümüş Kale'nin komutanı Sera. Gölge Lordu'nun ordusu son zamanlarda Kuzey Geçidi'ni ele geçirdi..."`}
                    rows={8}
                    disabled={submitState === 'loading' || submitState === 'success'}
                    className="w-full rounded-lg bg-white/[0.03] border border-white/10 px-4 py-3 text-sm text-white/90 outline-none focus:border-mythos-accent/50 focus:ring-1 focus:ring-mythos-accent/30 transition-all placeholder:text-white/15 resize-none leading-relaxed disabled:opacity-50"
                  />
                </label>

                {/* AI Info Box */}
                <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-mythos-accent/[0.04] border border-mythos-accent/10">
                  <Sparkles size={14} className="text-mythos-accent/50 mt-0.5 shrink-0" />
                  <p className="text-[0.55rem] text-white/30 leading-relaxed tracking-wide">
                    AI notunuzu analiz ederek karakterler, mekanlar, olaylar ve aralarındaki ilişkileri otomatik olarak çıkaracak. 
                    İşlem arka planda gerçekleşir — sonuçlar <span className="text-mythos-accent/60">Buluttan İndir</span> ile evreninize yüklenecektir.
                  </p>
                </div>

                {/* Status Messages */}
                <AnimatePresence mode="wait">
                  {submitState === 'success' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
                    >
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                      <p className="text-[0.65rem] text-emerald-300/80 tracking-wide">
                        Notunuz AI'a gönderildi! İşlem arka planda devam ediyor. Sonuçları görmek için Ayarlar → Buluttan İndir'i kullanın.
                      </p>
                    </motion.div>
                  )}

                  {submitState === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20"
                    >
                      <AlertCircle size={16} className="text-red-400 shrink-0" />
                      <p className="text-[0.65rem] text-red-300/80 tracking-wide">
                        {errorMessage}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-5 py-2.5 text-xs uppercase tracking-[0.15em] text-white/40 hover:text-white/70 transition-colors rounded-lg border border-white/5 hover:border-white/10 cursor-pointer"
                  >
                    İptal
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isDisabled}
                    className="group flex items-center justify-center gap-2.5 px-6 py-2.5 text-xs uppercase tracking-[0.2em] font-semibold bg-gradient-to-r from-mythos-accent/90 to-mythos-accent/70 text-black rounded-lg hover:from-mythos-accent hover:to-mythos-accent/90 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer shadow-[0_0_20px_rgba(212,175,55,0.2)] min-w-[180px]"
                  >
                    {submitState === 'loading' ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Gönderiliyor...
                      </>
                    ) : submitState === 'success' ? (
                      <>
                        <CheckCircle2 size={16} />
                        Gönderildi!
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        AI'a Gönder
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
