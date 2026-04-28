import { useUniverseStore } from '@/store/useUniverseStore';
import type { EntityFilterType } from '@/store/useUniverseStore';
import { useLocation } from 'react-router-dom';
import { LayoutGrid, List, Search } from 'lucide-react';

const FILTER_OPTIONS: { value: EntityFilterType; label: string }[] = [
  { value: 'all',       label: 'Tümü' },
  { value: 'character', label: 'Karakter' },
  { value: 'place',     label: 'Mekan' },
  { value: 'event',     label: 'Olay' },
];

// Entity sayfalarında filtre pill'lerini göster
const ENTITY_ROUTES = ['/dashboard', '/dashboard/characters', '/dashboard/places', '/dashboard/events'];

export function Topbar() {
  const { 
    getEntitiesForCurrentUniverse, 
    getConnectionsForCurrentUniverse, 
    activeFilter, 
    setActiveFilter,
    universes,
    currentUniverseId,
    clearCurrentUniverse
  } = useUniverseStore();

  const currentUniverse = universes.find(u => u.id === currentUniverseId);
  const entities = getEntitiesForCurrentUniverse();
  const connections = getConnectionsForCurrentUniverse();
  const location = useLocation();

  const showFilters = ENTITY_ROUTES.includes(location.pathname);

  // Route bazlı başlık ve alt başlık belirleme
  const getPageInfo = () => {
    switch (location.pathname) {
      case '/dashboard':
        return { title: 'Kozmos Haritası', subtitle: 'Antigravity İlişki Ağı' };
      case '/dashboard/characters':
        return { title: 'Karakterler', subtitle: 'Tüm evren figürleri' };
      case '/dashboard/places':
        return { title: 'Mekanlar', subtitle: 'Harita üzerindeki yerleşimler' };
      case '/dashboard/events':
        return { title: 'Olaylar', subtitle: 'Tarihin dönüm noktaları' };
      case '/dashboard/mythology':
        return { title: 'Panteon & Mitoloji', subtitle: 'Tanrılar, yaratılış ve efsaneler' };
      case '/dashboard/timeline':
        return { title: 'Zaman Çizelgesi', subtitle: 'Çağlar ve dönüm noktaları' };
      case '/dashboard/maps':
        return { title: 'Dünya Haritası', subtitle: 'Orta Dünya — Üçüncü Çağ' };
      case '/dashboard/languages':
        return { title: 'Diller & Alfabeler', subtitle: 'Konuşulan diller ve yazılar' };
      case '/dashboard/settings':
        return { title: 'Ayarlar', subtitle: 'Hesap ve sistem yapılandırması' };
      default:
        return { title: 'MYTHOS', subtitle: 'Evren Paneli' };
    }
  };

  const info = getPageInfo();

  // Ctrl+K trigger — CommandPalette kendi listener'ını kullanıyor
  const triggerSearch = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
  };

  // Şimdilik view mode (3D vs Table) mock
  const viewMode: string = 'cosmos';

  return (
    <div className="h-14 flex items-center shrink-0 px-4 border-b border-glass-border bg-[#0a0a0b]/85 gap-3">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <div className="font-serif text-[0.7rem] tracking-[0.2em] text-[#E8D48B] uppercase drop-shadow-[0_0_16px_rgba(212,175,55,0.3)]">
            {info.title}
          </div>
          {currentUniverse && (
            <span className="text-[0.5rem] px-2 py-0.5 bg-mythos-accent/10 border border-mythos-accent/20 text-mythos-accent rounded-sm uppercase tracking-widest font-serif">
              {currentUniverse.name}
            </span>
          )}
        </div>
        <div className="font-serif text-[0.8rem] text-gray-200/30 italic">
          {info.subtitle}
        </div>
      </div>

      {/* Filter Pills */}
      {showFilters && (
        <div className="flex items-center gap-1.5 ml-6">
          {FILTER_OPTIONS.map((opt) => {
            const isActive = activeFilter === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setActiveFilter(opt.value)}
                className={[
                  'px-3 py-1 text-[0.55rem] tracking-[0.15em] uppercase rounded-full border transition-all duration-200 font-sans cursor-pointer',
                  isActive
                    ? 'bg-mythos-accent/10 text-[#E8D48B] border-mythos-accent/30 shadow-[0_0_10px_rgba(212,175,55,0.15)]'
                    : 'bg-transparent text-gray-200/35 border-white/5 hover:bg-white/5 hover:text-gray-200/60',
                ].join(' ')}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex-1" />

      {/* Search Trigger → CommandPalette */}
      <button
        onClick={triggerSearch}
        className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-md border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer group"
      >
        <Search size={13} className="text-gray-200/30 group-hover:text-mythos-accent/60 transition-colors" />
        <span className="text-[0.6rem] text-gray-200/25 tracking-wider font-sans group-hover:text-gray-200/40 transition-colors">
          Ara...
        </span>
        <kbd className="px-1.5 py-0.5 text-[0.5rem] bg-white/5 border border-white/8 rounded text-gray-200/25 font-sans ml-3">
          ⌘K
        </kbd>
      </button>

      {/* Clear Universe Button */}
      <button
        onClick={clearCurrentUniverse}
        title="Mevcut Evreni Sıfırla"
        className="px-3 py-1.5 rounded-md border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400/50 hover:text-red-400 transition-all cursor-pointer font-serif text-[0.55rem] uppercase tracking-wider"
      >
        Evreni Sıfırla
      </button>

      {/* Stats Counter A */}
      <div className="flex flex-col items-end px-4 border-l border-glass-border">
        <div className="font-serif text-[0.8rem] text-[#E8D48B] drop-shadow-[0_0_12px_rgba(212,175,55,0.4)]">
          {entities.length}
        </div>
        <div className="font-serif text-[0.42rem] tracking-[0.2em] text-gray-200/30 uppercase">
          Düğüm
        </div>
      </div>

      {/* Stats Counter B */}
      <div className="flex flex-col items-end px-4 border-l border-glass-border">
        <div className="font-serif text-[0.8rem] text-[#E8D48B] drop-shadow-[0_0_12px_rgba(212,175,55,0.4)]">
          {connections.length}
        </div>
        <div className="font-serif text-[0.42rem] tracking-[0.2em] text-gray-200/30 uppercase">
          Bağlantı
        </div>
      </div>

      {/* View Toggle (Only on Cosmos) */}
      {location.pathname === '/dashboard' && (
        <div className="flex items-center border border-white/5 rounded-sm overflow-hidden ml-2">
          <button 
            className={[
              'px-3.5 py-1.5 font-serif text-[0.5rem] tracking-[0.15em] transition-all uppercase flex items-center gap-1.5 border-none bg-transparent cursor-pointer',
              viewMode === 'cosmos' ? 'bg-mythos-accent/10 text-[#E8D48B] drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]' : 'text-gray-200/30 hover:bg-white/5 hover:text-gray-200/60'
            ].join(' ')}
          >
            <LayoutGrid size={12} /> Kozmos
          </button>
          <button 
            className={[
              'px-3.5 py-1.5 font-serif text-[0.5rem] tracking-[0.15em] transition-all uppercase flex items-center gap-1.5 border-none bg-transparent cursor-pointer',
              viewMode === 'table' ? 'bg-mythos-accent/10 text-[#E8D48B] drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]' : 'text-gray-200/30 hover:bg-white/5 hover:text-gray-200/60'
            ].join(' ')}
          >
            <List size={12} /> Liste
          </button>
        </div>
      )}
    </div>
  );
}
