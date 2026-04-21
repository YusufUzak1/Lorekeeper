import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, MapPin, AlignEndHorizontal, AlignStartHorizontal, Plus } from 'lucide-react';
import { useUniverseStore } from '@/store/useUniverseStore';

interface AddTimelineEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEra: string;
}

const PRESET_COLORS = [
  '#E8D48B', '#f2d2d8', '#7ecfff', '#4db89c', '#e85050', '#8888bb', '#B8962E', '#e8a0d0'
];

export function AddTimelineEventModal({ isOpen, onClose, defaultEra }: AddTimelineEventModalProps) {
  const { addTimelineEvent } = useUniverseStore();

  const [era, setEra] = useState(defaultEra || 'Yaratılış Çağı');
  const [year, setYear] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [position, setPosition] = useState(500);
  const [side, setSide] = useState<'above' | 'below'>('above');

  // Reset function to clear the modal when opened/closed.
  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setYear('');
      setName('');
      setDescription('');
      setColor(PRESET_COLORS[0]);
      setPosition(500);
      setSide('above');
    }, 300);
  };

  const handleSubmit = () => {
    if (!name.trim() || !year.trim()) return;

    addTimelineEvent({
      era: era.trim() || 'Bilinmeyen Çağ',
      year: year.trim(),
      name: name.trim(),
      description: description.trim(),
      color,
      position: Number(position) || 500,
      side
    });

    handleClose();
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
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm pointer-events-auto"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-[#0e0e10]/95 backdrop-blur-xl shadow-2xl p-6 md:p-8 pointer-events-auto overflow-y-auto max-h-[90vh] custom-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-32 bg-mythos-accent/10 rounded-full blur-[60px] pointer-events-none" />

              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-serif text-lg tracking-[0.1em] text-[#E8D48B] uppercase flex items-center gap-2">
                    <Clock size={18} /> Zaman Çizelgesi: Olay Ekle
                  </h2>
                  <p className="text-[0.65rem] text-white/40 tracking-wider mt-1">Tarihin akışına yeni bir dönüm noktası kazıyın.</p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-1.5 rounded-lg text-white/30 hover:text-white/80 hover:bg-white/5 transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Body */}
              <div className="flex flex-col gap-6">
                
                {/* 1. Row: Era & Year */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex flex-col gap-2 flex-1">
                    <label className="text-[0.6rem] uppercase tracking-widest text-white/40 font-serif">Çağ / Devir Adı</label>
                    <input
                      type="text"
                      value={era}
                      onChange={(e) => setEra(e.target.value)}
                      placeholder="Örn: Yaratılış Çağı"
                      className="w-full rounded-lg bg-white/[0.03] border border-white/10 px-4 py-3 text-sm text-white/90 outline-none focus:border-mythos-accent/50 focus:ring-1 focus:ring-mythos-accent/30 transition-all font-serif"
                    />
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <label className="text-[0.6rem] uppercase tracking-widest text-white/40 font-serif">Tarih / Yıl Formatı</label>
                    <input
                      type="text"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      placeholder="Örn: B.Ç. 455"
                      className="w-full rounded-lg bg-white/[0.03] border border-white/10 px-4 py-3 text-sm text-white/90 outline-none focus:border-mythos-accent/50 focus:ring-1 focus:ring-mythos-accent/30 transition-all font-serif text-[#E8D48B]"
                    />
                  </div>
                </div>

                {/* 2. Row: Name */}
                <div className="flex flex-col gap-2">
                  <label className="text-[0.6rem] uppercase tracking-widest text-white/40 font-serif">Olay Başlığı</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Örn: Dagor Bragollach"
                    className="w-full rounded-lg bg-white/[0.03] border border-white/10 px-4 py-3 text-sm text-white/90 outline-none focus:border-mythos-accent/50 focus:ring-1 focus:ring-mythos-accent/30 transition-all font-serif"
                  />
                </div>

                {/* 3. Row: Description */}
                <div className="flex flex-col gap-2">
                  <label className="text-[0.6rem] uppercase tracking-widest text-white/40 font-serif">Açıklama & Detaylar</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Olayın detaylı tanımı..."
                    rows={3}
                    className="w-full rounded-lg bg-white/[0.03] border border-white/10 px-4 py-3 text-sm text-white/90 outline-none focus:border-mythos-accent/50 focus:ring-1 focus:ring-mythos-accent/30 transition-all custom-scrollbar resize-none font-serif italic"
                  />
                </div>

                {/* 4. Row: Theme Color & Side & Position */}
                <div className="flex flex-col md:flex-row gap-6 p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                  
                  <div className="flex flex-col flex-1 gap-2 border-r border-white/5 pr-4">
                    <label className="text-[0.6rem] uppercase tracking-widest text-white/40 font-serif">Tema Rengi</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {PRESET_COLORS.map((c) => (
                        <div
                          key={c}
                          onClick={() => setColor(c)}
                          className={`w-6 h-6 rounded-full cursor-pointer transition-all border-2 ${color === c ? 'border-white scale-110 shadow-[0_0_10px_currentColor]' : 'border-transparent hover:scale-110 opacity-60 hover:opacity-100'}`}
                          style={{ backgroundColor: c, color: color === c ? c : 'transparent' }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col flex-1 gap-4">
                     <div className="flex flex-col gap-2">
                        <label className="text-[0.6rem] uppercase tracking-widest text-white/40 font-serif flex items-center gap-1.5">
                          <MapPin size={12} /> Yatay Pozisyon (Pixel)
                        </label>
                        <div className="flex items-center gap-3">
                          <input 
                            type="range" min="50" max="3000" step="10" 
                            value={position} onChange={(e) => setPosition(Number(e.target.value))} 
                            className="flex-1 accent-mythos-accent" 
                          />
                          <span className="text-[0.65rem] text-white/60 font-mono w-10 text-right">{position}</span>
                        </div>
                     </div>

                     <div className="flex flex-col gap-2">
                        <label className="text-[0.6rem] uppercase tracking-widest text-white/40 font-serif">Ağaç Tarafı</label>
                        <div className="flex gap-2 bg-black/50 p-1 rounded-lg border border-white/5">
                           <button
                             type="button"
                             onClick={() => setSide('above')}
                             className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-[0.6rem] tracking-wider uppercase transition-all ${side === 'above' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/80'}`}
                           >
                             <AlignEndHorizontal size={14} /> Üst
                           </button>
                           <button
                             type="button"
                             onClick={() => setSide('below')}
                             className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-[0.6rem] tracking-wider uppercase transition-all ${side === 'below' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/80'}`}
                           >
                             <AlignStartHorizontal size={14} /> Alt
                           </button>
                        </div>
                     </div>
                  </div>

                </div>

                {/* Footer Actions */}
                <button
                  onClick={handleSubmit}
                  disabled={!name.trim() || !year.trim()}
                  className="w-full mt-2 py-3.5 rounded-lg bg-gradient-to-r from-mythos-accent/90 to-mythos-accent/60 text-black font-semibold text-xs tracking-[0.2em] uppercase transition-all hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] disabled:opacity-30 disabled:pointer-events-none disabled:transform-none flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus size={14} />
                  Olayı Çizelgeye Ekle
                </button>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
