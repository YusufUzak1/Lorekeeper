/* ─────────────────────────────────────────────
 * MYTHOS Lorekeeper — Universe Store
 *
 * Merkezi Zustand store:
 *  • Tüm veri koleksiyonları (entities, connections, myths, timeline, regions, languages)
 *  • CRUD aksiyonları (add, update, delete)
 *  • localStorage persistence (zustand/middleware → persist)
 *  • Seed data ile başlatma
 * ───────────────────────────────────────────── */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type {
  Entity,
  EntityType,
  Connection,
  RelationType,
  MythCard,
  TimelineEvent,
  MapRegion,
  Language,
  Universe,
} from '@/types';

// ── Filtre Tipleri ──
export type EntityFilterType = EntityType | 'all';

import {
  SEED_ENTITIES,
  SEED_CONNECTIONS,
  SEED_MYTHS,
  SEED_TIMELINE,
  SEED_REGIONS,
  SEED_LANGUAGES,
} from '@/data/seed';

// ── Sabit Seed Universe ID (Yüzüklerin Efendisi demo evreni) ──
export const SEED_UNIVERSE_ID = 'seed-lotr-universe';

// ── ID üretici ──
function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// ── Store State ──
interface UniverseState {
  // ── Aktif evren ──
  currentUniverseId: string | null;
  universes: Universe[];

  // ── Veri koleksiyonları ──
  entities: Entity[];
  connections: Connection[];
  myths: MythCard[];
  timeline: TimelineEvent[];
  regions: MapRegion[];
  languages: Language[];

  // ── Arama & Filtreleme ──
  searchQuery: string;
  activeFilter: EntityFilterType;
  setSearchQuery: (q: string) => void;
  setActiveFilter: (f: EntityFilterType) => void;

  // ── Evren aksiyonları ──
  replaceState: (newState: Partial<UniverseState>) => void;
  setCurrentUniverseId: (id: string | null) => void;
  addUniverse: (data: Omit<Universe, 'id' | 'createdAt'>) => Universe;
  deleteUniverse: (id: string) => void;

  // ── Entity CRUD ──
  addEntity: (data: Omit<Entity, 'id' | 'linkCount'>) => Entity;
  updateEntity: (id: string, data: Partial<Omit<Entity, 'id'>>) => void;
  deleteEntity: (id: string) => void;
  getEntitiesByType: (type: EntityType) => Entity[];
  getEntityById: (id: string) => Entity | undefined;

  // ── Connection CRUD ──
  addConnection: (sourceId: string, targetId: string, relation: RelationType) => Connection;
  deleteConnection: (id: string) => void;
  getConnectionsForEntity: (entityId: string) => Connection[];

  // ── Myth CRUD ──
  addMyth: (data: Omit<MythCard, 'id'>) => MythCard;
  updateMyth: (id: string, data: Partial<Omit<MythCard, 'id'>>) => void;
  deleteMyth: (id: string) => void;

  // ── Timeline CRUD ──
  addTimelineEvent: (data: Omit<TimelineEvent, 'id'>) => TimelineEvent;
  updateTimelineEvent: (id: string, data: Partial<Omit<TimelineEvent, 'id'>>) => void;
  deleteTimelineEvent: (id: string) => void;
  getTimelineByEra: (era: string) => TimelineEvent[];

  // ── Region CRUD ──
  addRegion: (data: Omit<MapRegion, 'id'>) => MapRegion;
  updateRegion: (id: string, data: Partial<Omit<MapRegion, 'id'>>) => void;
  deleteRegion: (id: string) => void;

  // ── Language CRUD ──
  addLanguage: (data: Omit<Language, 'id'>) => Language;
  updateLanguage: (id: string, data: Partial<Omit<Language, 'id'>>) => void;
  deleteLanguage: (id: string) => void;

  // ── Yardımcı ──
  resetToSeed: () => void;
  loadSeedForUniverse: (universeId: string) => void;

  // ── Universe-scoped Getters ──
  getMythsForCurrentUniverse: () => MythCard[];
  getEntitiesForCurrentUniverse: () => Entity[];
  getTimelineForCurrentUniverse: () => TimelineEvent[];
  getRegionsForCurrentUniverse: () => MapRegion[];
  getLanguagesForCurrentUniverse: () => Language[];
}

