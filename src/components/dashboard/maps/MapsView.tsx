import { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUniverseStore } from '@/store/useUniverseStore';
import { Compass, ZoomIn, ZoomOut, Maximize, Plus, Map as MapIcon } from 'lucide-react';
import type { MapRegion } from '@/types';
import { AddMapRegionModal } from './AddMapRegionModal';

export function MapsView() {
  const { regions, currentUniverseId } = useUniverseStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mevcut evrenin bölgeleri
  const currentRegions = useMemo(() => {
    return regions.filter(r => r.universeId === currentUniverseId);
  }, [regions, currentUniverseId]);

  // Harita navigasyon state'leri
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartReq = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });

  const [hoveredRegion, setHoveredRegion] = useState<MapRegion | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Pan kontrolleri
  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 && e.button !== 1) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartReq.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { x: pan.x, y: pan.y };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    // Tooltip position
    setMousePos({ x: e.clientX, y: e.clientY });

    // Dragging
    if (isDragging) {
      const dx = e.clientX - dragStartReq.current.x;
      const dy = e.clientY - dragStartReq.current.y;
      setPan({
        x: panStartRef.current.x + dx,
        y: panStartRef.current.y + dy
      });
    }
  };

  const onMouseUp = () => setIsDragging(false);
  const onMouseLeave = () => {
    setIsDragging(false);
    setHoveredRegion(null);
  };

  const handleZoom = (amount: number) => {
    setZoom((prev) => Math.max(0.2, Math.min(prev + amount, 3)));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Tüm Pathleri SVG koordinatları etrafında çizelim
  // Eski dökümanda <svg viewBox="0 0 1000 700"> standardı kullanılmıştı.
  const SVG_WIDTH = 1000;
  const SVG_HEIGHT = 700;

  return (
    <div className="h-full w-full bg-[#0a0a0b] flex flex-col md:flex-row relative overflow-hidden" onMouseLeave={onMouseLeave}>
      {/* Arkasında hafif puslu doku */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-mythos-accent/5 via-black to-black opacity-30" />

      {/* Sol Panel: Bölgeler */}
      <div className="w-full md:w-72 h-48 md:h-full bg-black/40 border-b md:border-b-0 md:border-r border-white/10 z-10 flex flex-col backdrop-blur-md">
        <div className="p-6 border-b border-white/5 flex flex-col gap-4">
          <div>
            <h2 className="font-serif text-lg tracking-[0.2em] text-[#E8D48B] uppercase flex items-center gap-2">
              <Compass size={18} /> Bilinen Dünyalar
            </h2>
            <p className="text-[0.6rem] text-white/40 tracking-wider mt-1 uppercase font-serif">Kıtalar, Diyarlar ve Denizler</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full mt-2 group inline-flex justify-center items-center gap-2 px-4 py-2 rounded-sm border border-mythos-accent/30 bg-mythos-accent/5 text-[#E8D48B] text-[0.6rem] uppercase tracking-[0.25em] font-serif hover:bg-mythos-accent/15 hover:border-mythos-accent/50 transition-all cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.05)] hover:shadow-[0_0_25px_rgba(212,175,55,0.15)]"
          >
            <Plus size={14} className="group-hover:rotate-90 transition-transform duration-300" />
            Bölge Ekle
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-2">
          {currentRegions.length === 0 ? (
            <div className="text-center p-6 text-white/20 text-xs font-serif uppercase tracking-widest border border-dashed border-white/10 rounded-lg">
              Henüz bölge eklenmedi
            </div>
          ) : (
            currentRegions.map(region => (
              <div 
                key={region.id}
                onMouseEnter={() => setHoveredRegion(region)}
                onMouseLeave={() => setHoveredRegion(null)}
                className={`p-3 rounded border transition-all cursor-pointer ${
                  hoveredRegion?.id === region.id 
                  ? 'border-mythos-accent/50 bg-white/5' 
                  : 'border-white/5 bg-transparent hover:border-white/20 hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: region.color }} />
                  <div>
                    <div className="font-serif text-[0.65rem] tracking-[0.1em] text-white/90">{region.name}</div>
                    <div className="font-serif italic text-[0.55rem] text-white/40">{region.type}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sağ Panel: Harita Canvas */}
      <div className="flex-1 relative overflow-hidden bg-[#0D0E12] flex items-center justify-center">
        {/* Kontroller */}
        <div className="absolute right-6 bottom-6 z-20 flex flex-col gap-2">
           <button onClick={() => handleZoom(0.2)} className="w-10 h-10 rounded-full bg-black/60 backdrop-blur border border-white/10 flex items-center justify-center text-white/50 hover:text-[#E8D48B] hover:border-mythos-accent/40 hover:bg-black/80 transition-all cursor-pointer"><ZoomIn size={16} /></button>
           <button onClick={() => handleZoom(-0.2)} className="w-10 h-10 rounded-full bg-black/60 backdrop-blur border border-white/10 flex items-center justify-center text-white/50 hover:text-[#E8D48B] hover:border-mythos-accent/40 hover:bg-black/80 transition-all cursor-pointer"><ZoomOut size={16} /></button>
           <button onClick={resetView} className="w-10 h-10 rounded-full bg-black/60 backdrop-blur border border-white/10 flex items-center justify-center text-white/50 hover:text-[#E8D48B] hover:border-mythos-accent/40 hover:bg-black/80 transition-all cursor-pointer"><Maximize size={16} /></button>
        </div>

        {/* Harita */}
        <div 
          className={`absolute w-full h-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
        >
          <motion.div
            className="w-full h-full flex items-center justify-center"
            animate={{ x: pan.x, y: pan.y, scale: zoom }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            {currentRegions.length === 0 ? (
               <div className="text-white/20 text-sm font-serif tracking-widest flex flex-col items-center gap-4">
                 <MapIcon size={48} className="opacity-20" />
                 Bilinmeyen Topraklar
               </div>
            ) : (
              <svg 
                viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} 
                className="w-full h-full max-w-[1200px]"
                vectorEffect="non-scaling-stroke"
              >
                {/* Okyanus / grid dokusu veya desenler eklenebilir */}
                {/* <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill="transparent" /> */}

                {/* Bölgeler */}
                {currentRegions.map(region => {
                  const isHovered = hoveredRegion?.id === region.id;
                  return (
                    <motion.path
                      key={region.id}
                      d={region.svgPath}
                      fill={region.color}
                      fillOpacity={isHovered ? 0.35 : region.opacity || 0.15}
                      stroke={region.color}
                      strokeWidth={isHovered ? 3 : 1.5}
                      strokeOpacity={isHovered ? 1 : 0.4}
                      onMouseEnter={() => setHoveredRegion(region)}
                      onMouseLeave={() => setHoveredRegion(null)}
                      className="cursor-pointer transition-colors duration-300 drop-shadow-sm"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                  );
                })}
              </svg>
            )}
          </motion.div>
        </div>
      </div>

      {/* Dinamik Tooltip Özelliği */}
      <AnimatePresence>
        {hoveredRegion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="fixed pointer-events-none z-[100] bg-[#0c0c0e]/95 border border-white/10 rounded-xl p-4 shadow-2xl backdrop-blur-md max-w-[280px]"
            style={{ left: mousePos.x + 20, top: mousePos.y + 20 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_8px_currentColor]" style={{ backgroundColor: hoveredRegion.color, color: hoveredRegion.color }} />
              <div className="font-serif tracking-[0.1em] text-[0.7rem] text-[#E8D48B] uppercase">{hoveredRegion.name}</div>
            </div>
            <div className="text-[0.6rem] font-serif uppercase tracking-widest text-white/30 border-b border-white/5 pb-2 mb-2">
              {hoveredRegion.type}
            </div>
            <div className="font-serif italic text-white/60 text-[0.65rem] leading-relaxed line-clamp-4">
              {hoveredRegion.description}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AddMapRegionModal 
         isOpen={isModalOpen}
         onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
