import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useUniverseStore } from '@/store/useUniverseStore';
import { 
  Network, 
  Users, 
  MapPin, 
  Swords, 
  ScrollText, 
  Clock, 
  Map as MapIcon, 
  Languages, 
  Settings, 
  LogOut,
  ChevronRight,
  Globe,
  Sparkles,
  ArrowLeft,
  StickyNote
} from 'lucide-react';

export function Sidebar() {
  const { 
    getEntitiesForCurrentUniverse, 
    getConnectionsForCurrentUniverse,
    getMythsForCurrentUniverse,
    getTimelineForCurrentUniverse,
    getRegionsForCurrentUniverse,
    getLanguagesForCurrentUniverse,
    universes, 
    currentUniverseId 
  } = useUniverseStore();

  const entities = getEntitiesForCurrentUniverse();
  const connections = getConnectionsForCurrentUniverse();
  const myths = getMythsForCurrentUniverse();
  const timeline = getTimelineForCurrentUniverse();
  const regions = getRegionsForCurrentUniverse();
  const languages = getLanguagesForCurrentUniverse();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  
  const charCount = entities.filter(e => e.type === 'character').length;
  const placeCount = entities.filter(e => e.type === 'place').length;
  const eventCount = entities.filter(e => e.type === 'event').length;
  
  const currentUniverse = universes.find(u => u.id === currentUniverseId);

  // Lore completeness — how "filled" the universe is across all categories
  const loreCategories = [
    { name: 'Karakterler', count: charCount, color: '#7ecfff' },
    { name: 'Mekanlar', count: placeCount, color: '#4db89c' },
    { name: 'Olaylar', count: eventCount, color: '#e85050' },
    { name: 'Mitoloji', count: myths.length, color: '#e8a0d0' },
    { name: 'Zaman Çizelgesi', count: timeline.length, color: '#B8962E' },
    { name: 'Haritalar', count: regions.length, color: '#8888bb' },
    { name: 'Diller', count: languages.length, color: '#ff6b35' },
  ];
  const filledCategories = loreCategories.filter(c => c.count > 0).length;
  const completenessPercent = Math.round((filledCategories / loreCategories.length) * 100);
  const totalItems = entities.length + connections.length + myths.length + timeline.length + regions.length + languages.length;

  type NavItem = {
    id: string;
    label: string;
    icon: JSX.Element;
    path: string;
    count?: number;
  };

  type NavGroup = {
    section: string;
    items: NavItem[];
  };

  const navItems: NavGroup[] = [
    { section: 'Evren', items: [
      { id: 'cosmos', label: 'Kozmos', count: entities.length, icon: <Network size={15} className="opacity-70" />, path: '/dashboard' },
      { id: 'chars', label: 'Karakterler', count: charCount, icon: <Users size={15} className="opacity-70" />, path: '/dashboard/characters' },
      { id: 'places', label: 'Mekanlar', count: placeCount, icon: <MapPin size={15} className="opacity-70" />, path: '/dashboard/places' },
      { id: 'events', label: 'Olaylar', count: eventCount, icon: <Swords size={15} className="opacity-70" />, path: '/dashboard/events' },
    ]},
    { section: 'Dünya', items: [
      { id: 'myth', label: 'Mitoloji', count: myths.length, icon: <ScrollText size={15} className="opacity-70" />, path: '/dashboard/mythology' },
      { id: 'timeline', label: 'Zaman Çizelgesi', count: timeline.length, icon: <Clock size={15} className="opacity-70" />, path: '/dashboard/timeline' },
      { id: 'map', label: 'Haritalar', count: regions.length, icon: <MapIcon size={15} className="opacity-70" />, path: '/dashboard/maps' },
      { id: 'lang', label: 'Diller & Alfabeler', count: languages.length, icon: <Languages size={15} className="opacity-70" />, path: '/dashboard/languages' },
      { id: 'notes', label: 'Notlar', icon: <StickyNote size={15} className="opacity-70" />, path: '/dashboard/notes' },
    ]},
  ];

  // System items rendered separately at the bottom
  const systemItems: NavItem[] = [
    { id: 'settings', label: 'Ayarlar', icon: <Settings size={14} className="opacity-70" />, path: '/dashboard/settings' },
    { id: 'logout', label: 'Çıkış', icon: <LogOut size={14} className="opacity-70" />, path: '/dashboard/logout' },
  ];

  // SVG progress ring
  const ringSize = 36;
  const strokeWidth = 3;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completenessPercent / 100) * circumference;

  return (
    <aside className={`flex-shrink-0 bg-gradient-to-b from-[#0A0A0B]/95 to-[#0A0A0B] border-r border-glass-border flex flex-col pt-0 pb-2 relative z-50 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Golden glow separator */}
      <div className="absolute top-0 -right-[1px] bottom-0 w-[1px] bg-gradient-to-b from-transparent via-mythos-accent/20 to-transparent shadow-[0_0_8px_rgba(212,175,55,0.08)] pointer-events-none" />

      {/* Collapse Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? 'Sidebar\'ı Genişlet' : 'Sidebar\'ı Daralt'}
        className="absolute top-1/2 -right-3.5 transform -translate-y-1/2 w-7 h-14 bg-[#0A0A0B]/90 backdrop-blur-sm border border-glass-border border-l-0 rounded-r-lg flex items-center justify-center text-mythos-accent/60 hover:text-mythos-accent cursor-pointer z-50 transition-all duration-300 hover:bg-[#0A0A0B] hover:w-8 hover:shadow-[0_0_15px_rgba(212,175,55,0.15)] group/toggle"
      >
        <div className={`transition-transform duration-300 ${isCollapsed ? 'rotate-0' : 'rotate-180'}`}>
          <ChevronRight size={14} />
        </div>
        {/* Subtle glow effect on hover */}
        <div className="absolute inset-0 rounded-r-lg opacity-0 group-hover/toggle:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent to-mythos-accent/5 pointer-events-none" />
      </button>

      {/* Logo Area */}
      <div className={`pt-4 pb-3 px-6 border-b border-glass-border flex flex-col gap-0.5 transition-all overflow-hidden ${isCollapsed ? 'items-center px-0' : ''}`}>
        <div className="font-serif tracking-[0.3em] text-[#E8D48B] drop-shadow-[0_0_20px_rgba(212,175,55,0.5)] flex items-center justify-center">
          {isCollapsed ? <span className="text-xl">M</span> : <span className="text-[1rem]">MYTHOS</span>}
        </div>
        {!isCollapsed && (
          <div className="font-serif text-[0.45rem] tracking-[0.4em] text-mythos-accent/40 uppercase whitespace-nowrap">
            Antigravity Platform
          </div>
        )}
      </div>

      {/* ── Universe Info Card ── */}
      {currentUniverse && !isCollapsed && (
        <div className="mx-3 mt-3 mb-1 p-3 rounded-lg bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/[0.06] relative overflow-hidden group/ucard">
          {/* Ambient glow */}
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-mythos-accent/[0.06] rounded-full blur-[30px] group-hover/ucard:bg-mythos-accent/[0.1] transition-all duration-700" />
          
          <div className="relative z-10">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Globe size={10} className="text-mythos-accent/60 shrink-0" />
                  <span className="font-serif text-[0.55rem] tracking-[0.12em] text-mythos-accent/80 uppercase truncate">
                    Aktif Evren
                  </span>
                </div>
                <div className="font-serif text-[0.7rem] text-white/85 tracking-wide leading-tight truncate" title={currentUniverse.name}>
                  {currentUniverse.name}
                </div>
              </div>

              {/* Lore completeness ring */}
              <div className="relative shrink-0" title={`Lore Doluluk: %${completenessPercent}`}>
                <svg width={ringSize} height={ringSize} className="transform -rotate-90">
                  <circle cx={ringSize/2} cy={ringSize/2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
                  <circle cx={ringSize/2} cy={ringSize/2} r={radius} fill="none" stroke="url(#loreGrad)" strokeWidth={strokeWidth} strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="loreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#E8D48B" />
                      <stop offset="100%" stopColor="#B8962E" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[0.5rem] font-serif text-mythos-accent/70">{completenessPercent}%</span>
                </div>
              </div>
            </div>

            {/* Tone badge */}
            <div className="flex items-center gap-2">
              <span className="text-[0.42rem] uppercase tracking-[0.2em] text-mythos-accent/40 bg-mythos-accent/[0.06] px-1.5 py-0.5 rounded border border-mythos-accent/10 font-serif">
                {currentUniverse.tone}
              </span>
              <span className="text-[0.4rem] text-white/20 font-serif tracking-wider">
                {totalItems} kayıt
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed: Mini universe indicator */}
      {currentUniverse && isCollapsed && (
        <div className="flex flex-col items-center py-3 gap-1.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-mythos-accent/15 to-mythos-accent/5 border border-mythos-accent/20 flex items-center justify-center" title={currentUniverse.name}>
            <Globe size={14} className="text-mythos-accent/70" />
          </div>
          <div className="flex gap-0.5">
            {loreCategories.slice(0, 4).map((cat, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full transition-colors" 
                   style={{ backgroundColor: cat.count > 0 ? cat.color : 'rgba(255,255,255,0.08)' }}
                   title={`${cat.name}: ${cat.count}`} />
            ))}
          </div>
        </div>
      )}

      {/* ── Lore Category Bars (expanded only) ── */}
      {!isCollapsed && (
        <div className="mx-3 mt-2 mb-1 px-3 py-2.5 rounded-lg bg-white/[0.015] border border-white/[0.04]">
          <div className="flex items-center justify-between mb-2">
            <span className="font-serif text-[0.42rem] tracking-[0.25em] text-white/25 uppercase">Lore Dağılımı</span>
            <Sparkles size={9} className="text-mythos-accent/30" />
          </div>
          <div className="space-y-1.5">
            {loreCategories.map((cat) => {
              const maxCount = Math.max(...loreCategories.map(c => c.count), 1);
              const barWidth = Math.max((cat.count / maxCount) * 100, cat.count > 0 ? 8 : 0);
              return (
                <div key={cat.name} className="flex items-center gap-2">
                  <span className="text-[0.4rem] text-white/30 font-serif w-[52px] truncate tracking-wide">{cat.name}</span>
                  <div className="flex-1 h-[3px] bg-white/[0.04] rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{ 
                        width: `${barWidth}%`, 
                        backgroundColor: cat.color,
                        opacity: cat.count > 0 ? 0.6 : 0,
                        boxShadow: cat.count > 0 ? `0 0 6px ${cat.color}40` : 'none'
                      }} 
                    />
                  </div>
                  <span className="text-[0.4rem] text-white/20 font-serif w-3 text-right tabular-nums">{cat.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Ornamental Divider ── */}
      {!isCollapsed && (
        <div className="flex items-center gap-2 px-6 py-2">
          <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-mythos-accent/10" />
          <div className="w-1 h-1 rounded-full bg-mythos-accent/20" />
          <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-mythos-accent/10" />
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 min-h-0 overflow-y-auto py-1 custom-scrollbar overflow-x-hidden">
        {navItems.map((group, gIdx) => (
          <div key={group.section} className="mb-1">
            {!isCollapsed ? (
              <div className="font-serif text-[0.45rem] tracking-[0.35em] text-[#8c9bd2]/30 uppercase px-6 pt-2.5 pb-1 whitespace-nowrap transition-opacity duration-300">
                {group.section}
              </div>
            ) : (
              <div className="pt-3 pb-1 flex justify-center">
                <div className="w-8 h-[1px] bg-white/5" />
              </div>
            )}
            
            <div className="flex flex-col">
              {group.items.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  end={item.path === '/dashboard'}
                  title={isCollapsed ? item.label : undefined}
                  className={({ isActive }) => [
                    `group/sidebarItem relative flex items-center py-[0.4rem] font-serif text-[0.6rem] tracking-[0.15em] uppercase transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-6'}`,
                    isActive ? 'text-[#E8D48B]' : 'text-gray-200/40 hover:text-[#E8D48B]'
                  ].join(' ')}
                >
                  {({ isActive }) => (
                    <>
                      {/* Left glowing indicator line */}
                      <div className={[
                        'absolute left-0 top-1/2 -translate-y-1/2 w-[2px] bg-gradient-to-b from-mythos-accent/10 via-mythos-accent to-mythos-accent/10 transition-all duration-300 shadow-[0_0_10px_rgba(212,175,55,0.5)]',
                        isActive
                          ? 'h-[70%] opacity-100'
                          : 'h-0 opacity-0 group-hover/sidebarItem:h-[70%] group-hover/sidebarItem:opacity-100'
                      ].join(' ')} />
                      
                      <div className="w-5 flex justify-center items-center">{item.icon}</div>
                      
                      {!isCollapsed && <span>{item.label}</span>}
                      
                      {!isCollapsed && item.count !== undefined && (
                        <span className={`ml-auto text-[0.45rem] px-1.5 py-0.5 rounded-sm tracking-wider transition-colors ${
                          item.count > 0 
                            ? 'border border-mythos-accent/15 text-mythos-accent/50 bg-mythos-accent/[0.04]' 
                            : 'border border-white/5 text-[#c8d2f0]/20'
                        }`}>
                          {item.count}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {gIdx < navItems.length - 1 && !isCollapsed && (
              <div className="h-[1px] bg-gradient-to-r from-transparent via-glass-border to-transparent mx-6 mt-2" />
            )}
          </div>
        ))}
      </div>

      {/* Bottom Section: Hub Link + System Links + User Card */}
      <div className="flex-shrink-0 border-t border-glass-border">
        
        {/* Back to Universe Hub */}
        <button
          onClick={() => navigate('/hub')}
          title="Evren Seçimine Dön"
          className={`w-full flex items-center gap-2 font-serif text-[0.5rem] tracking-[0.12em] uppercase text-white/25 hover:text-mythos-accent/70 transition-all duration-300 cursor-pointer bg-transparent border-none border-b border-glass-border/50 ${isCollapsed ? 'justify-center py-2.5 px-0' : 'px-6 py-2'}`}
        >
          <ArrowLeft size={12} className="opacity-60" />
          {!isCollapsed && <span>Evren Seçimi</span>}
        </button>

        {/* System navigation items */}
        <div className={`flex ${isCollapsed ? 'flex-col items-center gap-1 py-2' : 'items-center gap-1 px-6 py-1.5'}`}>
          {systemItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              title={item.label}
              className={({ isActive }) => [
                `group/sysItem relative flex items-center gap-2 py-1 font-serif text-[0.5rem] tracking-[0.12em] uppercase transition-all duration-300 rounded-sm ${isCollapsed ? 'justify-center px-2' : 'px-2'}`,
                isActive ? 'text-[#E8D48B]' : 'text-gray-200/30 hover:text-[#E8D48B]/70'
              ].join(' ')}
            >
              <div className="w-4 flex justify-center items-center">{item.icon}</div>
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </div>

        {/* User Card */}
        <div className={`pt-1.5 pb-1 border-t border-glass-border/50 transition-all ${isCollapsed ? 'px-0 flex justify-center' : 'px-6'}`}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'}`}>
            <div className="w-6 h-6 flex-shrink-0 rounded-full bg-gradient-to-br from-mythos-accent/20 to-black/50 border border-mythos-accent/30 shadow-[0_0_10px_rgba(212,175,55,0.12)] flex items-center justify-center text-[0.5rem] text-mythos-accent font-serif cursor-pointer hover:bg-mythos-accent/30 transition-colors">
              M
            </div>
            {!isCollapsed && (
              <div className="flex flex-col whitespace-nowrap overflow-hidden">
                <div className="font-serif text-[0.48rem] text-[#c8d2f0]/60 tracking-[0.1em] truncate">Mythos Yazarı</div>
                <div className="font-serif text-[0.35rem] text-gray-200/30 tracking-[0.1em] truncate">Evren Mimarı</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
