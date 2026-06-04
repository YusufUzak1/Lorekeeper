/* ─────────────────────────────────────────────
 * CommandPalette — Global Fuzzy Search Modal
 * Ctrl+K / Cmd+K ile açılır.
 * Fuse.js ile Entity, MythCard, TimelineEvent,
 * MapRegion üzerinde arama yapar.
 * ───────────────────────────────────────────── */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, User, MapPin, Zap, Sparkles, Clock, Map, X } from 'lucide-react';
import Fuse from 'fuse.js';

import { useUniverseStore } from '@/store/useUniverseStore';

// ── Arama sonucu birleşik tipi ──
interface SearchItem {
  id: string;
  name: string;
  description: string;
  category: 'character' | 'place' | 'event' | 'myth' | 'timeline' | 'region';
  categoryLabel: string;
  route: string;
  domains?: string[];
  epithet?: string; // MythCard için
  extra?: string; // era, tier, year gibi ek bilgi
}

const CATEGORY_CONFIG: Record<SearchItem['category'], { icon: typeof User; color: string; label: string }> = {
  character: { icon: User,     color: '#7ecfff', label: 'Karakter' },
  place:     { icon: MapPin,   color: '#4db89c', label: 'Mekan' },
  event:     { icon: Zap,      color: '#ff6b35', label: 'Olay' },
  myth:      { icon: Sparkles, color: '#e8a0d0', label: 'Mitoloji' },
  timeline:  { icon: Clock,    color: '#B8962E', label: 'Zaman Çizelgesi' },
  region:    { icon: Map,      color: '#8888bb', label: 'Harita Bölgesi' },
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { 
    getEntitiesForCurrentUniverse, 
    getMythsForCurrentUniverse, 
    getTimelineForCurrentUniverse, 
    getRegionsForCurrentUniverse,
    currentUniverseId 
  } = useUniverseStore();

  const entities = getEntitiesForCurrentUniverse();
  const myths = getMythsForCurrentUniverse();
  const timeline = getTimelineForCurrentUniverse();
  const regions = getRegionsForCurrentUniverse();

  // ── Tüm veriyi tek listeye dönüştür ──
  const allItems = useMemo<SearchItem[]>(() => {
    const items: SearchItem[] = [];

    entities.forEach((e) => {
      const routeMap = { character: '/dashboard/characters', place: '/dashboard/places', event: '/dashboard/events' };
      items.push({
        id: e.id,
        name: e.name,
        description: e.description,
        category: e.type,
        categoryLabel: CATEGORY_CONFIG[e.type].label,
        route: routeMap[e.type],
        domains: e.domains,
        extra: e.era,
      });
    });

    myths.forEach((m) => {
      items.push({
        id: m.id,
        name: m.name,
        description: m.description,
        category: 'myth',
        categoryLabel: 'Mitoloji',
        route: '/dashboard/mythology',
        domains: m.domains,
        epithet: m.epithet,
        extra: m.tier,
      });
    });

    timeline.forEach((t) => {
      items.push({
        id: t.id,
        name: t.name,
        // Arama kapsamına dönemin/year bilgisini de description içine katıyoruz.
        description: `${t.description} ${t.era} ${t.year}`,
        category: 'timeline',
        categoryLabel: 'Zaman Çizelgesi',
        route: '/dashboard/timeline',
        domains: [],
        extra: `${t.era} — ${t.year}`,
      });
    });

    regions.forEach((r) => {
      items.push({
        id: r.id,
        name: r.name,
        description: `${r.description} ${r.type}`,
        category: 'region',
        categoryLabel: 'Harita Bölgesi',
        route: '/dashboard/maps',
        domains: [],
        extra: r.type,
      });
    });

    return items;
  }, [entities, myths, timeline, regions, currentUniverseId]);

  // ── Fuse.js index ──
  const fuse = useMemo(
    () =>
      new Fuse(allItems, {
        keys: [
          { name: 'name', weight: 0.4 },
          { name: 'description', weight: 0.25 },
          { name: 'domains', weight: 0.2 },
          { name: 'epithet', weight: 0.15 },
        ],
        threshold: 0.4,
        includeScore: true,
        minMatchCharLength: 1,
      }),
    [allItems]
  );

  // ── Arama sonuçları ──
  const results = useMemo(() => {
    if (!query.trim()) return allItems.slice(0, 12); // boşken son 12 öğe
    return fuse.search(query).slice(0, 15).map((r) => r.item);
  }, [query, fuse, allItems]);

  // ── Ctrl+K / Cmd+K kısayolu ──
  useEffect(() => {
    function handleGlobalKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  // ── Açılınca input'a focus ──
  useEffect(() => {
    if (!open) return;
    // Lint: effect içinde setState yapmak kaskad render tetikleyebilir.
    // Bu güncellemeleri bir tick erteleyerek daha stabil hale getiriyoruz.
    setTimeout(() => {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }, 0);
  }, [open]);

  // ── Seçili öğeyi görünür tut ──
  useEffect(() => {
    const el = listRef.current?.children[selectedIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  // ── Sonuca git ──
  const goToResult = useCallback(
    (item: SearchItem) => {
      navigate(item.route);
      setOpen(false);
    },
    [navigate]
  );

  // ── Keyboard navigasyonu ──
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      e.stopPropagation();
      setOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      e.stopPropagation();
      if (!results.length) return;
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      e.stopPropagation();
      if (!results.length) return;
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.stopPropagation();
      goToResult(results[selectedIndex]);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[999] flex items-start justify-center pt-[15vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <motion.div
            className="relative w-full max-w-xl mx-4 glass-panel rounded-lg border border-mythos-accent/20 shadow-[0_0_60px_rgba(212,175,55,0.08)] overflow-hidden"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-glass-border">
              <Search size={18} className="text-mythos-accent/60 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Evrenin derinliklerinde ara..."
                className="flex-1 bg-transparent border-none outline-none font-serif text-sm text-gray-200/90 placeholder:text-gray-200/25 tracking-wide"
              />
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded hover:bg-white/5 transition-colors border-none bg-transparent cursor-pointer"
              >
                <X size={16} className="text-gray-200/40" />
              </button>
            </div>

            {/* Shortcut hint */}
            <div className="flex items-center justify-between px-5 py-2 border-b border-glass-border/50 bg-black/20">
              <span className="text-[0.6rem] text-gray-200/30 tracking-wider font-sans">
                {query ? `${results.length} sonuç bulundu` : 'Hızlı erişim'}
              </span>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 text-[0.55rem] bg-white/5 border border-white/10 rounded text-gray-200/40 font-sans">
                  ⌘K
                </kbd>
                <span className="text-[0.5rem] text-gray-200/25">aç/kapat</span>
                <kbd className="px-1.5 py-0.5 text-[0.55rem] bg-white/5 border border-white/10 rounded text-gray-200/40 font-sans">↑↓</kbd>
                <span className="text-[0.5rem] text-gray-200/25">gezin</span>
                <kbd className="px-1.5 py-0.5 text-[0.55rem] bg-white/5 border border-white/10 rounded text-gray-200/40 font-sans">↵</kbd>
                <span className="text-[0.5rem] text-gray-200/25">seç</span>
                <kbd className="px-1.5 py-0.5 text-[0.55rem] bg-white/5 border border-white/10 rounded text-gray-200/40 font-sans">esc</kbd>
                <span className="text-[0.5rem] text-gray-200/25">kapat</span>
              </div>
            </div>

            {/* Results */}
            <div
              ref={listRef}
              className="max-h-[50vh] overflow-y-auto min-h-0 custom-scrollbar overscroll-contain"
              onWheel={(e) => {
                const el = e.currentTarget;
                if (Math.abs(e.deltaY) < 0.5) return;
                if (el.scrollHeight <= el.clientHeight) return;
                // Sayfa yerine sadece sonuç listesinin kaymasını istiyoruz.
                e.stopPropagation();
                el.scrollTop += e.deltaY;
              }}
            >
              {results.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Search size={32} className="text-gray-200/10 mb-3" />
                  <div className="font-serif text-sm text-gray-200/30">Sonuç bulunamadı</div>
                  <div className="text-[0.65rem] text-gray-200/20 mt-1">Farklı bir arama terimi deneyin</div>
                </div>
              )}

              {results.map((item, index) => {
                const cfg = CATEGORY_CONFIG[item.category];
                const Icon = cfg.icon;
                const isSelected = index === selectedIndex;

                return (
                  <button
                    key={item.id}
                    onClick={() => goToResult(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={[
                      'w-full flex items-center gap-3 px-5 py-3 text-left transition-all duration-150 border-none cursor-pointer',
                      isSelected
                        ? 'bg-mythos-accent/[0.07] border-l-2 border-l-mythos-accent'
                        : 'bg-transparent border-l-2 border-l-transparent hover:bg-white/[0.03]',
                    ].join(' ')}
                  >
                    {/* Category Icon */}
                    <div
                      className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${cfg.color}15`, border: `1px solid ${cfg.color}25` }}
                    >
                      <Icon size={14} style={{ color: cfg.color }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={[
                          'font-serif text-[0.75rem] tracking-wide truncate transition-colors',
                          isSelected ? 'text-mythos-accent' : 'text-gray-200/80',
                        ].join(' ')}>
                          {item.name}
                        </span>
                        {item.extra && (
                          <span className="text-[0.55rem] text-gray-200/25 tracking-wider truncate font-sans">
                            {item.extra}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <div className="text-[0.6rem] text-gray-200/30 truncate mt-0.5 font-sans">
                          {item.description.slice(0, 80)}{item.description.length > 80 ? '…' : ''}
                        </div>
                      )}
                    </div>

                    {/* Category Badge */}
                    <span
                      className="text-[0.5rem] tracking-[0.15em] uppercase px-2 py-0.5 rounded-full border shrink-0 font-sans"
                      style={{
                        color: cfg.color,
                        backgroundColor: `${cfg.color}10`,
                        borderColor: `${cfg.color}25`,
                      }}
                    >
                      {cfg.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
