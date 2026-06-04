/* ─────────────────────────────────────────────
 * MYTHOS Lorekeeper — AI Service (Groq Direct)
 *
 * Frontend'den doğrudan Groq API'ye çağrı yaparak
 * serbest metin notlarından entity ve relationship çıkarır.
 * ───────────────────────────────────────────── */

import type { EntityType, RelationType } from '@/types';

// ── AI Yanıt Tipleri ──
export interface AIEntity {
  name: string;
  type: EntityType;
  description: string;
  domains: string[];
  era: string;
  status: string;
}

export interface AIRelationship {
  sourceEntityName: string;
  targetEntityName: string;
  relation: RelationType;
}

export interface AIParsedResult {
  characters: AIEntity[];
  locations: AIEntity[];
  events: AIEntity[];
  relationships: AIRelationship[];
  summary: string;
}

// ── System Prompt ──
const SYSTEM_PROMPT = `Sen bir dünya inşa asistanısın. Sana verilen serbest metin notunu analiz et ve aşağıdaki JSON formatında yanıt ver. Başka hiçbir şey yazma, sadece JSON döndür:
{
  "characters": [{"name": "", "type": "character", "description": "", "domains": [], "era": "", "status": "active"}],
  "locations": [{"name": "", "type": "place", "description": "", "domains": [], "era": "", "status": "active"}],
  "events": [{"name": "", "type": "event", "description": "", "domains": [], "era": "", "status": "active"}],
  "relationships": [{"sourceEntityName": "", "targetEntityName": "", "relation": "friend|enemy|neutral|located_in|involved_in|other"}],
  "summary": "Genel özet"
}
Notunda bahsedilmeyen kategorileri boş liste olarak bırak.
ÖNEMLİ: Metinde adı geçen TÜM karakterler, mekanlar ve olaylar arasındaki mantıksal bağlantıları (relationships dizisinde) mutlaka oluştur! Karakterlerin mekanlarla ve olaylarla olan ilişkilerini (located_in, involved_in vb.) de eklemeyi unutma. Mümkün olduğunca hiçbir varlığı bağlantısız bırakma.
ÖNEMLİ: description alanlarını Türkçe yaz.`;

/**
 * Groq API'ye doğrudan çağrı yaparak not metnini analiz eder.
 * Karakterleri, mekanları, olayları ve ilişkileri çıkarır.
 */
export async function analyzeNoteWithAI(noteText: string): Promise<AIParsedResult> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('VITE_GROQ_API_KEY bulunamadı. Lütfen .env dosyasına ekleyin.');
  }

  const payload = {
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: noteText },
    ],
    temperature: 0.3,
    max_tokens: 2048,
  };

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[AI Service] Groq API hatası:', response.status, errorText);
    throw new Error(`Groq API hatası (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const rawText: string = data.choices?.[0]?.message?.content || '';

  console.log('[AI Service] Ham yanıt:', rawText);

  return parseAIResponse(rawText);
}

/**
 * AI'dan gelen ham metni JSON'a parse eder.
 * Markdown kod blokları (```json ... ```) varsa temizler.
 */
function parseAIResponse(rawText: string): AIParsedResult {
  let cleanText = rawText.trim();

  // Markdown kod blokları temizle
  if (cleanText.startsWith('```json')) {
    cleanText = cleanText.slice(7);
  } else if (cleanText.startsWith('```')) {
    cleanText = cleanText.slice(3);
  }
  if (cleanText.endsWith('```')) {
    cleanText = cleanText.slice(0, -3);
  }
  cleanText = cleanText.trim();

  try {
    const parsed = JSON.parse(cleanText);

    // Normalize: her kategoriyi dizi olarak garanti et
    const result: AIParsedResult = {
      characters: normalizeEntityArray(parsed.characters, 'character'),
      locations: normalizeEntityArray(parsed.locations, 'place'),
      events: normalizeEntityArray(parsed.events, 'event'),
      relationships: normalizeRelationships(parsed.relationships || []),
      summary: parsed.summary || '',
    };

    return result;
  } catch (err) {
    console.error('[AI Service] JSON parse hatası:', err);
    console.error('[AI Service] Temizlenmiş metin:', cleanText);
    throw new Error('AI yanıtı geçerli bir JSON değil. Lütfen tekrar deneyin.');
  }
}

/**
 * Entity dizisini normalize eder.
 * Groq bazen string dizisi döndürebilir: ["Aragorn"] → [{name: "Aragorn", ...}]
 */
function normalizeEntityArray(arr: unknown, type: EntityType): AIEntity[] {
  if (!Array.isArray(arr)) return [];

  return arr.map((item) => {
    if (typeof item === 'string') {
      return {
        name: item,
        type,
        description: '',
        domains: [],
        era: '',
        status: 'active',
      };
    }
    return {
      name: item.name || '',
      type: item.type === 'place' ? 'place' : item.type === 'event' ? 'event' : item.type === 'character' ? 'character' : type,
      description: item.description || '',
      domains: Array.isArray(item.domains) ? item.domains : [],
      era: item.era || '',
      status: item.status || 'active',
    };
  }).filter((e) => e.name.trim() !== '');
}

/**
 * Relationship dizisini normalize eder ve geçersiz relation tiplerini düzeltir.
 */
function normalizeRelationships(arr: unknown[]): AIRelationship[] {
  if (!Array.isArray(arr)) return [];

  const validRelations: RelationType[] = ['friend', 'enemy', 'neutral', 'located_in', 'involved_in', 'other'];

  return arr
    .filter((r: any) => r.sourceEntityName && r.targetEntityName)
    .map((r: any) => ({
      sourceEntityName: r.sourceEntityName,
      targetEntityName: r.targetEntityName,
      relation: validRelations.includes(r.relation) ? r.relation : 'other' as RelationType,
    }));
}
