/* ─────────────────────────────────────────────
 * MYTHOS Lorekeeper — Core Data Types
 * Tüm varlıkların (entity, myth, timeline, map, language)
 * merkezi TypeScript tip tanımları.
 * ───────────────────────────────────────────── */

// ── Entity (Karakter / Mekan / Olay) ──
export type EntityType = 'character' | 'place' | 'event';

export type RelationType = 'friend' | 'enemy' | 'neutral';

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  relation: RelationType;
}

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  era: string;
  status: string;
  description: string;
  domains: string[];
  linkCount: number;
}

// ── Mitoloji ──
export interface MythCard {
  id: string;
  tier: string;
  glyph: string;
  name: string;
  epithet: string;
  color: string;
  description: string;
  domains: string[];
}

// ── Zaman Çizelgesi ──
export interface TimelineEvent {
  id: string;
  era: string;
  year: string;
  name: string;
  description: string;
  color: string;
  position: number;
  side: 'above' | 'below';
}

// ── Harita Bölgesi ──
export interface MapRegion {
  id: string;
  name: string;
  type: string;
  color: string;
  opacity: number;
  svgPath: string;
  description: string;
}

// ── Dil & Alfabe ──
export interface LanguageGlyph {
  char: string;
  label: string;
}

export interface LanguagePhrase {
  original: string;
  transcription: string;
  meaning: string;
}

export interface LanguagePhonetic {
  source: string;
  equivalent: string;
}

export interface Language {
  id: string;
  name: string;
  glyphs: LanguageGlyph[];
  phrases: LanguagePhrase[];
  info: string;
  phonetics: LanguagePhonetic[];
  family: string;
  writingDirection: string;
}

// ── Evren ──
export interface Universe {
  id: string;
  name: string;
  summary: string;
  tone: string;
  createdAt: string;
}
