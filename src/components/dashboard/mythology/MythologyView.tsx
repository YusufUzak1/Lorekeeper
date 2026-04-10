import { useUniverseStore } from '@/store/useUniverseStore';
import { motion } from 'framer-motion';
import { useRef, useState, useMemo } from 'react';
import type { MythCard } from '@/types';

export function MythologyView() {
  const { myths } = useUniverseStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Orta mouse tuşuyla kaydırma (Middle Click Drag-to-Scroll)
  const [isMiddleDragging, setIsMiddleDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1) { // 1 = Mouse Middle Button
      e.preventDefault();
      setIsMiddleDragging(true);
      setStartY(e.pageY - (scrollRef.current?.offsetTop || 0));
      setScrollTop(scrollRef.current?.scrollTop || 0);
    }
  };

  const onMouseUp = (e: React.MouseEvent) => {
    if (e.button === 1) setIsMiddleDragging(false);
  };

  const onMouseLeave = () => setIsMiddleDragging(false);

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isMiddleDragging || !scrollRef.current) return;
    const y = e.pageY - scrollRef.current.offsetTop;
    const walk = (y - startY) * 1.5; // Drag speed multiplier
    scrollRef.current.scrollTop = scrollTop - walk;
  };

  // Mitolojileri kendi tier'larına (sınıflarına) göre gruplama
  const groupedMyths = useMemo(() => {
    return myths.reduce((acc, myth) => {
      const category = myth.tier || 'Sınıflandırılmamış';
      if (!acc[category]) acc[category] = [];
      acc[category].push(myth);
      return acc;
    }, {} as Record<string, MythCard[]>);
  }, [myths]);

  return (
    <div 
      ref={scrollRef}
      className={`h-full w-full overflow-y-auto custom-scrollbar bg-[#0a0a0b] relative ${isMiddleDragging ? 'cursor-grabbing' : ''}`}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
    >
      {/* Arkasında hafif, puslu bir doku */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-mythos-accent/5 via-black to-black opacity-30" />

      <div className="p-8 md:p-12 relative z-10">
        {/* Başlık ve O Meşhur Alıntı (Artık işlevsel ve güzel bir tasarımla) */}
        <div className="mb-14 text-center max-w-2xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-3xl md:text-4xl tracking-[0.2em] text-[#E8D48B] drop-shadow-[0_0_20px_rgba(212,175,55,0.4)] mb-4 uppercase"
          >
            Panteon
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-serif italic text-[0.9rem] md:text-base text-gray-200/50 tracking-wider"
          >
            "Gölgeler dans eder; ışık, onların hikayesini yazar."
          </motion.p>
        </div>

        {/* Mitoloji Kategorileri */}
        <div className="max-w-7xl mx-auto pb-12 flex flex-col gap-16">
          {Object.entries(groupedMyths).map(([category, categoryMyths], gIdx) => (
            <div key={category} className="flex flex-col gap-6">
              {/* Kategori Başlığı */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: gIdx * 0.1 }}
                className="flex items-center gap-4 border-b border-white/5 pb-3"
              >
                <h3 className="font-serif text-[#E8D48B]/80 tracking-[0.15em] text-xl uppercase">
                  {category}
                </h3>
                <div className="text-xs font-sans text-white/20 tracking-wider">
                  ({categoryMyths.length} VARLIK)
                </div>
              </motion.div>

              {/* Kategori İçindeki Kartlar */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {categoryMyths.map((myth, idx) => (
                  <motion.div
                    key={myth.id}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 + 0.1, duration: 0.5, ease: 'easeOut' }}
                    className="glass-panel p-6 rounded-lg border border-white/5 flex flex-col relative overflow-hidden group cursor-pointer hover:bg-white/[0.03] transition-all duration-500"
                    style={{ '--accent-color': myth.color } as React.CSSProperties}
                  >
                    {/* Kartın içine sızan arka plan ışığı (glow) */}
                    <div 
                      className="absolute -top-12 -right-12 w-48 h-48 blur-[70px] opacity-10 group-hover:opacity-30 transition-opacity duration-700 rounded-full"
                      style={{ backgroundColor: myth.color }}
                    />
                    
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      {/* Sembol/Glyph */}
                      <div 
                        className="text-5xl font-serif leading-none" 
                        style={{ color: myth.color, textShadow: `0 0 15px ${myth.color}80` }}
                      >
                        {myth.glyph}
                      </div>
                      {/* Sınıf/Tier */}
                      <span className="font-serif text-[0.55rem] tracking-[0.2em] uppercase px-3 py-1.5 rounded bg-black/60 border shadow-sm" style={{ borderColor: `${myth.color}40`, color: myth.color }}>
                        {myth.tier}
                      </span>
                    </div>

                    <div className="relative z-10 flex flex-col flex-1">
                      <h3 className="font-serif text-2xl tracking-[0.1em] text-gray-100 mb-1 group-hover:text-white transition-colors drop-shadow-md">
                        {myth.name}
                      </h3>
                      <div 
                        className="font-serif italic text-[0.75rem] mb-5 opacity-70 tracking-wide" 
                        style={{ color: myth.color }}
                      >
                        {myth.epithet}
                      </div>
                      
                      <p className="text-[0.7rem] md:text-[0.75rem] leading-relaxed text-gray-200/60 mb-6 font-sans flex-1">
                        {myth.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {myth.domains.map(domain => (
                          <span 
                            key={domain} 
                            className="text-[0.55rem] uppercase tracking-wider px-2.5 py-1 rounded bg-white/5 border border-white/10 text-gray-200/50 group-hover:border-white/20 transition-colors"
                          >
                            {domain}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}

          {/* Hiç veri yoksa gösterilecek ekran */}
          {myths.length === 0 && (
            <div className="col-span-full border border-dashed border-white/10 rounded-xl p-16 text-center bg-white/[0.01]">
              <p className="font-serif italic text-gray-200/30 text-lg">
                Bu evrenin kökleri sessiz. Henüz hiçbir efsane fısıldanmadı.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
