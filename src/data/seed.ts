/* ─────────────────────────────────────────────
 * MYTHOS Lorekeeper — Seed Data
 * Dashboard HTML'deki ND[], ED[], MYTH[], TL{}, MR[], LANGS[]
 * dizilerinden çıkartılmış varsayılan veriler.
 * ───────────────────────────────────────────── */

import type {
  Entity,
  Connection,
  MythCard,
  TimelineEvent,
  MapRegion,
  Language,
} from '@/types';

// ── Yardımcı: benzersiz ID üret ──
let _counter = 0;
function sid(prefix: string): string {
  return `${prefix}-${String(++_counter).padStart(3, '0')}`;
}

// ═══════════════════════════════════════════════
// ENTITIES  (Karakterler, Mekanlar, Olaylar)
// ═══════════════════════════════════════════════

export const SEED_ENTITIES: Entity[] = [
  // ── Karakterler (type: 'character') ──
  { id: sid('chr'), name: 'GANDALF',        type: 'character', era: 'Üçüncü Çağ',  status: 'Aktif', description: '', domains: [], linkCount: 24 },
  { id: sid('chr'), name: 'ARAGORN',        type: 'character', era: 'Üçüncü Çağ',  status: 'Aktif', description: '', domains: [], linkCount: 31 },
  { id: sid('chr'), name: 'FRODO',          type: 'character', era: 'Üçüncü Çağ',  status: 'Aktif', description: '', domains: [], linkCount: 18 },
  { id: sid('chr'), name: 'SAURON',         type: 'character', era: 'İkinci Çağ',   status: 'Ölü',   description: '', domains: [], linkCount: 45 },
  { id: sid('chr'), name: 'GOLLUM',         type: 'character', era: 'Üçüncü Çağ',  status: 'Ölü',   description: '', domains: [], linkCount: 12 },
  { id: sid('chr'), name: 'SARUMAN',        type: 'character', era: 'Üçüncü Çağ',  status: 'Ölü',   description: '', domains: [], linkCount: 20 },
  { id: sid('chr'), name: 'LEGOLAS',        type: 'character', era: 'Üçüncü Çağ',  status: 'Aktif', description: '', domains: [], linkCount: 14 },
  { id: sid('chr'), name: 'GIMLI',          type: 'character', era: 'Üçüncü Çağ',  status: 'Aktif', description: '', domains: [], linkCount: 11 },
  { id: sid('chr'), name: 'BOROMIR',        type: 'character', era: 'Üçüncü Çağ',  status: 'Ölü',   description: '', domains: [], linkCount: 9 },
  { id: sid('chr'), name: 'ARWEN',          type: 'character', era: 'Üçüncü Çağ',  status: 'Aktif', description: '', domains: [], linkCount: 8 },
  { id: sid('chr'), name: 'ELROND',         type: 'character', era: 'İkinci Çağ',   status: 'Aktif', description: '', domains: [], linkCount: 22 },
  { id: sid('chr'), name: 'GALADRIEL',      type: 'character', era: 'Birinci Çağ',  status: 'Aktif', description: '', domains: [], linkCount: 28 },

  // ── Mekanlar (type: 'place') ──
  { id: sid('plc'), name: 'MORDOR',         type: 'place', era: 'İkinci Çağ',   status: 'Yok',   description: '', domains: [], linkCount: 38 },
  { id: sid('plc'), name: 'THE SHIRE',      type: 'place', era: 'Üçüncü Çağ',  status: 'Aktif', description: '', domains: [], linkCount: 15 },
  { id: sid('plc'), name: 'RIVENDELL',      type: 'place', era: 'İkinci Çağ',   status: 'Aktif', description: '', domains: [], linkCount: 26 },
  { id: sid('plc'), name: 'MINAS TİRİTH',   type: 'place', era: 'Üçüncü Çağ',  status: 'Aktif', description: '', domains: [], linkCount: 32 },
  { id: sid('plc'), name: 'ISENGARD',       type: 'place', era: 'Üçüncü Çağ',  status: 'Yıkık', description: '', domains: [], linkCount: 18 },
  { id: sid('plc'), name: 'ROHAN',          type: 'place', era: 'Üçüncü Çağ',  status: 'Aktif', description: '', domains: [], linkCount: 21 },
  { id: sid('plc'), name: 'LOTHLORIEN',     type: 'place', era: 'Birinci Çağ',  status: 'Soluk', description: '', domains: [], linkCount: 19 },
  { id: sid('plc'), name: 'KHAZAD DUM',     type: 'place', era: 'Birinci Çağ',  status: 'Terk',  description: '', domains: [], linkCount: 14 },

  // ── Olaylar (type: 'event') ──
  { id: sid('evt'), name: 'YÜZÜK SAVAŞI',   type: 'event', era: 'Üçüncü Çağ',  status: 'Bitti', description: '', domains: [], linkCount: 42 },
  { id: sid('evt'), name: 'DAGORLAD',       type: 'event', era: 'İkinci Çağ',   status: 'Bitti', description: '', domains: [], linkCount: 28 },
  { id: sid('evt'), name: 'HELM YARI',      type: 'event', era: 'Üçüncü Çağ',  status: 'Bitti', description: '', domains: [], linkCount: 19 },
  { id: sid('evt'), name: 'PELENNOR',       type: 'event', era: 'Üçüncü Çağ',  status: 'Bitti', description: '', domains: [], linkCount: 35 },
  { id: sid('evt'), name: 'KUZGUNKÖY',      type: 'event', era: 'Üçüncü Çağ',  status: 'Bitti', description: '', domains: [], linkCount: 11 },
  { id: sid('evt'), name: 'EREBOR',         type: 'event', era: 'Üçüncü Çağ',  status: 'Bitti', description: '', domains: [], linkCount: 16 },
];

