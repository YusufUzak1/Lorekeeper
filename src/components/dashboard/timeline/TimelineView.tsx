import { useUniverseStore } from '@/store/useUniverseStore';
import { motion } from 'framer-motion';
import { useState, useMemo, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { AddTimelineEventModal } from './AddTimelineEventModal';

export function TimelineView() {
  const { timeline, currentUniverseId } = useUniverseStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Filtreleme: Yalnızca mevcut evrenin timeline eventlerini al
  const currentEvents = useMemo(() => {
    return timeline.filter((t) => t.universeId === currentUniverseId);
  }, [timeline, currentUniverseId]);

  // Eraları (Çağları) Çıkart
  const eras = useMemo(() => {
    const eraSet = new Set<string>();
    currentEvents.forEach(e => eraSet.add(e.era || 'Bilinmeyen Çağ'));
    // Eğer hiç çağ yoksa varsayılan bir çağ ekleyebiliriz
    if (eraSet.size === 0) eraSet.add('Yaratılış Çağı');
    return Array.from(eraSet);
  }, [currentEvents]);

  // Aktif Sekme (Era)
  const [activeEra, setActiveEra] = useState<string>(eras[0] || 'Yaratılış Çağı');

  // Her era değiştiğinde veya yeni veriler geldiğinde eras array'inin geçerliliğini kontrol et
  useEffect(() => {
    if (!eras.includes(activeEra) && eras.length > 0) {
      setActiveEra(eras[0]);
    }
  }, [eras, activeEra]);

  // Aktif Era'daki olaylar
  const eventsInActiveEra = useMemo(() => {
    return currentEvents.filter(e => (e.era || 'Bilinmeyen Çağ') === activeEra).sort((a,b) => a.position - b.position);
  }, [currentEvents, activeEra]);

  // Middle-click to scroll functionality
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || e.button === 0) { // Middle or Left click to drag the timeline
      e.preventDefault();
      setIsDragging(true);
      setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
      setScrollLeft(scrollRef.current?.scrollLeft || 0);
    }
  };

  const onMouseUp = () => setIsDragging(false);
  const onMouseLeave = () => setIsDragging(false);

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Scroll-fast
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  // Dinamik Genişlik: Eğer içerideki olayların position'ları 1400px'den büyükse,
  // container'ı büyütmemiz gerekir.
  const maxPos = eventsInActiveEra.length > 0 ? Math.max(...eventsInActiveEra.map(e => e.position)) : 1000;
  const containerWidth = Math.max(1400, maxPos + 200);

  return (
    <div className="h-full w-full bg-[#0a0a0b] flex flex-col relative overflow-hidden">
      {/* Arkasında hafif puslu doku */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-mythos-accent/5 via-black to-black opacity-30" />

      {/* Header & Tabs */}
      <div className="flex-shrink-0 z-10 px-8 pt-8">
        <div className="flex justify-between items-end mb-6">
          <div>
             <motion.h2 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-serif text-3xl tracking-[0.2em] text-[#E8D48B] drop-shadow-[0_0_20px_rgba(212,175,55,0.4)] uppercase"
            >
              Zaman Çizelgesi
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="font-serif italic text-[0.9rem] text-gray-200/50 tracking-wider mt-2"
            >
              "Tarih, sadece bir sıradanlık değil, eylemlerin ritmidir."
            </motion.p>
          </div>
          
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <button
              onClick={() => setIsModalOpen(true)}
              className="group inline-flex items-center gap-2 px-5 py-2 rounded-sm border border-mythos-accent/30 bg-mythos-accent/5 text-[#E8D48B] text-[0.6rem] uppercase tracking-[0.25em] font-serif hover:bg-mythos-accent/15 hover:border-mythos-accent/50 transition-all cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.05)] hover:shadow-[0_0_25px_rgba(212,175,55,0.15)]"
            >
              <Plus size={14} className="group-hover:rotate-90 transition-transform duration-300" />
              Yeni Olay Ekle
            </button>
          </motion.div>
        </div>

        {/* Sekmeler */}
        <div className="flex gap-0 border-b border-white/10 overflow-x-auto custom-scrollbar pb-[1px]">
          {eras.map(era => (
            <button
              key={era}
              onClick={() => setActiveEra(era)}
              className={`px-5 py-2.5 font-serif text-[0.55rem] tracking-[0.2em] uppercase transition-all whitespace-nowrap border-b-2 ${
                activeEra === era
                  ? 'text-[#E8D48B] border-mythos-accent drop-shadow-[0_0_10px_rgba(212,175,55,0.35)]'
                  : 'text-gray-200/40 border-transparent hover:text-gray-200/70'
              }`}
            >
              {era}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas Area */}
      <div 
        ref={scrollRef}
        className={`flex-1 relative overflow-x-auto overflow-y-hidden custom-scrollbar ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onMouseMove={onMouseMove}
      >
        <div 
          className="relative h-full min-h-[430px] px-20 py-8 transition-all duration-500"
          style={{ minWidth: `${containerWidth}px` }}
        >
          {/* Spine Yolu */}
          <div className="absolute left-[80px] right-[80px] top-1/2 h-[1px] bg-gradient-to-r from-transparent via-mythos-accent/25 to-transparent shadow-[0_0_6px_rgba(212,175,55,0.12)] -translate-y-1/2" />
          <div className="absolute left-[80px] right-[80px] top-1/2 h-[1px] bg-gradient-to-r from-transparent via-mythos-accent/10 to-transparent blur-[6px] -translate-y-1/2" />

          {/* Olaylar */}
          {eventsInActiveEra.map((ev, index) => (
             <motion.div
               key={ev.id}
               initial={{ opacity: 0, y: ev.side === 'above' ? 20 : -20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: index * 0.05, duration: 0.4 }}
               className={`absolute transform -translate-x-1/2 flex items-center group cursor-pointer hover:z-20 ${
                 ev.side === 'above' ? 'bottom-[calc(50%+4px)] flex-col-reverse' : 'top-[calc(50%+4px)] flex-col'
               }`}
               style={{ left: `${ev.position}px` }}
             >
               {/* Nokta */}
               <div 
                 className="w-2.5 h-2.5 rounded-full border border-solid flex-shrink-0 transition-transform duration-300 group-hover:scale-150 relative"
                 style={{ borderColor: ev.color, backgroundColor: `${ev.color}20` }}
               >
                 <div className="absolute inset-[-4px] rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300" style={{ background: `radial-gradient(circle, ${ev.color}, transparent)` }} />
               </div>

               {/* Çubuk (Stem) */}
               <div className={`w-[1px] flex-shrink-0 transition-colors duration-300 group-hover:bg-white/30 bg-white/10 ${ev.side === 'above' ? 'h-4' : 'h-4'}`} />

               {/* Kart */}
               <div 
                 className="bg-[#0D0D0E]/90 border border-white/[0.05] p-3 max-w-[155px] min-w-[125px] transition-all duration-300 group-hover:border-mythos-accent/30 group-hover:shadow-[0_0_22px_rgba(0,0,0,0.8),0_0_14px_rgba(212,175,55,0.07)]"
                 style={ev.side === 'above' ? { marginBottom: '4px' } : { marginTop: '4px' }}
               >
                 <div className="font-serif text-[0.45rem] tracking-[0.2em] uppercase mb-1" style={{ color: ev.color }}>{ev.year}</div>
                 <div className="font-serif text-[0.6rem] tracking-[0.1em] text-[#E8D48B] mb-1">{ev.name}</div>
                 <div className="font-serif italic text-[0.7rem] text-gray-200/50 line-clamp-4 leading-snug">{ev.description}</div>
               </div>
             </motion.div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <AddTimelineEventModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        defaultEra={activeEra}
      />
    </div>
  );
}
