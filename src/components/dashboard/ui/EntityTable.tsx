import { useUniverseStore } from '@/store/useUniverseStore';
import { useLocation } from 'react-router-dom';
import type { EntityType } from '@/types';
import { Network } from 'lucide-react';

export function EntityTable() {
  const { getEntitiesByType } = useUniverseStore();
  const location = useLocation();

  // Route'a göre hangi entity tipini göstereceğimizi belirleyelim
  const getTypeFromPath = (): EntityType => {
    if (location.pathname.includes('characters')) return 'character';
    if (location.pathname.includes('places')) return 'place';
    if (location.pathname.includes('events')) return 'event';
    return 'character'; // fallback
  };

  const currentType = getTypeFromPath();
  const entities = getEntitiesByType(currentType);

  return (
    <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
      <div className="glass-panel rounded-lg overflow-hidden flex flex-col h-full border border-mythos-accent/10">
        
        {/* Table Header Controls */}
        <div className="px-6 py-4 border-b border-glass-border bg-black/40 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-serif text-[0.6rem] tracking-[0.2em] uppercase text-gray-200/50">
              Filtrele:
            </span>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-[0.6rem] tracking-wider uppercase border border-mythos-accent/30 rounded-sm bg-mythos-accent/10 text-[#E8D48B]">
                Tümü
              </button>
              <button className="px-3 py-1 text-[0.6rem] tracking-wider uppercase border border-white/5 rounded-sm hover:bg-white/5 text-gray-200/50">
                Aktif
              </button>
              <button className="px-3 py-1 text-[0.6rem] tracking-wider uppercase border border-white/5 rounded-sm hover:bg-white/5 text-gray-200/50">
                Ölü/Yıkık
              </button>
            </div>
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-mythos-accent/20 to-transparent border border-mythos-accent text-[#E8D48B] font-serif text-[0.6rem] tracking-[0.2em] uppercase rounded-sm hover:bg-mythos-accent hover:text-black transition-all shadow-[0_0_15px_rgba(212,175,55,0.15)] flex items-center gap-2">
            <span className="text-lg leading-none mt-[-2px]">+</span> Yeni Ekle
          </button>
        </div>

        {/* The Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="sticky top-0 bg-[#121214] z-10 shadow-md">
              <tr>
                <th className="font-serif text-[0.5rem] tracking-[0.25em] text-gray-200/40 uppercase p-4 border-b border-glass-border w-[30%]">Varlık Adı</th>
                <th className="font-serif text-[0.5rem] tracking-[0.25em] text-gray-200/40 uppercase p-4 border-b border-glass-border w-[20%]">Çağ/Dönem</th>
                <th className="font-serif text-[0.5rem] tracking-[0.25em] text-gray-200/40 uppercase p-4 border-b border-glass-border w-[15%]">Durum</th>
                <th className="font-serif text-[0.5rem] tracking-[0.25em] text-gray-200/40 uppercase p-4 border-b border-glass-border text-center w-[15%]">Bağlantılar</th>
                <th className="font-serif text-[0.5rem] tracking-[0.25em] text-gray-200/40 uppercase p-4 border-b border-glass-border text-right w-[20%]">Aksiyonlar</th>
              </tr>
            </thead>
            <tbody>
              {entities.map(entity => (
                <tr key={entity.id} className="group hover:bg-white/[0.02] transition-colors border-b border-glass-border/50 last:border-0">
                  <td className="p-4">
                    <div className="font-serif text-[0.75rem] tracking-[0.1em] text-gray-200/90 group-hover:text-mythos-accent transition-colors flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-mythos-accent/50 shadow-[0_0_8px_rgba(212,175,55,0.5)]" />
                      {entity.name}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-[0.65rem] tracking-[0.1em] text-gray-200/60 font-sans px-2.5 py-1 bg-white/5 rounded-sm border border-white/5">
                      {entity.era}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={ [
                      'text-[0.6rem] tracking-[0.15em] uppercase px-2 py-0.5 rounded-full border',
                      entity.status === 'Aktif' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : ['Ölü', 'Yıkık', 'Yok'].includes(entity.status) 
                          ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                          : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                    ].join(' ') }>
                      {entity.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-mythos-accent/5 text-[#E8D48B] text-[0.65rem] border border-mythos-accent/20 rounded-sm">
                      <Network size={12} className="opacity-70" />
                      {entity.linkCount}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button className="font-serif text-[0.55rem] tracking-[0.2em] text-mythos-accent/70 hover:text-mythos-accent uppercase flex items-center justify-end gap-1.5 ml-auto transition-colors group-hover:drop-shadow-[0_0_5px_rgba(212,175,55,0.5)]">
                      Görüntüle <span>→</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {entities.length === 0 && (
            <div className="flex flex-col items-center justify-center p-20 text-center opacity-50">
              <div className="font-serif text-xl mb-2">Veri Bulunamadı</div>
              <div className="text-sm">Bu kategoriye ait henüz bir kayıt oluşturulmamış.</div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