// ═══════════════════════════════════════════════
// CONNECTIONS  (Bağlantılar)
// Orijinal indeksler (0-indexed ND[]) → entity ID'lere çevrildi
// ═══════════════════════════════════════════════

const _r = (rel: number): 'friend' | 'enemy' | 'neutral' =>
  rel === 1 ? 'friend' : rel === -1 ? 'enemy' : 'neutral';

function buildConnections(): Connection[] {
  const raw: [number, number, number][] = [
    [0, 1, 1], [0, 2, 1], [0, 3, -1], [0, 4, -1],
    [1, 2, 1], [1, 3, -1], [1, 9, 1], [1, 10, 1],
    [2, 4, -1], [2, 5, -1], [3, 5, 0], [0, 5, -1],
    [6, 7, 1], [6, 1, 1], [7, 8, 1], [8, 1, 1],
    [10, 11, 1], [11, 0, 1], [11, 1, 1],
    [3, 12, 0], [2, 13, 1], [0, 14, 1],
    [1, 15, 1], [5, 16, 0], [11, 18, 1],
    [0, 20, 1], [1, 20, 1], [2, 20, 1],
    [3, 21, 0], [5, 22, -1], [1, 23, 1],
    [12, 20, -1], [15, 23, 0], [16, 22, -1],
    [17, 22, 1], [13, 24, 0],
  ];

  return raw.map(([a, b, rel], i) => ({
    id: `conn-${String(i + 1).padStart(3, '0')}`,
    sourceId: SEED_ENTITIES[a].id,
    targetId: SEED_ENTITIES[b].id,
    relation: _r(rel),
  }));
}

export const SEED_CONNECTIONS: Connection[] = buildConnections();

// ═══════════════════════════════════════════════
// MYTHOLOGY  (Panteon & Mitoloji Kartları)
// ═══════════════════════════════════════════════

