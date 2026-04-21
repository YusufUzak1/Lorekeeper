import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, MapPin, Calendar, Network } from 'lucide-react';
import { useUniverseStore } from '@/store/useUniverseStore';
import type { EntityType } from '@/types';

// Olası kategori seçenekleri
const TYPE_OPTIONS: { value: EntityType; label: string; icon: any }[] = [
  { value: 'character', label: 'Karakter', icon: <UserPlus size={16} /> },
  { value: 'place', label: 'Mekan / Bölge', icon: <MapPin size={16} /> },
  { value: 'event', label: 'Tarihi Olay', icon: <Calendar size={16} /> },
];

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'active', label: 'Aktif / Yaşıyor' },
  { value: 'dead', label: 'Ölü / Yıkılmış / Geçmiş' },
  { value: 'unknown', label: 'Bilinmiyor / Efsane' },
];

interface AddEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: EntityType;
}

export function AddEntityModal({ isOpen, onClose, defaultType = 'character' }: AddEntityModalProps) {
  const { addEntity } = useUniverseStore();

  const [type, setType] = useState<EntityType>(defaultType);
  const [name, setName] = useState('');
  const [era, setEra] = useState('');
  const [status, setStatus] = useState(STATUS_OPTIONS[0].value);
  const [faction, setFaction] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [description, setDescription] = useState('');

  const resetForm = () => {
    setName('');
    setEra('');
    setStatus(STATUS_OPTIONS[0].value);
    setFaction('');
    setTagsInput('');
    setDescription('');
  };

  const handleSubmit = () => {
    if (!name.trim()) return;

    const domains = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    addEntity({
      type,
      name: name.trim(),
      era: era.trim() || 'Bilinmiyor',
      status: status as any,
      domains,
      description: description.trim(),
    });

    resetForm();
    onClose();
  };

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
            onClick={onClose}
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
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-40 bg-mythos-accent/10 rounded-full blur-[80px] pointer-events-none" />

              <div className="relative flex items-center justify-between px-8 pt-8 pb-4">
                <div>
                  <h2 className="font-serif text-xl tracking-[0.15em] text-[#E8D48B] uppercase">
                    Yeni Varlık Ekle
                  </h2>
                  <p className="text-[0.65rem] text-white/30 mt-1 tracking-wider">
                    Evreninize yeni bir Karakter, Mekan veya Olay ekleyin.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="px-8 pb-8 flex flex-col gap-5">
                {/* Type Selection */}
                <div className="flex gap-2">
                  {TYPE_OPTIONS.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setType(t.value)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border text-xs uppercase tracking-wider transition-all cursor-pointer ${
                        type === t.value
                          ? 'bg-mythos-accent/10 border-mythos-accent/50 text-mythos-accent shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                          : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                      }`}
                    >
                      {t.icon}
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Name */}
                <label className="flex flex-col gap-1.5">
                  <span className="text-[0.6rem] uppercase tracking-[0.2em] text-white/40 font-serif">
                    İsim / Başlık *
                  </span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Örn. Aragorn, Yalnız Dağ, Birinci Çağ'ın Sonu..."
                    className="w-full rounded-lg bg-white/[0.03] border border-white/10 px-4 py-2.5 text-sm text-white/90 outline-none focus:border-mythos-accent/50 focus:ring-1 focus:ring-mythos-accent/30 transition-all placeholder:text-white/15"
                  />
                </label>

                {/* Grid row: Era and Status */}
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[0.6rem] uppercase tracking-[0.2em] text-white/40 font-serif">
                      Çağ / Dönem
                    </span>
                    <input
                      value={era}
                      onChange={(e) => setEra(e.target.value)}
                      placeholder="Örn. 3. Çağ"
                      className="w-full rounded-lg bg-white/[0.03] border border-white/10 px-4 py-2.5 text-sm text-white/90 outline-none focus:border-mythos-accent/50 transition-all placeholder:text-white/15"
                    />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-[0.6rem] uppercase tracking-[0.2em] text-white/40 font-serif">
                      Durum
                    </span>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full rounded-lg bg-white/[0.03] border border-white/10 px-4 py-2.5 text-sm text-white/90 outline-none focus:border-mythos-accent/50 transition-all"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-[#0e0e10] text-white">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {/* Faction & Tags */}
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[0.6rem] uppercase tracking-[0.2em] text-white/40 font-serif">
                      Grup / Irk / Bağlılık
                    </span>
                    <input
                      value={faction}
                      onChange={(e) => setFaction(e.target.value)}
                      placeholder="Örn. İnsanlar, Noldor, Rohan..."
                      className="w-full rounded-lg bg-white/[0.03] border border-white/10 px-4 py-2.5 text-sm text-white/90 outline-none focus:border-mythos-accent/50 transition-all placeholder:text-white/15"
                    />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-[0.6rem] uppercase tracking-[0.2em] text-white/40 font-serif">
                      Etiketler (virgülle ayırın)
                    </span>
                    <input
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="Örn. savaşçı, kral, kudretli"
                      className="w-full rounded-lg bg-white/[0.03] border border-white/10 px-4 py-2.5 text-sm text-white/90 outline-none focus:border-mythos-accent/50 transition-all placeholder:text-white/15"
                    />
                  </label>
                </div>

                {/* Description */}
                <label className="flex flex-col gap-1.5">
                  <span className="text-[0.6rem] uppercase tracking-[0.2em] text-white/40 font-serif">
                    Detaylı Açıklama
                  </span>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Bu varlık hakkında bilinmesi gerekenleri anlatın..."
                    rows={4}
                    className="w-full rounded-lg bg-white/[0.03] border border-white/10 px-4 py-2.5 text-sm text-white/90 outline-none focus:border-mythos-accent/50 transition-all placeholder:text-white/15 resize-none"
                  />
                </label>

                {/* Submit */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 text-xs uppercase tracking-[0.15em] text-white/40 hover:text-white/70 transition-colors rounded-lg border border-white/5 hover:border-white/10 cursor-pointer"
                  >
                    İptal
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!name.trim()}
                    className="group flex flex-1 items-center justify-center gap-2 px-6 py-2.5 text-xs uppercase tracking-[0.2em] font-semibold bg-gradient-to-r from-mythos-accent/90 to-mythos-accent/70 text-black rounded-lg hover:from-mythos-accent hover:to-mythos-accent/90 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                  >
                    <Network size={16} />
                    Varlığı Evrene Ekle
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
