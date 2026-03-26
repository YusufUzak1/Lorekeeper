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

import {
  SEED_ENTITIES,
  SEED_CONNECTIONS,
  SEED_MYTHS,
  SEED_TIMELINE,
  SEED_REGIONS,
  SEED_LANGUAGES,
} from '@/data/seed';

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

  // ── Evren aksiyonları ──
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
}

// ── Varsayılan state ──
const DEFAULT_STATE = {
  currentUniverseId: null as string | null,
  universes: [] as Universe[],
  entities: SEED_ENTITIES,
  connections: SEED_CONNECTIONS,
  myths: SEED_MYTHS,
  timeline: SEED_TIMELINE,
  regions: SEED_REGIONS,
  languages: SEED_LANGUAGES,
};

// ═══════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════

export const useUniverseStore = create<UniverseState>()(
  persist(
    (set, get) => ({
      // ── Init ──
      ...DEFAULT_STATE,

      // ─── Evren ─────────────────────────────
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
        const newEntity: Entity = { id: uid(), linkCount: 0, ...data };
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

      getEntitiesByType: (type) => get().entities.filter((e) => e.type === type),

      getEntityById: (id) => get().entities.find((e) => e.id === id),

      // ─── Connection ────────────────────────
      addConnection: (sourceId, targetId, relation) => {
        const newConn: Connection = { id: uid(), sourceId, targetId, relation };
        set((s) => ({ connections: [...s.connections, newConn] }));
        return newConn;
      },

      deleteConnection: (id) =>
        set((s) => ({
          connections: s.connections.filter((c) => c.id !== id),
        })),

      getConnectionsForEntity: (entityId) =>
        get().connections.filter(
          (c) => c.sourceId === entityId || c.targetId === entityId
        ),

      // ─── Myth ──────────────────────────────
      addMyth: (data) => {
        const newMyth: MythCard = { id: uid(), ...data };
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
        const newEvent: TimelineEvent = { id: uid(), ...data };
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

      getTimelineByEra: (era) => get().timeline.filter((t) => t.era === era),

      // ─── Region ────────────────────────────
      addRegion: (data) => {
        const newRegion: MapRegion = { id: uid(), ...data };
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
        const newLang: Language = { id: uid(), ...data };
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
    }),
    {
      name: 'mythos-universe-store',
      version: 1,
    }
  )
);