export const SEED_MYTHS: MythCard[] = [
  { id: sid('mth'), tier: 'İlk Varlıklar', glyph: '✦', name: 'ILÚVATAR',   epithet: 'Her Şeyin Babası',      color: '#f2d2d8', description: "Evrenin yaratıcısı. Müziğiyle tüm varlığı var etti; Ainur'u tasarladı ve onlara yaratım ezgisini öğretti.", domains: ['Yaratılış', 'Işık', 'Kaderi Biçimlendirme', 'Müzik'] },
  { id: sid('mth'), tier: 'İlk Varlıklar', glyph: '◬', name: 'MELKOR',     epithet: 'Karanlığın Lordu',       color: '#e85050', description: "En güçlü Valar; kendi müziğiyle yaratılış ezgisini bozdu ve karanlık güçlerin babası oldu.", domains: ['Kaos', 'Soğuk', 'Ateş', 'Yıkım', 'Korku'] },
  { id: sid('mth'), tier: 'Valar',         glyph: '⊕', name: 'MANWË',      epithet: 'Rüzgarların Efendisi',   color: '#7ecfff', description: "Gökyüzünün ve rüzgarın hâkimi; Ilúvatar'ın isteğini en iyi anlayan Valar.", domains: ['Hava', 'Rüzgar', 'Kartallar', 'Adalet'] },
  { id: sid('mth'), tier: 'Valar',         glyph: '◉', name: 'VARDA',      epithet: 'Yıldızların Kraliçesi',  color: '#e8a0d0', description: "Yıldızları ve Silmarilleri yükseklere koyan; Elflerin en çok sevdiği Valar.", domains: ['Yıldızlar', 'Işık', 'Umut', 'Koruyucu'] },
  { id: sid('mth'), tier: 'Valar',         glyph: '⋈', name: 'ULMO',       epithet: 'Suların Lordu',          color: '#4db89c', description: "Okyanusların ve nehirlerin efendisi; Valinor'dan ayrılmayan tek Valar.", domains: ['Denizler', 'Nehirler', 'Bilgelik', 'Sırlar'] },
  { id: sid('mth'), tier: 'Valar',         glyph: '◫', name: 'AULË',       epithet: 'Ustalar Ustası',         color: '#B8962E', description: "Dağların, madenlerin ve zanaatın tanrısı; Cüceleri ve Noldor'un bilgeliğini şekillendirdi.", domains: ['Toprak', 'Madencilik', 'Zanaat', 'Dağlar'] },
  { id: sid('mth'), tier: 'Maiar',         glyph: '᪥', name: 'GANDALF',    epithet: 'Gri Gezgin',             color: '#B8962E', description: "Maiar'dan bir ruh; Orta Dünya'ya gönderilmiş ve Ilúvatar'ın iradesini taşıyan bir rehber.", domains: ['Bilgelik', 'Ateş', 'Yolculuk', 'Uyanış'] },
  { id: sid('mth'), tier: 'Maiar',         glyph: '⊛', name: 'SAURON',     epithet: 'Karanlığın Gözü',        color: '#e85050', description: "Aulë'nin öğrencisiyken Melkor'a dönen, Yüzüklerin Efendisi'ni yaratan Maia.", domains: ['Aldatma', 'Gücü Ele Geçirme', 'Ateş', 'Kontrol'] },
  { id: sid('mth'), tier: 'Maiar',         glyph: '♦', name: 'BALROG',     epithet: 'Ateşin Şeytanı',        color: '#ff6b35', description: "Melkor'a hizmet eden ateş ve gölge varlıkları; en güçlüleri Durin'in Belası olarak bilinir.", domains: ['Ateş', 'Gölge', 'Yıkım', 'Korku'] },
  { id: sid('mth'), tier: 'Efsanevi Varlıklar', glyph: '🐉', name: 'ANCALAGON',  epithet: 'Siyah Ejder',    color: '#8888bb', description: "Melkor'un yarattığı en büyük ejder; kanatlarıyla dağları yıktı, Eärendil tarafından öldürüldü.", domains: ['Ejderha', 'Savaş', 'Yıkım', 'Uçuş'] },
  { id: sid('mth'), tier: 'Efsanevi Varlıklar', glyph: '🕷', name: 'UNGOLIANT',  epithet: 'Karanlık Örümcek', color: '#9966cc', description: "Işığı tüketen devasa örümcek; İki Ağacı yıkmasına rağmen hiçbir varlığa bağımlı değildi.", domains: ['Karanlık', 'Açgözlülük', 'Işığı Yutma'] },
  { id: sid('mth'), tier: 'Efsanevi Varlıklar', glyph: '✧', name: 'TOM BOMBADIL', epithet: 'İlk Varlık',    color: '#4db89c', description: "Ne olduğu hâlâ bilinmeyen, Yüzük'ün ona hiçbir etkisi olmayan, en eski varlık.", domains: ['Doğa', 'Neşe', 'Özgürlük', 'Sır'] },
];

