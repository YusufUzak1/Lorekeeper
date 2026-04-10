import { useState } from 'react';
import { NavLink } from 'react-router-dom';
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
  ChevronRight
} from 'lucide-react';

export function Sidebar() {
  const { entities } = useUniverseStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
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
      { id: 'cosmos', label: 'Kozmos', count: entities.length, icon: <Network size={15} className="opacity-70" />, path: '/dashboard' },
      { id: 'chars', label: 'Karakterler', count: charCount, icon: <Users size={15} className="opacity-70" />, path: '/dashboard/characters' },
      { id: 'places', label: 'Mekanlar', count: placeCount, icon: <MapPin size={15} className="opacity-70" />, path: '/dashboard/places' },
      { id: 'events', label: 'Olaylar', count: eventCount, icon: <Swords size={15} className="opacity-70" />, path: '/dashboard/events' },
    ]},
    { section: 'Dünya', items: [
      { id: 'myth', label: 'Mitoloji', icon: <ScrollText size={15} className="opacity-70" />, path: '/dashboard/mythology' },
      { id: 'timeline', label: 'Zaman Çizelgesi', icon: <Clock size={15} className="opacity-70" />, path: '/dashboard/timeline' },
      { id: 'map', label: 'Haritalar', icon: <MapIcon size={15} className="opacity-70" />, path: '/dashboard/maps' },
      { id: 'lang', label: 'Diller & Alfabeler', icon: <Languages size={15} className="opacity-70" />, path: '/dashboard/languages' },
    ]},
  ];

  // System items rendered separately at the bottom
  const systemItems: NavItem[] = [
    { id: 'settings', label: 'Ayarlar', icon: <Settings size={14} className="opacity-70" />, path: '/dashboard/settings' },
    { id: 'logout', label: 'Çıkış', icon: <LogOut size={14} className="opacity-70" />, path: '/dashboard/logout' },
  ];

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
                        <span className="ml-auto text-[0.45rem] px-1.5 py-0.5 border border-white/5 rounded-sm text-[#c8d2f0]/30 tracking-wider">
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

      {/* Bottom Section: System Links + User Card */}
      <div className="flex-shrink-0 border-t border-glass-border">
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
