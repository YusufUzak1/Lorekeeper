/* ─────────────────────────────────────────────
 * EntityTable — Gelişmiş Arama, Filtreleme & Sıralama
 * Fuse.js ile inline arama, sıralanabilir sütunlar,
 * durum filtreleri ve store'dan gelen entity type filtresi.
 * ───────────────────────────────────────────── */

import { useState, useMemo, useRef } from 'react';
import { useUniverseStore } from '@/store/useUniverseStore';
import { useLocation } from 'react-router-dom';
import type { Entity, EntityType } from '@/types';
import { Network, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import Fuse from 'fuse.js';

// ── Sıralama Tipleri ──
type SortKey = 'name' | 'era' | 'status' | 'linkCount';
type SortDir = 'asc' | 'desc';

// ── Durum Filtre Tipleri ──
type StatusFilter = 'all' | 'active' | 'dead';

export function EntityTable() {
  const { getEntitiesByType, activeFilter } = useUniverseStore();
  const location = useLocation();

  const tableScrollRef = useRef<HTMLDivElement | null>(null);

  // ── Local state ──
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // ── Route'a göre hangi entity tipini göstereceğimiz ──
  const getTypeFromPath = (): EntityType => {
    if (location.pathname.includes('characters')) return 'character';
    if (location.pathname.includes('places')) return 'place';
    if (location.pathname.includes('events')) return 'event';
    return 'character';
  };

  const currentType = getTypeFromPath();

  // ── Veri: Store filtresi veya route filtresi ──
  const rawEntities = useMemo(() => {
    if (activeFilter !== 'all') {
      return getEntitiesByType(activeFilter);
    }
    return getEntitiesByType(currentType);
  }, [activeFilter, currentType, getEntitiesByType]);

  // ── Fuse.js index (inline arama) ──
  const fuse = useMemo(
    () =>
      new Fuse(rawEntities, {
        keys: ['name', 'era', 'status', 'description', 'domains'],
        threshold: 0.35,
        minMatchCharLength: 1,
      }),
    [rawEntities]
  );

  // ── Arama + Durum Filtresi + Sıralama pipeline ──
  const filteredEntities = useMemo(() => {
    // 1. Fuzzy search
    let result: Entity[];
    if (searchQuery.trim()) {
      result = fuse.search(searchQuery).map((r) => r.item);
    } else {
      result = [...rawEntities];
    }

    // 2. Status filter
    if (statusFilter === 'active') {
      result = result.filter((e) => e.status === 'Aktif');
    } else if (statusFilter === 'dead') {
      result = result.filter((e) => ['Ölü', 'Yıkık', 'Yok', 'Terk', 'Bitti'].includes(e.status));
    }

    // 3. Sort
    result.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'linkCount') {
        cmp = a.linkCount - b.linkCount;
      } else {
        cmp = (a[sortKey] ?? '').localeCompare(b[sortKey] ?? '', 'tr');
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [searchQuery, statusFilter, sortKey, sortDir, rawEntities, fuse]);

  // ── Sıralama toggle ──
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  // ── Sıralama ikon bileşeni ──
  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ArrowUpDown size={10} className="opacity-30" />;
    return sortDir === 'asc'
      ? <ArrowUp size={10} className="text-mythos-accent" />
      : <ArrowDown size={10} className="text-mythos-accent" />;
  };

  return (
    <div className="h-full p-6 overflow-hidden min-h-0">
      <div className="glass-panel rounded-lg overflow-hidden flex flex-col h-full border border-mythos-accent/10">
        
        {/* ── Search Bar ── */}
        <div className="px-6 py-3 border-b border-glass-border/50 bg-black/30">
          <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-white/[0.02] border border-white/5 focus-within:border-mythos-accent/20 transition-colors">
            <Search size={14} className="text-gray-200/25 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tabloda ara..."
              className="flex-1 bg-transparent border-none outline-none text-[0.7rem] text-gray-200/80 placeholder:text-gray-200/20 tracking-wide font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-[0.6rem] text-gray-200/30 hover:text-gray-200/60 transition-colors px-1.5 py-0.5 rounded bg-white/5 border-none cursor-pointer font-sans"
              >
                Temizle
              </button>
            )}
          </div>
        </div>

        {/* ── Table Header Controls ── */}
        <div className="px-6 py-3.5 border-b border-glass-border bg-black/40 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-serif text-[0.6rem] tracking-[0.2em] uppercase text-gray-200/50">
              Durum:
            </span>
            <div className="flex gap-2">
              {([
                { value: 'all' as StatusFilter, label: 'Tümü' },
                { value: 'active' as StatusFilter, label: 'Aktif' },
                { value: 'dead' as StatusFilter, label: 'Ölü/Yıkık' },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={[
                    'px-3 py-1 text-[0.6rem] tracking-wider uppercase rounded-sm border transition-all cursor-pointer font-sans',
                    statusFilter === opt.value
                      ? 'border-mythos-accent/30 bg-mythos-accent/10 text-[#E8D48B]'
                      : 'border-white/5 hover:bg-white/5 text-gray-200/50',
                  ].join(' ')}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <span className="text-[0.55rem] text-gray-200/20 font-sans ml-2">
              {filteredEntities.length} kayıt
            </span>
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-mythos-accent/20 to-transparent border border-mythos-accent text-[#E8D48B] font-serif text-[0.6rem] tracking-[0.2em] uppercase rounded-sm hover:bg-mythos-accent hover:text-black transition-all shadow-[0_0_15px_rgba(212,175,55,0.15)] flex items-center gap-2 cursor-pointer">
            <span className="text-lg leading-none mt-[-2px]">+</span> Yeni Ekle
          </button>
        </div>

        {/* ── The Table ── */}
        <div
          ref={tableScrollRef}
          className="flex-1 overflow-auto min-h-0 custom-scrollbar overscroll-contain"
          onWheel={(e) => {
            const el = e.currentTarget;
            // Varsayılan dikey scroll'u devralıyoruz ki sayfa değil tablo kaydırsın.
            if (Math.abs(e.deltaY) < 0.5) return;
            if (el.scrollHeight <= el.clientHeight) return;
            e.preventDefault();
            e.stopPropagation();
            el.scrollTop += e.deltaY;
          }}
        >
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="sticky top-0 bg-[#121214] z-10 shadow-md">
              <tr>
                <th
                  onClick={() => handleSort('name')}
                  className="font-serif text-[0.5rem] tracking-[0.25em] text-gray-200/40 uppercase p-4 border-b border-glass-border w-[30%] cursor-pointer hover:text-gray-200/60 transition-colors select-none"
                >
                  <span className="flex items-center gap-1.5">
                    Varlık Adı <SortIcon column="name" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort('era')}
                  className="font-serif text-[0.5rem] tracking-[0.25em] text-gray-200/40 uppercase p-4 border-b border-glass-border w-[20%] cursor-pointer hover:text-gray-200/60 transition-colors select-none"
                >
                  <span className="flex items-center gap-1.5">
                    Çağ/Dönem <SortIcon column="era" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort('status')}
                  className="font-serif text-[0.5rem] tracking-[0.25em] text-gray-200/40 uppercase p-4 border-b border-glass-border w-[15%] cursor-pointer hover:text-gray-200/60 transition-colors select-none"
                >
                  <span className="flex items-center gap-1.5">
                    Durum <SortIcon column="status" />
                  </span>
                </th>
                <th
                  onClick={() => handleSort('linkCount')}
                  className="font-serif text-[0.5rem] tracking-[0.25em] text-gray-200/40 uppercase p-4 border-b border-glass-border text-center w-[15%] cursor-pointer hover:text-gray-200/60 transition-colors select-none"
                >
                  <span className="flex items-center justify-center gap-1.5">
                    Bağlantılar <SortIcon column="linkCount" />
                  </span>
                </th>
                <th className="font-serif text-[0.5rem] tracking-[0.25em] text-gray-200/40 uppercase p-4 border-b border-glass-border text-right w-[20%]">Aksiyonlar</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntities.map(entity => (
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
                    <button className="font-serif text-[0.55rem] tracking-[0.2em] text-mythos-accent/70 hover:text-mythos-accent uppercase flex items-center justify-end gap-1.5 ml-auto transition-colors group-hover:drop-shadow-[0_0_5px_rgba(212,175,55,0.5)] border-none bg-transparent cursor-pointer">
                      Görüntüle <span>→</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredEntities.length === 0 && (
            <div className="flex flex-col items-center justify-center p-20 text-center opacity-50">
              <Search size={28} className="mb-3 opacity-40" />
              <div className="font-serif text-xl mb-2">
                {searchQuery ? 'Arama sonucu bulunamadı' : 'Veri Bulunamadı'}
              </div>
              <div className="text-sm">
                {searchQuery
                  ? 'Farklı bir arama terimi veya filtre deneyin.'
                  : 'Bu kategoriye ait henüz bir kayıt oluşturulmamış.'}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
