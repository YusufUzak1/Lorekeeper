import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useUniverseStore } from '@/store/useUniverseStore';
import { LoreNoteModal } from './LoreNoteModal';
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
  Sparkles,
  ArrowLeft,
  StickyNote
} from 'lucide-react';

export function Sidebar() {
  const { 
    getEntitiesForCurrentUniverse, 
    getMythsForCurrentUniverse,
    getTimelineForCurrentUniverse,
    getRegionsForCurrentUniverse,
    getLanguagesForCurrentUniverse
  } = useUniverseStore();

  const entities = getEntitiesForCurrentUniverse();
  const myths = getMythsForCurrentUniverse();
  const timeline = getTimelineForCurrentUniverse();
  const regions = getRegionsForCurrentUniverse();
  const languages = getLanguagesForCurrentUniverse();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const navigate = useNavigate();
  
  const charCount = entities.filter(e => e.type === 'character').length;
  const placeCount = entities.filter(e => e.type === 'place').length;
  const eventCount = entities.filter(e => e.type === 'event').length;

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
      { id: 'cosmos', label: 'Kozmos', count: entities.length, icon: <Network size={15} />, path: '/dashboard' },
      { id: 'chars', label: 'Karakterler', count: charCount, icon: <Users size={15} />, path: '/dashboard/characters' },
      { id: 'places', label: 'Mekanlar', count: placeCount, icon: <MapPin size={15} />, path: '/dashboard/places' },
      { id: 'events', label: 'Olaylar', count: eventCount, icon: <Swords size={15} />, path: '/dashboard/events' },
    ]},
    { section: 'Dünya', items: [
      { id: 'myth', label: 'Mitoloji', count: myths.length, icon: <ScrollText size={15} />, path: '/dashboard/mythology' },
      { id: 'timeline', label: 'Zaman Çizelgesi', count: timeline.length, icon: <Clock size={15} />, path: '/dashboard/timeline' },
      { id: 'map', label: 'Haritalar', count: regions.length, icon: <MapIcon size={15} />, path: '/dashboard/maps' },
      { id: 'lang', label: 'Diller & Alfabeler', count: languages.length, icon: <Languages size={15} />, path: '/dashboard/languages' },
      { id: 'notes', label: 'Notlar', icon: <StickyNote size={15} />, path: '/dashboard/notes' },
    ]},
  ];

  const systemItems: NavItem[] = [
    { id: 'settings', label: 'Ayarlar', icon: <Settings size={14} />, path: '/dashboard/settings' },
    { id: 'logout', label: 'Çıkış', icon: <LogOut size={14} />, path: '/dashboard/logout' },
  ];

  return (
    <aside
      className={`
        flex-shrink-0 flex flex-col relative z-50
        bg-[#09090A] border-r border-white/[0.05]
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-[68px]' : 'w-60'}
      `}
    >
      {/* Subtle right-edge shimmer */}
      <div className="absolute top-0 -right-px bottom-0 w-px bg-gradient-to-b from-transparent via-[#E8D48B]/10 to-transparent pointer-events-none" />

      {/* ── Collapse Toggle ── */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? "Genişlet" : "Daralt"}
        className="
          absolute top-1/2 -right-3 -translate-y-1/2
          w-6 h-12 flex items-center justify-center
          bg-[#0F0F10] border border-white/[0.07] rounded-r-md
          text-[#E8D48B]/40 hover:text-[#E8D48B]
          transition-all duration-300 z-50
          hover:shadow-[0_0_12px_rgba(232,212,139,0.1)]
        "
      >
        <ChevronRight
          size={13}
          className={`transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`}
        />
      </button>

      {/* ── Wordmark ── */}
      <div
        className={`
          flex-shrink-0 flex flex-col items-center justify-center
          border-b border-white/[0.05]
          ${isCollapsed ? 'py-5' : 'py-5 gap-0.5'}
        `}
      >
        {isCollapsed ? (
          <span className="font-serif text-lg tracking-widest text-[#E8D48B]/80">M</span>
        ) : (
          <>
            <span className="font-serif text-[0.9rem] tracking-[0.4em] text-[#E8D48B]/90 drop-shadow-[0_0_18px_rgba(232,212,139,0.35)]">
              MYTHOS
            </span>
            <span className="font-serif text-[0.38rem] tracking-[0.45em] text-[#E8D48B]/25 uppercase">
              Antigravity Platform
            </span>
          </>
        )}
      </div>

      {/* ── Navigation ── */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-3 custom-scrollbar">
        {navItems.map((group, gIdx) => (
          <div key={group.section} className={gIdx > 0 ? 'mt-1' : ''}>

            {/* Section label */}
            {!isCollapsed ? (
              <div className="px-5 pt-3 pb-1.5 font-serif text-[0.38rem] tracking-[0.4em] text-white/20 uppercase select-none">
                {group.section}
              </div>
            ) : (
              <div className="flex justify-center py-3">
                <div className="w-5 h-px bg-white/[0.06]" />
              </div>
            )}

            {/* Items */}
            <div className="flex flex-col gap-px px-2">
              {group.items.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  end={item.path === '/dashboard'}
                  title={isCollapsed ? item.label : undefined}
                  className={({ isActive }) => `
                    group/item relative flex items-center rounded-md
                    font-serif text-[0.58rem] tracking-[0.12em] uppercase
                    transition-all duration-200 cursor-pointer select-none
                    ${isCollapsed ? 'justify-center py-2.5 px-0' : 'gap-3 px-3 py-2'}
                    ${isActive
                      ? 'bg-[#E8D48B]/[0.07] text-[#E8D48B]'
                      : 'text-white/30 hover:text-white/70 hover:bg-white/[0.03]'
                    }
                  `}
                >
                  {({ isActive }) => (
                    <>
                      {/* Active pill indicator */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-[55%] rounded-r-full bg-gradient-to-b from-[#E8D48B]/40 via-[#E8D48B] to-[#E8D48B]/40 shadow-[0_0_8px_rgba(232,212,139,0.5)]" />
                      )}

                      {/* Icon */}
                      <span className={`w-[18px] flex justify-center flex-shrink-0 transition-colors duration-200 ${isActive ? 'text-[#E8D48B]' : 'text-white/25 group-hover/item:text-white/50'}`}>
                        {item.icon}
                      </span>

                      {/* Label */}
                      {!isCollapsed && (
                        <span className="flex-1 whitespace-nowrap">{item.label}</span>
                      )}

                      {/* Count badge */}
                      {!isCollapsed && item.count !== undefined && (
                        <span className={`
                          text-[0.42rem] px-1.5 py-px rounded tracking-wider tabular-nums
                          transition-colors duration-200
                          ${item.count > 0
                            ? 'text-[#E8D48B]/50 border border-[#E8D48B]/15 bg-[#E8D48B]/[0.04]'
                            : 'text-white/15 border border-white/[0.06]'
                          }
                        `}>
                          {item.count}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {/* Divider between groups */}
            {gIdx < navItems.length - 1 && !isCollapsed && (
              <div className="mx-5 mt-3 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
            )}
          </div>
        ))}
      </div>

      {/* ── AI Note Button ── */}
      <div className={`flex-shrink-0 border-t border-white/[0.05] ${isCollapsed ? 'p-2' : 'px-3 py-2.5'}`}>
        <button
          onClick={() => setShowAIModal(true)}
          title="AI Lore Notu — Serbest metin yazın, AI analiz etsin"
          className={`
            w-full flex items-center gap-2.5 rounded-lg
            border border-[#E8D48B]/15 bg-[#E8D48B]/[0.04]
            hover:bg-[#E8D48B]/[0.09] hover:border-[#E8D48B]/25
            transition-all duration-300 cursor-pointer group/ai
            ${isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2'}
          `}
        >
          <div className="w-[18px] h-[18px] rounded flex items-center justify-center flex-shrink-0 bg-[#E8D48B]/[0.08] border border-[#E8D48B]/15 group-hover/ai:bg-[#E8D48B]/[0.16] transition-colors">
            <Sparkles size={10} className="text-[#E8D48B]/60 group-hover/ai:text-[#E8D48B]/90 transition-colors" />
          </div>
          {!isCollapsed && (
            <>
              <span className="font-serif text-[0.52rem] tracking-[0.18em] uppercase text-[#E8D48B]/50 group-hover/ai:text-[#E8D48B]/80 transition-colors">
                AI Not
              </span>
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#E8D48B]/25 animate-pulse" />
            </>
          )}
        </button>
      </div>

      {/* ── Bottom: Hub + System + User ── */}
      <div className="flex-shrink-0 border-t border-white/[0.05]">

        {/* Back to Hub */}
        <button
          onClick={() => navigate('/hub')}
          title="Evren Seçimine Dön"
          className={`
            w-full flex items-center gap-2 bg-transparent border-none border-b border-white/[0.04]
            font-serif text-[0.47rem] tracking-[0.15em] uppercase
            text-white/20 hover:text-[#E8D48B]/60
            transition-all duration-200 cursor-pointer
            ${isCollapsed ? 'justify-center py-2.5' : 'px-5 py-2'}
          `}
        >
          <ArrowLeft size={11} className="flex-shrink-0 opacity-70" />
          {!isCollapsed && <span>Evren Seçimi</span>}
        </button>

        {/* System items */}
        <div className={`flex ${isCollapsed ? 'flex-col items-center gap-0.5 py-1.5' : 'items-center gap-1 px-3 py-1.5'}`}>
          {systemItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              title={item.label}
              className={({ isActive }) => `
                flex items-center gap-1.5 py-1 rounded font-serif text-[0.47rem] tracking-[0.12em] uppercase
                transition-all duration-200
                ${isCollapsed ? 'px-2' : 'px-2'}
                ${isActive ? 'text-[#E8D48B]/80' : 'text-white/20 hover:text-white/50'}
              `}
            >
              <span className="flex items-center">{item.icon}</span>
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </div>

        {/* User card */}
        <div className={`pt-1 pb-2 border-t border-white/[0.04] ${isCollapsed ? 'flex justify-center' : 'px-4'}`}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'}`}>
            <div className="
              w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center
              font-serif text-[0.48rem] text-[#E8D48B]/70
              bg-gradient-to-br from-[#E8D48B]/15 to-black/60
              border border-[#E8D48B]/20
              shadow-[0_0_8px_rgba(232,212,139,0.08)]
              hover:bg-[#E8D48B]/20 transition-colors cursor-pointer
            ">
              M
            </div>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="font-serif text-[0.45rem] tracking-[0.1em] text-white/40 truncate">Mythos Yazarı</span>
                <span className="font-serif text-[0.35rem] tracking-[0.1em] text-white/18 truncate">Evren Mimarı</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Note Modal */}
      <LoreNoteModal isOpen={showAIModal} onClose={() => setShowAIModal(false)} />
    </aside>
  );
}