// ═══════════════════════════════════════════════
// TIMELINE  (Zaman Çizelgesi)
// ═══════════════════════════════════════════════

export const SEED_TIMELINE: TimelineEvent[] = [
  // Yaratılış Çağı
  { id: sid('tl'), era: 'Yaratılış Çağı', year: 'A.Y. 1',    name: 'Ainulindalë',          description: "Ilúvatar'ın müziğiyle evrenin yaratılışı.",                       color: '#f2d2d8', position: 90,   side: 'above' },
  { id: sid('tl'), era: 'Yaratılış Çağı', year: 'A.Y. 500',  name: 'İki Ağaç',             description: "Telperion ve Laurelin — Valinor'u aydınlatan iki büyük ağaç.",     color: '#B8962E', position: 260,  side: 'below' },
  { id: sid('tl'), era: 'Yaratılış Çağı', year: 'A.Y. 1050', name: 'Elflerin Uyanışı',     description: "Cuiviénen'de ilk Elflerin gözlerini açması.",                       color: '#7ecfff', position: 440,  side: 'above' },
  { id: sid('tl'), era: 'Yaratılış Çağı', year: 'A.Y. 1300', name: 'Silmariller',          description: "Fëanor, İki Ağacın ışığını üç mücevhere hapsetti.",                 color: '#f2d2d8', position: 620,  side: 'below' },
  { id: sid('tl'), era: 'Yaratılış Çağı', year: 'A.Y. 1495', name: 'İki Ağacın Yıkılışı', description: "Melkor ve Ungoliant iki ağacı mahvetti.",                             color: '#e85050', position: 810,  side: 'above' },
  { id: sid('tl'), era: 'Yaratılış Çağı', year: 'A.Y. 1497', name: "Noldor'un Sürgünü",   description: "Fëanor ve halkı Valinor'u terk etti.",                               color: '#8888bb', position: 990,  side: 'below' },

  // Birinci Çağ
  { id: sid('tl'), era: 'Birinci Çağ', year: 'B.Ç. 1',    name: 'Beleriand Savaşları',  description: "Noldor ile Morgoth arasındaki mücadele başladı.",                     color: '#e85050', position: 90,   side: 'above' },
  { id: sid('tl'), era: 'Birinci Çağ', year: 'B.Ç. 60',   name: 'Dagor Aglareb',        description: 'Elflerin Angband\'ı kuşatması — "Parlak Zafer".',                    color: '#4db89c', position: 280,  side: 'below' },
  { id: sid('tl'), era: 'Birinci Çağ', year: 'B.Ç. 455',  name: 'Dagor Bragollach',     description: "Morgoth'un ani saldırısıyla kuşatma çözüldü.",                        color: '#e85050', position: 460,  side: 'above' },
  { id: sid('tl'), era: 'Birinci Çağ', year: 'B.Ç. 467',  name: 'Beren ve Lúthien',     description: "Silmaril'i Morgoth'un tacından çaldılar.",                            color: '#e8a0d0', position: 640,  side: 'below' },
  { id: sid('tl'), era: 'Birinci Çağ', year: 'B.Ç. 510',  name: "Gondolin'in Düşüşü",   description: "En büyük Elf şehri yıkıldı.",                                        color: '#e85050', position: 810,  side: 'above' },
  { id: sid('tl'), era: 'Birinci Çağ', year: 'B.Ç. 587',  name: 'Büyük Savaş',          description: "Valar müdahil oldu; Morgoth yenilgiye uğradı.",                       color: '#B8962E', position: 990,  side: 'below' },
  { id: sid('tl'), era: 'Birinci Çağ', year: 'B.Ç. 590',  name: "Beleriand'ın Batışı",  description: "Orta Dünya batı kıyıları denize gömüldü.",                            color: '#8888bb', position: 1170, side: 'above' },

  // İkinci Çağ
  { id: sid('tl'), era: 'İkinci Çağ', year: 'İ.Ç. 32',   name: "Númenor'un Kuruluşu",  description: "İnsanlara büyük ada armağan edildi.",                                 color: '#B8962E', position: 90,   side: 'above' },
  { id: sid('tl'), era: 'İkinci Çağ', year: 'İ.Ç. 1000', name: 'Sauron Güçlendi',      description: "Sauron Orta Dünya'da yeniden güç topladı.",                           color: '#e85050', position: 290,  side: 'below' },
  { id: sid('tl'), era: 'İkinci Çağ', year: 'İ.Ç. 1600', name: 'Tek Yüzük',            description: "Sauron tüm gücünü Tek Yüzük'e döktü.",                               color: '#e85050', position: 480,  side: 'above' },
  { id: sid('tl'), era: 'İkinci Çağ', year: 'İ.Ç. 3262', name: 'Sauron Esir Alındı',   description: "Númenor orduları Sauron'u tutsak etti.",                              color: '#4db89c', position: 670,  side: 'below' },
  { id: sid('tl'), era: 'İkinci Çağ', year: 'İ.Ç. 3319', name: "Númenor'un Batışı",    description: "Ilúvatar adalıları yuttu; dünya yuvarlak hale geldi.",                color: '#e85050', position: 860,  side: 'above' },
  { id: sid('tl'), era: 'İkinci Çağ', year: 'İ.Ç. 3441', name: 'Dagorlad Muharebesi',  description: "Son İttifak, Sauron'u yenilgiye uğrattı.",                            color: '#4db89c', position: 1060, side: 'below' },

  // Üçüncü Çağ
  { id: sid('tl'), era: 'Üçüncü Çağ', year: 'Ü.Ç. 1',    name: "Sauron'un Dönüşü",    description: "Yüzük kayboldu ama Sauron'un ruhu canlı kaldı.",                     color: '#e85050', position: 80,   side: 'above' },
  { id: sid('tl'), era: 'Üçüncü Çağ', year: 'Ü.Ç. 1050', name: 'Yüzük El Değiştirdi', description: "Sméagol balıkçıyla münakaşa; Yüzük el değiştirdi.",                   color: '#8888bb', position: 260,  side: 'below' },
  { id: sid('tl'), era: 'Üçüncü Çağ', year: 'Ü.Ç. 2941', name: "Ejderha'nın Ölümü",   description: "Bard, Smaug'u öldürdü; Erebor kurtarıldı.",                           color: '#B8962E', position: 460,  side: 'above' },
  { id: sid('tl'), era: 'Üçüncü Çağ', year: 'Ü.Ç. 3001', name: "Bilbo'nun Armağanı",  description: "111. doğum günü partisinde Yüzük Frodo'ya geçti.",                    color: '#7ecfff', position: 640,  side: 'below' },
  { id: sid('tl'), era: 'Üçüncü Çağ', year: 'Ü.Ç. 3018', name: 'Yüzük Yoldaşlığı',   description: "Dokuz yolcu Rivendell'den yola çıktı.",                               color: '#f2d2d8', position: 810,  side: 'above' },
  { id: sid('tl'), era: 'Üçüncü Çağ', year: 'Ü.Ç. 3019', name: 'Kaderim Yanardağı',   description: "Gollum ve Yüzük Orodruin'e düştü; Sauron yenildi.",                   color: '#4db89c', position: 1000, side: 'below' },
  { id: sid('tl'), era: 'Üçüncü Çağ', year: 'Ü.Ç. 3021', name: 'Gemi Rıhtımı',        description: "Frodo, Gandalf ve Elf büyükleri Batı'ya yelken açtı.",                color: '#e8a0d0', position: 1200, side: 'above' },
];

