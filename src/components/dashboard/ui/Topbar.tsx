import { useUniverseStore } from '@/store/useUniverseStore';
import { useLocation } from 'react-router-dom';
import { LayoutGrid, List } from 'lucide-react';

export function Topbar() {
  const { entities, connections } = useUniverseStore();
  const location = useLocation();

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

  // Şimdilik view mode (3D vs Table) mock, ileride context'e alınabilir
  const viewMode = 'cosmos'; 

  return (
    <div className="h-14 flex items-center shrink-0 px-4 border-b border-glass-border bg-[#0a0a0b]/85 gap-3">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col">
        <div className="font-serif text-[0.7rem] tracking-[0.2em] text-[#E8D48B] uppercase drop-shadow-[0_0_16px_rgba(212,175,55,0.3)]">
          {info.title}
        </div>
        <div className="font-serif text-[0.8rem] text-gray-200/30 italic">
          {info.subtitle}
        </div>
      </div>

      <div className="flex-1" />

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
