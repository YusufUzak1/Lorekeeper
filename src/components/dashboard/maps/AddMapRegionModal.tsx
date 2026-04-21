import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Map as MapIcon, Plus, Info } from 'lucide-react';
import { useUniverseStore } from '@/store/useUniverseStore';

interface AddMapRegionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_COLORS = [
  '#4db89c', '#4daeb8', '#4d7ab8', '#634db8', '#b84d94', '#b84d4d', '#b87f4d', '#b8af4d', '#E8D48B'
];

export function AddMapRegionModal({ isOpen, onClose }: AddMapRegionModalProps) {
  const { addRegion } = useUniverseStore();

  const [name, setName] = useState('');
  const [type, setType] = useState('Kıta');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [opacity, setOpacity] = useState(0.15);
  const [svgPath, setSvgPath] = useState('');
  const [description, setDescription] = useState('');

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setName('');
      setType('Kıta');
      setColor(PRESET_COLORS[0]);
      setOpacity(0.15);
      setSvgPath('');
      setDescription('');
    }, 300);
  };

  const handleSubmit = () => {
    if (!name.trim() || !svgPath.trim()) return;

    addRegion({
      name: name.trim(),
      type: type.trim() || 'Kıta',
      color,
      opacity: Number(opacity),
      svgPath: svgPath.trim(),
      description: description.trim()
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
                    <MapIcon size={18} /> Harita: Yeni Bölge Ekle
                  </h2>
                  <p className="text-[0.65rem] text-white/40 tracking-wider mt-1">Evreninizin karanlık veya aydınlık sınırlarını belirleyin.</p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-1.5 rounded-lg text-white/30 hover:text-white/80 hover:bg-white/5 transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <div className="flex flex-col gap-6">

                {/* 1. Row: Name & Type */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex flex-col gap-2 flex-1">
                    <label className="text-[0.6rem] uppercase tracking-widest text-white/40 font-serif">Bölge Adı</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Örn: Beleriand"
                      className="w-full rounded-lg bg-white/[0.03] border border-white/10 px-4 py-3 text-sm text-white/90 outline-none focus:border-mythos-accent/50 focus:ring-1 focus:ring-mythos-accent/30 transition-all font-serif"
                    />
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <label className="text-[0.6rem] uppercase tracking-widest text-white/40 font-serif">Coğrafi Türü</label>
                    <input
                      type="text"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      placeholder="Örn: Kıta, Krallık, Deniz"
                      className="w-full rounded-lg bg-white/[0.03] border border-white/10 px-4 py-3 text-sm text-white/90 outline-none focus:border-mythos-accent/50 focus:ring-1 focus:ring-mythos-accent/30 transition-all font-serif"
                    />
                  </div>
                </div>

                {/* 2. Row: Description */}
                <div className="flex flex-col gap-2">
                  <label className="text-[0.6rem] uppercase tracking-widest text-white/40 font-serif">Arka Plan Bilgisi</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Bölgenin efsanevi tarihi, coğrafi yapısı..."
                    rows={3}
                    className="w-full rounded-lg bg-white/[0.03] border border-white/10 px-4 py-3 text-sm text-white/90 outline-none focus:border-mythos-accent/50 focus:ring-1 focus:ring-mythos-accent/30 transition-all resize-none custom-scrollbar font-serif italic text-white/80"
                  />
                </div>

                {/* 3. Row: SVG Path */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                     <label className="text-[0.6rem] uppercase tracking-widest text-white/40 font-serif">SVG Yolu (Path)</label>
                     <div className="flex items-center gap-1 text-[0.55rem] text-mythos-accent/70 bg-mythos-accent/10 px-2 py-0.5 rounded">
                        <Info size={10} /> 1000x700 viewBox'a göre `d="..."` verisi olmalı
                     </div>
                  </div>
                  <textarea
                    value={svgPath}
                    onChange={(e) => setSvgPath(e.target.value)}
                    placeholder="M 100,100 L 200,100 L 200,200 Z"
                    rows={4}
                    className="w-full rounded-lg bg-black text-mythos-accent/80 border border-white/10 px-4 py-3 text-[0.7rem] outline-none focus:border-mythos-accent/50 focus:ring-1 focus:ring-mythos-accent/30 transition-all resize-none custom-scrollbar font-mono"
                  />
                </div>

                {/* 4. Row: Color & Opacity */}
                <div className="flex flex-col md:flex-row gap-6 p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                   <div className="flex flex-col flex-1 gap-2 border-r border-white/5 pr-4">
                     <label className="text-[0.6rem] uppercase tracking-widest text-white/40 font-serif">Vurgu Rengi</label>
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

                   <div className="flex flex-col flex-1 gap-2 justify-center">
                     <label className="text-[0.6rem] uppercase tracking-widest text-white/40 font-serif">Opaklık (Dolgu)</label>
                     <div className="flex items-center gap-3">
                       <input 
                         type="range" min="0" max="1" step="0.05" 
                         value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} 
                         className="flex-1 accent-white" 
                       />
                       <span className="text-[0.65rem] text-white/60 font-mono w-8 text-right">{opacity.toFixed(2)}</span>
                     </div>
                   </div>
                </div>

                {/* Action button */}
                <button
                  onClick={handleSubmit}
                  disabled={!name.trim() || !svgPath.trim()}
                  className="w-full mt-2 py-3.5 rounded-lg bg-gradient-to-r from-mythos-accent/90 to-mythos-accent/60 text-black font-semibold text-xs tracking-[0.2em] uppercase transition-all hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] disabled:opacity-30 disabled:pointer-events-none disabled:transform-none flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus size={14} />
                  Haritaya İşle
                </button>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