// ═══════════════════════════════════════════════
// MAP REGIONS  (Harita Bölgeleri)
// ═══════════════════════════════════════════════

export const SEED_REGIONS: MapRegion[] = [
  { id: sid('map'), name: 'MORDOR',     type: 'Karanlık Topraklar', color: '#e85050', opacity: 0.25, svgPath: 'M 560 330 L 640 300 L 720 320 L 740 385 L 700 425 L 630 445 L 565 415 Z', description: "Sauron'un hüküm sürdüğü ateş ve kül diyarı. Kaderim Yanardağı bu topraklarda yükselir." },
  { id: sid('map'), name: 'GONDOR',     type: 'İnsan Krallığı',    color: '#7ecfff', opacity: 0.18, svgPath: 'M 435 355 L 560 330 L 565 415 L 535 455 L 465 465 L 405 438 L 395 395 Z', description: "Güçlü insan krallığı. Başkenti Minas Tirith, Beyaz Dağlar'ın eteğinde yükselir." },
  { id: sid('map'), name: 'ROHAN',      type: 'Atlılar Diyarı',    color: '#B8962E', opacity: 0.18, svgPath: 'M 375 278 L 475 258 L 518 298 L 520 355 L 435 355 L 395 335 Z', description: "Düzlüklerin özgür atlıları Rohirrim'in yurdu. Edoras'ın altın sarayları tepede parlar." },
  { id: sid('map'), name: 'THE SHIRE',  type: 'Hobbit Yurdu',      color: '#4db89c', opacity: 0.22, svgPath: 'M 135 218 L 215 198 L 258 228 L 255 278 L 205 298 L 145 288 Z', description: "Hobbitlerin barış içinde yaşadığı verimli ve sakin topraklar. Bag End burada yer alır." },
  { id: sid('map'), name: 'RİVENDELL',  type: 'Elf Sığınağı',      color: '#e8a0d0', opacity: 0.22, svgPath: 'M 308 228 L 358 218 L 378 248 L 358 272 L 318 268 Z', description: "Elrond'un vadideki kalesi; Orta Dünya'nın en güvenli bilgelik merkezi." },
  { id: sid('map'), name: 'LÓRİEN',    type: 'Elf Ormanı',        color: '#e8a0d0', opacity: 0.17, svgPath: 'M 438 298 L 498 288 L 510 328 L 478 348 L 438 338 Z', description: "Galadriel ve Celeborn'un altın yapraklı ormanlık krallığı. Zamandan muaf bir yer." },
  { id: sid('map'), name: 'MORIA',      type: 'Cüce Madeni',       color: '#8888bb', opacity: 0.22, svgPath: 'M 358 272 L 438 258 L 458 290 L 438 310 L 378 308 Z', description: "Kazad Dûm; Misty Dağları'nın derinliklerinde Cüceler tarafından kazılmış dev madenci şehri." },
  { id: sid('map'), name: 'İSENGARD',   type: 'Sihirbaz Kalesi',   color: '#ff6b35', opacity: 0.20, svgPath: 'M 338 298 L 378 288 L 398 318 L 378 342 L 338 338 Z', description: "Saruman'ın çelik kalesi Orthanc; ihanet ve sanayinin simgesi oldu." },
  { id: sid('map'), name: 'EREBOR',     type: 'Cüce Dağı',         color: '#B8962E', opacity: 0.20, svgPath: 'M 578 185 L 628 172 L 658 198 L 638 228 L 588 222 Z', description: "Yalnız Dağ; Thror'un büyük hazinesinin yattığı yer ve Smaug'un eski yuvası." },
  { id: sid('map'), name: 'MİRKWOOD',   type: 'Karanlık Orman',    color: '#4db89c', opacity: 0.12, svgPath: 'M 478 165 L 578 155 L 600 228 L 558 258 L 478 248 Z', description: "Örümcekler ve karanlıkla dolu büyük orman; Thranduil'in elf krallığının yurdu." },
  { id: sid('map'), name: 'ANGMAR',     type: 'Cadı Krallığı',     color: '#e85050', opacity: 0.15, svgPath: 'M 298 118 L 378 98 L 418 138 L 388 168 L 298 162 Z', description: "Kuzey'de Cadı-Kral'ın kurduğu karanlık krallık; Gondor'un kuzey savunmasını yıktı." },
];