// ── Varsayılan state ──
const DEFAULT_STATE = {
  currentUniverseId: null as string | null,
  universes: [] as Universe[],
  entities: [] as Entity[],
  connections: [] as Connection[],
  myths: [] as MythCard[],
  timeline: [] as TimelineEvent[],
  regions: [] as MapRegion[],
  languages: [] as Language[],
  searchQuery: '',
  activeFilter: 'all' as EntityFilterType,
};

// ═══════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════

export const useUniverseStore = create<UniverseState>()(
  persist(
    (set, get) => ({
      // ── Init ──
      ...DEFAULT_STATE,

      // ─── Arama & Filtreleme ──────────────
      setSearchQuery: (q) => set({ searchQuery: q }),
      setActiveFilter: (f) => set({ activeFilter: f }),

      // ─── Evren ─────────────────────────────
      replaceState: (newState) => set((s) => ({ ...s, ...newState })),
      setCurrentUniverseId: (id) => set({ currentUniverseId: id }),

      addUniverse: (data) => {
        const newUniverse: Universe = {
          id: uid(),
          createdAt: new Date().toISOString(),
          ...data,
        };
        set((s) => ({ universes: [...s.universes, newUniverse] }));
        return newUniverse;
      },

      deleteUniverse: (id) =>
        set((s) => ({
          universes: s.universes.filter((u) => u.id !== id),
          currentUniverseId: s.currentUniverseId === id ? null : s.currentUniverseId,
        })),

      // ─── Entity ────────────────────────────
      addEntity: (data) => {
        const universeId = get().currentUniverseId || undefined;
        const newEntity: Entity = { id: uid(), linkCount: 0, universeId, ...data };
        set((s) => ({ entities: [...s.entities, newEntity] }));
        return newEntity;
      },

      updateEntity: (id, data) =>
        set((s) => ({
          entities: s.entities.map((e) => (e.id === id ? { ...e, ...data } : e)),
        })),

      deleteEntity: (id) =>
        set((s) => ({
          entities: s.entities.filter((e) => e.id !== id),
          // İlişkili bağlantıları da sil
          connections: s.connections.filter(
            (c) => c.sourceId !== id && c.targetId !== id
          ),
        })),

      getEntitiesByType: (type) => {
        const { entities, currentUniverseId } = get();
        return entities.filter((e) => e.type === type && e.universeId === currentUniverseId);
      },

      getEntityById: (id) => {
        const { entities, currentUniverseId } = get();
        return entities.find((e) => e.id === id && e.universeId === currentUniverseId);
      },

      // ─── Connection ────────────────────────
      addConnection: (sourceId, targetId, relation) => {
        const newConn: Connection = { id: uid(), sourceId, targetId, relation };
        set((s) => ({ 
          connections: [...s.connections, newConn],
          entities: s.entities.map(e => {
            if (e.id === sourceId || e.id === targetId) {
              return { ...e, linkCount: (e.linkCount || 0) + 1 };
            }
            return e;
          })
        }));
        return newConn;
      },

      deleteConnection: (id) =>
        set((s) => {
          const conn = s.connections.find(c => c.id === id);
          if (!conn) return s;
          
          return {
            connections: s.connections.filter((c) => c.id !== id),
            entities: s.entities.map(e => {
              if (e.id === conn.sourceId || e.id === conn.targetId) {
                return { ...e, linkCount: Math.max(0, (e.linkCount || 0) - 1) };
              }
              return e;
            })
          };
        }),

      getConnectionsForEntity: (entityId) => {
        const { connections } = get();
        // Varsayalım bağlantıların da universeId'si olabilir, yoksa sadece source/target entity'nin evrenini varsayarız
        // Fakat bağlantılar genelde entity'lere aittir. Güvende kalabilmek için store'daki currentUniverseId'yi dikkate almak en iyisi olur
        // Not: connection tipinde universeId alanı var mıydı? yoktu. Ancak bağlantının kime ait olduğunu biliyorsak sorun yok. 
        // Şimdilik sadece entity ID filtrelemesi yeterli. 
        return connections.filter(
          (c) => c.sourceId === entityId || c.targetId === entityId
        );
      },

      // ─── Myth ──────────────────────────────
      addMyth: (data) => {
        const universeId = get().currentUniverseId || undefined;
        const newMyth: MythCard = { id: uid(), universeId, ...data };
        set((s) => ({ myths: [...s.myths, newMyth] }));
        return newMyth;
      },

      updateMyth: (id, data) =>
        set((s) => ({
          myths: s.myths.map((m) => (m.id === id ? { ...m, ...data } : m)),
        })),

      deleteMyth: (id) =>
        set((s) => ({ myths: s.myths.filter((m) => m.id !== id) })),

      // ─── Timeline ─────────────────────────
      addTimelineEvent: (data) => {
        const universeId = get().currentUniverseId || undefined;
        const newEvent: TimelineEvent = { id: uid(), universeId, ...data };
        set((s) => ({ timeline: [...s.timeline, newEvent] }));
        return newEvent;
      },

      updateTimelineEvent: (id, data) =>
        set((s) => ({
          timeline: s.timeline.map((t) => (t.id === id ? { ...t, ...data } : t)),
        })),

      deleteTimelineEvent: (id) =>
        set((s) => ({
          timeline: s.timeline.filter((t) => t.id !== id),
        })),

      getTimelineByEra: (era) => {
        const { timeline, currentUniverseId } = get();
        return timeline.filter((t) => t.era === era && t.universeId === currentUniverseId);
      },

      // ─── Region ────────────────────────────
      addRegion: (data) => {
        const universeId = get().currentUniverseId || undefined;
        const newRegion: MapRegion = { id: uid(), universeId, ...data };
        set((s) => ({ regions: [...s.regions, newRegion] }));
        return newRegion;
      },

      updateRegion: (id, data) =>
        set((s) => ({
          regions: s.regions.map((r) => (r.id === id ? { ...r, ...data } : r)),
        })),

      deleteRegion: (id) =>
        set((s) => ({
          regions: s.regions.filter((r) => r.id !== id),
        })),

      // ─── Language ──────────────────────────
      addLanguage: (data) => {
        const universeId = get().currentUniverseId || undefined;
        const newLang: Language = { id: uid(), universeId, ...data };
        set((s) => ({ languages: [...s.languages, newLang] }));
        return newLang;
      },

      updateLanguage: (id, data) =>
        set((s) => ({
          languages: s.languages.map((l) => (l.id === id ? { ...l, ...data } : l)),
        })),

      deleteLanguage: (id) =>
        set((s) => ({
          languages: s.languages.filter((l) => l.id !== id),
        })),

      // ─── Yardımcı ─────────────────────────
      resetToSeed: () => set(DEFAULT_STATE),

      loadSeedForUniverse: (universeId: string) => {
        // Önce bu evren için mevcut seed verilerini temizle (çift yükleme önleme)
        const s = get();
        const alreadyHasData = s.myths.some((m) => m.universeId === universeId);
        if (alreadyHasData) return; // Zaten yüklü, tekrar ekleme

        const tagWithUniverse = <T extends { id: string }>(items: T[]): (T & { universeId: string })[] =>
          items.map((item) => ({ ...item, universeId }));

        set((state) => ({
          entities: [...state.entities, ...tagWithUniverse(SEED_ENTITIES)],
          connections: [...state.connections, ...SEED_CONNECTIONS],
          myths: [...state.myths, ...tagWithUniverse(SEED_MYTHS)],
          timeline: [...state.timeline, ...tagWithUniverse(SEED_TIMELINE)],
          regions: [...state.regions, ...tagWithUniverse(SEED_REGIONS)],
          languages: [...state.languages, ...tagWithUniverse(SEED_LANGUAGES)],
        }));
      },

      // ─── Universe-scoped Getters ─────────
      getMythsForCurrentUniverse: () => {
        const { myths, currentUniverseId } = get();
        if (!currentUniverseId) return [];
        return myths.filter((m) => m.universeId === currentUniverseId);
      },
      getEntitiesForCurrentUniverse: () => {
        const { entities, currentUniverseId } = get();
        if (!currentUniverseId) return [];
        return entities.filter((e) => e.universeId === currentUniverseId);
      },
      getTimelineForCurrentUniverse: () => {
        const { timeline, currentUniverseId } = get();
        if (!currentUniverseId) return [];
        return timeline.filter((t) => t.universeId === currentUniverseId);
      },
      getRegionsForCurrentUniverse: () => {
        const { regions, currentUniverseId } = get();
        if (!currentUniverseId) return [];
        return regions.filter((r) => r.universeId === currentUniverseId);
      },
      getLanguagesForCurrentUniverse: () => {
        const { languages, currentUniverseId } = get();
        if (!currentUniverseId) return [];
        return languages.filter((l) => l.universeId === currentUniverseId);
      },
    }),
    {
      name: 'mythos-universe-store',
      version: 3, // Force fresh state to remove old dangling data completely
    }
  )
);
