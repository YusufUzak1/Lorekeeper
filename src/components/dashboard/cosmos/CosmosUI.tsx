import { Search, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface CosmosUIProps {
  // Filtreler
  activeFilter: string;
  onFilterChange: (type: string) => void;
  // Arama
  searchQuery: string;
  onSearchChange: (query: string) => void;
  // Zoom
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export function CosmosUI({
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}: CosmosUIProps) {
  return (
    // Pointer-events-none ile canvas tıklamalarını engellemiyoruz
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between">
      
      {/* ÜST BÖLGE: Filtreler ve Arama */}
      <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pointer-events-auto">
        {/* Filtre Pill'leri */}
        <div className="flex flex-wrap gap-2">
          {['all', 'character', 'place', 'event'].map((filterType) => {
            const labels: Record<string, string> = {
              all: 'TÜMÜ',
              character: 'KARAKTERLER',
              place: 'MEKANLAR',
              event: 'OLAYLAR',
            };
            const isActive = activeFilter === filterType;
            return (
              <button
                key={filterType}
                onClick={() => onFilterChange(filterType)}
                className={`px-3 py-1 border font-serif text-[0.42rem] tracking-[0.15em] transition-all
                  ${isActive 
                    ? 'border-mythos-accent/40 text-[#E8D48B] bg-mythos-accent/10 drop-shadow-[0_0_12px_rgba(212,175,55,0.1)]' 
                    : 'border-white/5 text-gray-200/40 hover:text-gray-200/80 bg-[#0e0e0f]/80'
                  }`}
              >
                {labels[filterType]}
              </button>
            );
          })}
        </div>

        {/* Arama Kutusu */}
        <div className="relative pointer-events-auto">
          <input
            type="text"
            placeholder="DÜĞÜM ARA..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-48 bg-[#0e0e0f]/80 border border-white/5 text-gray-200/60 font-serif text-[0.55rem] tracking-[0.15em] px-3 py-2 pl-8 focus:outline-none focus:border-mythos-accent/40 focus:drop-shadow-[0_0_16px_rgba(212,175,55,0.1)] transition-colors"
          />
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-200/30" />
        </div>
      </div>

      {/* ALT BÖLGE: Lejant ve Kontroller */}
      <div className="p-4 flex justify-between items-end pointer-events-none">
        {/* Lejant (Sol Alt) */}
        <div className="flex flex-col gap-2 pointer-events-auto select-none">
          <div className="flex items-center gap-2 font-serif text-[0.45rem] tracking-[0.15em] text-gray-200/30 uppercase">
            <div className="w-2 h-2 rounded-full bg-[#6699ee]" /> Karakter
          </div>
          <div className="flex items-center gap-2 font-serif text-[0.45rem] tracking-[0.15em] text-gray-200/30 uppercase">
            <div className="w-2 h-2 rounded-full bg-[#44bbaa]" /> Mekan
          </div>
          <div className="flex items-center gap-2 font-serif text-[0.45rem] tracking-[0.15em] text-gray-200/30 uppercase">
            <div className="w-2 h-2 rounded-full bg-[#dd9988]" /> Olay
          </div>
          <div className="flex items-center gap-2 font-serif text-[0.45rem] tracking-[0.15em] text-gray-200/30 uppercase mt-1">
            <div className="w-6 h-[1.5px] bg-[#4db89c]" /> Dostluk
          </div>
          <div className="flex items-center gap-2 font-serif text-[0.45rem] tracking-[0.15em] text-gray-200/30 uppercase">
            <div className="w-6 h-[1.5px] bg-[#e85050]" /> Düşmanlık
          </div>
          <div className="flex items-center gap-2 font-serif text-[0.45rem] tracking-[0.15em] text-gray-200/30 uppercase">
            <div className="w-6 h-[1.5px] bg-[#8888bb]" /> Nötr
          </div>
        </div>

        {/* Kamera Kontrolleri (Sağ Alt) */}
        <div className="flex flex-col gap-1 pointer-events-auto">
          <button 
            onClick={onZoomIn}
            className="w-8 h-8 bg-[#0e0e0f]/85 border border-white/5 text-gray-200/40 hover:text-[#E8D48B] hover:border-mythos-accent/40 flex items-center justify-center transition-all drop-shadow-sm hover:drop-shadow-[0_0_10px_rgba(212,175,55,0.12)] cursor-pointer"
          >
            <ZoomIn size={14} />
          </button>
          <button 
            onClick={onZoomOut}
            className="w-8 h-8 bg-[#0e0e0f]/85 border border-white/5 text-gray-200/40 hover:text-[#E8D48B] hover:border-mythos-accent/40 flex items-center justify-center transition-all drop-shadow-sm hover:drop-shadow-[0_0_10px_rgba(212,175,55,0.12)] cursor-pointer"
          >
            <ZoomOut size={14} />
          </button>
          <button 
            onClick={onResetZoom}
            className="w-8 h-8 bg-[#0e0e0f]/85 border border-white/5 text-gray-200/40 hover:text-[#E8D48B] hover:border-mythos-accent/40 flex items-center justify-center transition-all drop-shadow-sm hover:drop-shadow-[0_0_10px_rgba(212,175,55,0.12)] cursor-pointer"
          >
            <Maximize size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