// ═══════════════════════════════════════════════
// LANGUAGES  (Diller & Alfabeler)
// ═══════════════════════════════════════════════

export const SEED_LANGUAGES: Language[] = [
  {
    id: sid('lng'), name: 'Tengwar (Elfçe)',
    glyphs: [{char:'ᛏ',label:'T'},{char:'ᛈ',label:'P'},{char:'ᚲ',label:'K'},{char:'ᚾ',label:'N'},{char:'ᛗ',label:'M'},{char:'ᚹ',label:'W'},{char:'ᚱ',label:'R'},{char:'ᛚ',label:'L'},{char:'ᛊ',label:'S'},{char:'ᚺ',label:'H'},{char:'ᚦ',label:'TH'},{char:'ᚠ',label:'F'},{char:'ᚨ',label:'A'},{char:'ᛖ',label:'E'},{char:'ᛁ',label:'İ'},{char:'ᛟ',label:'O'},{char:'ᚢ',label:'U'},{char:'ᛃ',label:'İA'},{char:'ᛉ',label:'KW'},{char:'ᛜ',label:'NG'}],
    phrases: [{original:'ᛗᛁᚦᚱᛁᛚ',transcription:'Mithril',meaning:'Mithril metal'},{original:'ᚾᚨᛗᚨᚱᛁᛖ',transcription:'Namárië',meaning:'Elveda'},{original:'ᛖᛚᛖᚾ',transcription:'Elen',meaning:'Yıldız'},{original:'ᚨᛚᚨᚱᛖᚾ',transcription:'Alaren',meaning:'Uzak diyar'},{original:'ᛖᚨᚱᛖᚾᛞᛁᛚ',transcription:'Eärendil',meaning:'Deniz-seven'}],
    info: '<b>Tengwar</b>, Fëanor tarafından yaratılan; hem Quenya hem Sindarin yazmak için kullanılan sessiz-sesli harf sistemidir. Soldan sağa yazılır.',
    phonetics: [{source:'þ',equivalent:'TH'},{source:'ñ',equivalent:'NG'},{source:'kw',equivalent:'QU'},{source:'hw',equivalent:'HW'},{source:'ly',equivalent:'LY'}],
    family: "Elf dili ailesi; Quenya ve Sindarin'in yazı sistemi. Fëanor tarafından Valinor'da yaratılmıştır.",
    writingDirection: 'Soldan sağa, ses değerlerine göre hiyerarşik',
  },
  {
    id: sid('lng'), name: 'Valyriaca (Yüksek Valyrian)',
    glyphs: [{char:'𐌰',label:'A'},{char:'𐌱',label:'B'},{char:'𐌲',label:'G'},{char:'𐌳',label:'D'},{char:'𐌴',label:'E'},{char:'𐌵',label:'Q'},{char:'𐌶',label:'Z'},{char:'𐌷',label:'H'},{char:'𐌸',label:'TH'},{char:'𐌹',label:'İ'},{char:'𐌺',label:'K'},{char:'𐌻',label:'L'},{char:'𐌼',label:'M'},{char:'𐌽',label:'N'},{char:'𐌾',label:'J'},{char:'𐌿',label:'U'},{char:'𐍀',label:'P'},{char:'𐍂',label:'R'},{char:'𐍃',label:'S'},{char:'𐍄',label:'T'}],
    phrases: [{original:'𐌰𐌴𐌲𐍃𐍃𐌾𐍃',transcription:'Aegsys',meaning:'Ejder ateşi'},{original:'𐌱𐌴𐌽𐌾𐍃',transcription:'Bēnys',meaning:'Kahraman'},{original:'𐍅𐌰𐌻𐌾𐍃',transcription:'Valar',meaning:'Güçlü varlıklar'},{original:'𐌺𐌴𐌻𐌾𐍃',transcription:'Kelis',meaning:'Buz, soğuk'},{original:'𐌻𐍅𐌾𐍄',transcription:'Lūbys',meaning:'Rüzgar, nefes'}],
    info: '<b>Yüksek Valyrian</b>, Valyria imparatorluğunun yönetici ve eğitimli sınıfı tarafından kullanılan ölü bir dildir.',
    phonetics: [{source:'ae',equivalent:'EY'},{source:'ȳ',equivalent:'ÜÜ'},{source:'ō',equivalent:'OO'},{source:'ū',equivalent:'UU'},{source:'rh',equivalent:'HR'}],
    family: "Eski Valyria imparatorluğunun kökenli; Essos'ta konuşulan dillerin atası.",
    writingDirection: 'Soldan sağa, alfabetik sıra',
  },
  {
    id: sid('lng'), name: 'Khuzdul (Cüce Dili)',
    glyphs: [{char:'ᚦ',label:'TH'},{char:'ᚢ',label:'U'},{char:'ᚱ',label:'R'},{char:'ᛁ',label:'İ'},{char:'ᚾ',label:'N'},{char:'ᚲ',label:'K'},{char:'ᚷ',label:'G'},{char:'ᚨ',label:'A'},{char:'ᛗ',label:'M'},{char:'ᛒ',label:'B'},{char:'ᛞ',label:'D'},{char:'ᛚ',label:'L'},{char:'ᛇ',label:'Z'},{char:'ᛜ',label:'NG'},{char:'ᛟ',label:'O'},{char:'ᚹ',label:'W'},{char:'ᚺ',label:'H'},{char:'ᛊ',label:'S'},{char:'ᛏ',label:'T'},{char:'ᚠ',label:'F'}],
    phrases: [{original:'ᚲᚺᚨᛉᚨᛞᛞᚢᛗ',transcription:'Khazad dûm',meaning:'Cüce ocağı, Moria'},{original:'ᛒᚨᚱᚢᚲᛉᚨᛒᚨᛉᚾ',transcription:'Barukkhizn',meaning:'Toprak içinde'},{original:'ᚢᚱᚢᚲᚺᚨᛁ',transcription:'Urukhai',meaning:'Savaşa hazır ork'},{original:'ᛗᛁᚦᚱᛁᛚ',transcription:'Miril',meaning:'Mithril zırh'},{original:'ᛞᚢᚱᛁᚾ',transcription:'Durin',meaning:'Cücelerin atası'}],
    info: '<b>Khuzdul</b>, Cüceler tarafından titizlikle gizlenen ve yabancılara öğretilmeyen bir dildir. Sami dillerine benzer üçlü kök sistemi vardır.',
    phonetics: [{source:'kh',equivalent:'KH'},{source:'gh',equivalent:'GH'},{source:'th',equivalent:'TH'},{source:'dz',equivalent:'DZ'},{source:'nk',equivalent:'NK'}],
    family: "Aulë tarafından Cüceler'le birlikte tasarlanan izole bir dil; hiçbir dille akraba değil.",
    writingDirection: 'Sağdan sola (Cirth runik sistemi ile de yazılır)',
  },
  {
    id: sid('lng'), name: 'Adûnaic (Númenorcaca)',
    glyphs: [{char:'𐌰',label:'A'},{char:'𐌳',label:'D'},{char:'𐌿',label:'U'},{char:'𐌽',label:'N'},{char:'𐌴',label:'E'},{char:'𐌺',label:'K'},{char:'𐍃',label:'S'},{char:'𐌷',label:'H'},{char:'𐌱',label:'B'},{char:'𐌻',label:'L'},{char:'𐍄',label:'T'},{char:'𐌼',label:'M'},{char:'𐌹',label:'İ'},{char:'𐍂',label:'R'},{char:'𐌶',label:'Z'},{char:'𐌵',label:'Q'},{char:'𐌸',label:'TH'},{char:'𐌾',label:'Y'},{char:'𐌲',label:'G'},{char:'𐌶',label:'Î'}],
    phrases: [{original:'𐌽𐌿𐌼𐌴𐌽𐍃',transcription:'Nûmenôr',meaning:'Batıdaki ada'},{original:'𐌰𐌳𐌿𐌽𐌰𐌺',transcription:'Adûnak',meaning:'Batı insanı, Númenorlu'},{original:'𐌱𐌰𐌻𐌺',transcription:'Balk',meaning:'Güç, iktidar'},{original:'𐌽𐌰𐌺𐌷𐌰𐌳',transcription:'Nakhad',meaning:'Yok olmak, batmak'},{original:'𐌰𐌽𐌺𐌰𐌻𐌻',transcription:'Ankall',meaning:'Tanrılar, yaratıcılar'}],
    info: "<b>Adûnaic</b>, Númenor'un sıradan halkının konuştuğu dildir. Zamanla Quenya'nın yerini aldı ve Ortak Dil'e (Westron) evrildi.",
    phonetics: [{source:'â',equivalent:'AA'},{source:'ô',equivalent:'OO'},{source:'î',equivalent:'İİ'},{source:'û',equivalent:'UU'},{source:'ph',equivalent:'F'}],
    family: "Númenor sıradan halkının dili; Ortak Dil'in (Westron) atasıdır.",
    writingDirection: 'Soldan sağa, alfabetik sıra',
  },
];
