import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Map as MapIcon, Plus, Undo2, Trash2 } from 'lucide-react';
import { useUniverseStore } from '@/store/useUniverseStore';
import type { MapRegion } from '@/types';

interface AddMapRegionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editItem?: MapRegion | null;
}

const PRESET_COLORS = [
  '#4db89c', '#4daeb8', '#4d7ab8', '#634db8', '#b84d94', '#b84d4d', '#b87f4d', '#b8af4d', '#E8D48B'
];

export function AddMapRegionModal({ isOpen, onClose, editItem }: AddMapRegionModalProps) {
  const { addRegion, updateRegion } = useUniverseStore();

  const [name, setName] = useState('');
  const [type, setType] = useState('Kıta');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [opacity, setOpacity] = useState(0.15);
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState<{x: number, y: number}[]>([]);

  // Generate SVG path from points
  const svgPath = points.length > 0 
    ? `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}${points.length > 2 ? ' Z' : ''}`
    : '';

  useEffect(() => {
    if (editItem && isOpen) {
      setName(editItem.name);
      setType(editItem.type);
      setColor(editItem.color);
      setOpacity(editItem.opacity || 0.15);
      setDescription(editItem.description || '');
      
      // Parse basic SVG path to points to allow editing if possible, or just keep it as a raw string if parsing fails
      const pathMatches = editItem.svgPath.match(/(\d+),(\d+)/g);
      if (pathMatches) {
        setPoints(pathMatches.map(m => {
          const [x, y] = m.split(',');
          return { x: Number(x), y: Number(y) };
        }));
      } else {
        setPoints([]);
      }
    } else if (!isOpen) {
      // Clear on close handled by setTimeout in handleClose
    }
  }, [editItem, isOpen]);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setName('');
      setType('Kıta');
      setColor(PRESET_COLORS[0]);
      setOpacity(0.15);
      setPoints([]);
      setDescription('');
    }, 300);
  };

  const handleSubmit = () => {
    if (!name.trim() || !svgPath.trim()) return;

    if (editItem) {
      updateRegion(editItem.id, {
        name: name.trim(),
        type: type.trim() || 'Kıta',
        color,
        opacity: Number(opacity),
        svgPath: svgPath.trim(),
        description: description.trim()
      });
    } else {
      addRegion({
        name: name.trim(),
        type: type.trim() || 'Kıta',
        color,
        opacity: Number(opacity),
        svgPath: svgPath.trim(),
        description: description.trim()
      });
    }

    handleClose();
  };

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    
    // Calculate click position relative to viewBox (1000x700)
    const scaleX = 1000 / rect.width;
    const scaleY = 700 / rect.height;
    
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);

    setPoints([...points, { x, y }]);
  };

  const undoLastPoint = () => {
    setPoints(points.slice(0, -1));
  };

  const clearPoints = () => {
    setPoints([]);
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
              className="relative w-full max-w-4xl rounded-2xl border border-white/10 bg-[#0e0e10]/95 backdrop-blur-xl shadow-2xl p-6 md:p-8 pointer-events-auto overflow-y-auto max-h-[90vh] custom-scrollbar"
              onClick={(e) => e.stopPropagation()}
              data-lenis-prevent="true"
            >
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-32 bg-mythos-accent/10 rounded-full blur-[60px] pointer-events-none" />

              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-serif text-lg tracking-[0.1em] text-[#E8D48B] uppercase flex items-center gap-2">
                    <MapIcon size={18} /> {editItem ? 'Harita: Bölgeyi Düzenle' : 'Harita: Yeni Bölge Ekle'}
                  </h2>
                  <p className="text-[0.65rem] text-white/40 tracking-wider mt-1">{editItem ? 'Bölge sınırlarını veya detaylarını güncelleyin.' : 'Evreninizin karanlık veya aydınlık sınırlarını belirleyin.'}</p>
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

                {/* 3. Row: Interactive SVG Canvas */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                     <label className="text-[0.6rem] uppercase tracking-widest text-white/40 font-serif">Bölgeyi Çiz</label>
                     <div className="flex items-center gap-2">
                        <button 
                          onClick={undoLastPoint} 
                          disabled={points.length === 0}
                          className="flex items-center gap-1 text-[0.6rem] text-white/60 hover:text-white disabled:opacity-30 transition-colors px-2 py-1 rounded bg-white/5 hover:bg-white/10 cursor-pointer"
                        >
                          <Undo2 size={12} /> Geri Al
                        </button>
                        <button 
                          onClick={clearPoints} 
                          disabled={points.length === 0}
                          className="flex items-center gap-1 text-[0.6rem] text-red-400/80 hover:text-red-400 disabled:opacity-30 transition-colors px-2 py-1 rounded bg-red-400/10 hover:bg-red-400/20 cursor-pointer"
                        >
                          <Trash2 size={12} /> Temizle
                        </button>
                     </div>
                  </div>
                  
                  <div className="relative w-full aspect-[10/7] bg-[#050506] border border-white/10 rounded-xl overflow-hidden group">
                    <div className="absolute inset-0 pointer-events-none opacity-20"
                         style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} 
                    />
                    
                    {points.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-white/20 font-serif text-sm">
                        Çizmeye başlamak için tıklayın
                      </div>
                    )}
                    
                    <svg 
                      viewBox="0 0 1000 700" 
                      className="w-full h-full cursor-crosshair relative z-10"
                      onClick={handleCanvasClick}
                    >
                      {/* Çizilen Bölge (Polygon) */}
                      {points.length > 2 && (
                        <path 
                          d={svgPath} 
                          fill={color} 
                          fillOpacity={opacity} 
                          stroke={color} 
                          strokeWidth="2"
                          strokeDasharray="4 4"
                          className="pointer-events-none"
                        />
                      )}
                      
                      {/* Henüz tamamlanmamış çizgi */}
                      {points.length > 0 && points.length <= 2 && (
                        <path 
                          d={svgPath} 
                          fill="none" 
                          stroke={color} 
                          strokeWidth="2"
                          strokeDasharray="4 4"
                          className="pointer-events-none"
                        />
                      )}

                      {/* Noktalar */}
                      {points.map((p, i) => (
                        <circle 
                          key={i} 
                          cx={p.x} 
                          cy={p.y} 
                          r="6" 
                          fill={i === 0 ? "#E8D48B" : color} 
                          stroke="#fff" 
                          strokeWidth="2"
                          className="pointer-events-none"
                        />
                      ))}
                    </svg>
                  </div>
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
                  {editItem ? 'Değişiklikleri Kaydet' : 'Haritaya İşle'}
                </button>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
