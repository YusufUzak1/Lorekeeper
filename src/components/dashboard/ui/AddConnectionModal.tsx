import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link as LinkIcon, Users, Swords, CircleDot } from 'lucide-react';
import { useUniverseStore } from '@/store/useUniverseStore';
import type { RelationType } from '@/types';

const RELATION_OPTIONS: { value: RelationType; label: string; icon: any; color: string }[] = [
  { value: 'friend', label: 'Dostluk / İttifak', icon: <Users size={14} />, color: 'text-emerald-400' },
  { value: 'enemy', label: 'Düşmanlık / Savaş', icon: <Swords size={14} />, color: 'text-red-400' },
  { value: 'neutral', label: 'Nötr / İlişkili', icon: <CircleDot size={14} />, color: 'text-gray-400' },
];

interface AddConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSourceId?: string;
}

export function AddConnectionModal({ isOpen, onClose, defaultSourceId }: AddConnectionModalProps) {
  const { entities, addConnection } = useUniverseStore();

  const [sourceId, setSourceId] = useState(defaultSourceId || '');
  const [targetId, setTargetId] = useState('');
  const [relation, setRelation] = useState<RelationType>('friend');

  const handleSubmit = () => {
    if (!sourceId || !targetId || sourceId === targetId) return;
    
    addConnection(sourceId, targetId, relation);
    onClose();
    // Sıfırlama
    if (!defaultSourceId) setSourceId('');
    setTargetId('');
    setRelation('friend');
  };

  // İsimlerine göre alfabetik sıralı liste
  const sortedEntities = [...entities].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm pointer-events-auto"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0e0e10]/95 backdrop-blur-xl shadow-2xl p-8 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-32 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none" />

              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-serif text-lg tracking-[0.1em] text-white/90 uppercase flex items-center gap-2">
                    <LinkIcon size={18} className="text-mythos-accent" />
                    Bağlantı Kur
                  </h2>
                  <p className="text-[0.65rem] text-white/40 tracking-wider mt-1">İki varlık arasında kalıcı bir bağ yaratın.</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-white/30 hover:text-white/80 hover:bg-white/5 transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-6">
                
                {/* Source Selection */}
                <div className="flex flex-col gap-2">
                  <label className="text-[0.6rem] uppercase tracking-widest text-white/40 font-serif">1. Tarafi Seçin (Kaynak)</label>
                  <select
                    value={sourceId}
                    onChange={(e) => setSourceId(e.target.value)}
                    className="w-full rounded-lg bg-white/[0.03] border border-white/10 px-4 py-3 text-sm text-white/90 outline-none focus:border-mythos-accent/50 focus:ring-1 focus:ring-mythos-accent/30 transition-all cursor-pointer"
                  >
                    <option value="" disabled className="bg-[#0e0e10] text-white/40">Bir Varlık Seçin</option>
                    {sortedEntities.map(e => (
                      <option key={`src-${e.id}`} value={e.id} className="bg-[#0e0e10] text-white">
                        {e.name} ({e.type === 'character' ? 'Kişi' : e.type === 'place' ? 'Mekan' : 'Olay'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Target Selection */}
                <div className="flex flex-col gap-2">
                  <label className="text-[0.6rem] uppercase tracking-widest text-white/40 font-serif">2. Tarafi Seçin (Hedef)</label>
                  <select
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    disabled={!sourceId}
                    className="w-full rounded-lg bg-white/[0.03] border border-white/10 px-4 py-3 text-sm text-white/90 outline-none focus:border-mythos-accent/50 focus:ring-1 focus:ring-mythos-accent/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="" disabled className="bg-[#0e0e10] text-white/40">Bağlanacak Varlığı Seçin</option>
                    {sortedEntities.filter(e => e.id !== sourceId).map(e => (
                      <option key={`tgt-${e.id}`} value={e.id} className="bg-[#0e0e10] text-white">
                        {e.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Relation Selection */}
                <div className="flex flex-col gap-2">
                  <label className="text-[0.6rem] uppercase tracking-widest text-white/40 font-serif">Aralarındaki İlişki</label>
                  <div className="flex gap-2">
                    {RELATION_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setRelation(opt.value)}
                        className={`flex-1 flex flex-col items-center justify-center gap-2 py-4 rounded-lg border transition-all cursor-pointer ${
                          relation === opt.value
                            ? 'bg-white/10 border-white/30 shadow-lg scale-[1.02]'
                            : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] opacity-60 hover:opacity-100'
                        }`}
                      >
                        <div className={relation === opt.value ? opt.color : 'text-white/60'}>
                          {opt.icon}
                        </div>
                        <span className={`text-[0.6rem] uppercase tracking-wider ${relation === opt.value ? 'text-white' : 'text-white/60'}`}>
                          {opt.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action button */}
                <button
                  onClick={handleSubmit}
                  disabled={!sourceId || !targetId || sourceId === targetId}
                  className="w-full mt-4 py-3.5 rounded-lg bg-gradient-to-r from-mythos-accent/90 to-mythos-accent/60 text-black font-semibold text-xs tracking-[0.2em] uppercase transition-all hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] disabled:opacity-30 disabled:pointer-events-none disabled:transform-none flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LinkIcon size={14} />
                  Bağlantıyı Ekle
                </button>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
