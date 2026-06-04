import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useUniverseStore } from '@/store/useUniverseStore';
import { analyzeNoteWithAI } from '@/services/aiService';
import type { RelationType } from '@/types';

interface LoreNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SubmitState = 'idle' | 'loading' | 'success' | 'error';

interface ResultSummary {
  characters: number;
  locations: number;
  events: number;
  relationships: number;
}

export function LoreNoteModal({ isOpen, onClose }: LoreNoteModalProps) {
  const { 
    currentUniverseId, 
    addEntity, 
    addConnection,
    getEntitiesForCurrentUniverse 
  } = useUniverseStore();

  const [noteText, setNoteText] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [resultSummary, setResultSummary] = useState<ResultSummary | null>(null);

  const resetForm = () => {
    setNoteText('');
    setSubmitState('idle');
    setErrorMessage('');
    setResultSummary(null);
  };

  const handleClose = () => {
    if (submitState !== 'loading') {
      resetForm();
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!noteText.trim() || !currentUniverseId) return;

    setSubmitState('loading');
    setErrorMessage('');
    setResultSummary(null);

    try {
      // 1. Groq API'ye doğrudan çağrı yap
      const parsed = await analyzeNoteWithAI(noteText.trim());

      console.log('[LoreNote] AI çıktısı:', parsed);

      // 2. Mevcut entity'leri al (çakışma kontrolü için)
      const existingEntities = getEntitiesForCurrentUniverse();
      const existingNames = new Set(existingEntities.map(e => e.name.toLowerCase()));

      // 3. Yeni entity'leri ekle ve name → id haritası oluştur
      const nameToId: Record<string, string> = {};
      
      // Mevcut entity'lerin name→id haritasını ekle
      for (const ent of existingEntities) {
        nameToId[ent.name.toLowerCase()] = ent.id;
      }

      let addedChars = 0;
      let addedLocs = 0;
      let addedEvents = 0;
      let addedRels = 0;

      // Karakterleri ekle
      for (const char of parsed.characters) {
        if (existingNames.has(char.name.toLowerCase())) {
          console.log(`[LoreNote] Karakter zaten mevcut, atlanıyor: ${char.name}`);
          continue;
        }
        const newEntity = addEntity({
          name: char.name,
          type: 'character',
          description: char.description,
          domains: char.domains,
          era: char.era || 'Bilinmiyor',
          status: char.status || 'active',
        });
        nameToId[char.name.toLowerCase()] = newEntity.id;
        existingNames.add(char.name.toLowerCase());
        addedChars++;
      }

      // Mekanları ekle
      for (const loc of parsed.locations) {
        if (existingNames.has(loc.name.toLowerCase())) {
          console.log(`[LoreNote] Mekan zaten mevcut, atlanıyor: ${loc.name}`);
          continue;
        }
        const newEntity = addEntity({
          name: loc.name,
          type: 'place',
          description: loc.description,
          domains: loc.domains,
          era: loc.era || 'Bilinmiyor',
          status: loc.status || 'active',
        });
        nameToId[loc.name.toLowerCase()] = newEntity.id;
        existingNames.add(loc.name.toLowerCase());
        addedLocs++;
      }

      // Olayları ekle
      for (const evt of parsed.events) {
        if (existingNames.has(evt.name.toLowerCase())) {
          console.log(`[LoreNote] Olay zaten mevcut, atlanıyor: ${evt.name}`);
          continue;
        }
        const newEntity = addEntity({
          name: evt.name,
          type: 'event',
          description: evt.description,
          domains: evt.domains,
          era: evt.era || 'Bilinmiyor',
          status: evt.status || 'active',
        });
        nameToId[evt.name.toLowerCase()] = newEntity.id;
        existingNames.add(evt.name.toLowerCase());
        addedEvents++;
      }

      // 4. İlişkileri ekle
      for (const rel of parsed.relationships) {
        const sourceId = nameToId[rel.sourceEntityName.toLowerCase()];
        const targetId = nameToId[rel.targetEntityName.toLowerCase()];

        if (!sourceId || !targetId) {
          console.warn(`[LoreNote] İlişki atlanıyor (entity bulunamadı): ${rel.sourceEntityName} → ${rel.targetEntityName}`);
          continue;
        }

        // Aynı bağlantı zaten var mı kontrol et
        const existingConnections = useUniverseStore.getState().getConnectionsForCurrentUniverse();
        const alreadyExists = existingConnections.some(
          c => (c.sourceId === sourceId && c.targetId === targetId) ||
               (c.sourceId === targetId && c.targetId === sourceId)
        );

        if (alreadyExists) {
          console.log(`[LoreNote] Bağlantı zaten mevcut: ${rel.sourceEntityName} → ${rel.targetEntityName}`);
          continue;
        }

        // RelationType'a çevir (AI'dan gelen değer geçerli mi kontrol et)
        const validRelations: RelationType[] = ['friend', 'enemy', 'neutral', 'located_in', 'involved_in', 'other'];
        const relation: RelationType = validRelations.includes(rel.relation as RelationType) 
          ? rel.relation as RelationType 
          : 'other';

        addConnection(sourceId, targetId, relation);
        addedRels++;
      }

      // 5. Sonuç özeti
      const summary: ResultSummary = {
        characters: addedChars,
        locations: addedLocs,
        events: addedEvents,
        relationships: addedRels,
      };

      setResultSummary(summary);
      setSubmitState('success');

      console.log('[LoreNote] Ekleme tamamlandı:', summary);

      // 5 saniye sonra modalı kapat
      setTimeout(() => {
        resetForm();
        onClose();
      }, 5000);

    } catch (err: any) {
      console.error('[LoreNote] Hata:', err);
      setSubmitState('error');
      setErrorMessage(err.message || 'AI analizi sırasında bir hata oluştu.');
    }
  };

  const charCount = noteText.length;
  const isDisabled = !noteText.trim() || submitState === 'loading' || submitState === 'success';

  const totalAdded = resultSummary 
    ? resultSummary.characters + resultSummary.locations + resultSummary.events 
    : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
          >
            <div
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-2xl border border-white/10 bg-[#0e0e10]/95 backdrop-blur-xl shadow-[0_0_80px_rgba(212,175,55,0.08)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Ambient glow */}
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-40 bg-mythos-accent/10 rounded-full blur-[80px] pointer-events-none" />

              {/* Sparkle decorations */}
              <div className="absolute top-6 right-16 w-1 h-1 rounded-full bg-mythos-accent/40 animate-pulse" />
              <div className="absolute top-10 right-24 w-0.5 h-0.5 rounded-full bg-mythos-accent/30 animate-pulse" style={{ animationDelay: '0.5s' }} />
              <div className="absolute top-14 right-12 w-0.5 h-0.5 rounded-full bg-mythos-accent/20 animate-pulse" style={{ animationDelay: '1s' }} />

              {/* Header */}
              <div className="relative flex items-center justify-between px-8 pt-8 pb-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-mythos-accent/20 to-mythos-accent/5 border border-mythos-accent/30 flex items-center justify-center">
                      <Sparkles size={16} className="text-mythos-accent" />
                    </div>
                    <h2 className="font-serif text-xl tracking-[0.15em] text-[#E8D48B] uppercase">
                      AI Lore Notu
                    </h2>
                  </div>
                  <p className="text-[0.65rem] text-white/30 mt-2 tracking-wider leading-relaxed max-w-md">
                    Serbest metin yazın — AI karakterleri, mekanları, olayları ve ilişkileri otomatik olarak çıkarsın ve Kosmos'a eklesin.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-2 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="px-8 pb-8 flex flex-col gap-5">
                {/* Textarea */}
                <label className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[0.6rem] uppercase tracking-[0.2em] text-white/40 font-serif">
                      Serbest Not
                    </span>
                    <span className={`text-[0.5rem] tracking-wider font-serif transition-colors ${
                      charCount > 2000 ? 'text-red-400/70' : 'text-white/20'
                    }`}>
                      {charCount} / 3000
                    </span>
                  </div>
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value.slice(0, 3000))}
                    placeholder={`Örnek: "Kara Orman'ın derinliklerinde yaşayan Eldric adında bir büyücü var. Yüzyıllardır Gölge Lordu Malachar'a karşı savaşıyor. Eldric'in en yakın müttefiki, Gümüş Kale'nin komutanı Sera. Gölge Lordu'nun ordusu son zamanlarda Kuzey Geçidi'ni ele geçirdi..."`}
                    rows={8}
                    disabled={submitState === 'loading' || submitState === 'success'}
                    className="w-full rounded-lg bg-white/[0.03] border border-white/10 px-4 py-3 text-sm text-white/90 outline-none focus:border-mythos-accent/50 focus:ring-1 focus:ring-mythos-accent/30 transition-all placeholder:text-white/15 resize-none leading-relaxed disabled:opacity-50"
                  />
                </label>

                {/* AI Info Box */}
                <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-mythos-accent/[0.04] border border-mythos-accent/10">
                  <Sparkles size={14} className="text-mythos-accent/50 mt-0.5 shrink-0" />
                  <p className="text-[0.55rem] text-white/30 leading-relaxed tracking-wide">
                    AI notunuzu analiz ederek karakterler, mekanlar, olaylar ve aralarındaki ilişkileri otomatik olarak çıkaracak ve
                    <span className="text-mythos-accent/60"> doğrudan Kosmos'a </span> ekleyecektir. İşlem birkaç saniye sürer.
                  </p>
                </div>

                {/* Status Messages */}
                <AnimatePresence mode="wait">
                  {submitState === 'loading' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-500/10 border border-blue-500/20"
                    >
                      <Loader2 size={16} className="text-blue-400 shrink-0 animate-spin" />
                      <p className="text-[0.65rem] text-blue-300/80 tracking-wide">
                        AI notunuzu analiz ediyor... Karakterler, mekanlar ve ilişkiler çıkarılıyor.
                      </p>
                    </motion.div>
                  )}

                  {submitState === 'success' && resultSummary && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex flex-col gap-3 px-4 py-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                        <p className="text-[0.7rem] text-emerald-300/90 tracking-wide font-medium">
                          Analiz tamamlandı! Kosmos güncellendi.
                        </p>
                      </div>
                      
                      {totalAdded > 0 || resultSummary.relationships > 0 ? (
                        <div className="grid grid-cols-2 gap-2 ml-7">
                          {resultSummary.characters > 0 && (
                            <div className="flex items-center gap-2 text-[0.6rem] text-emerald-300/70">
                              <div className="w-2 h-2 rounded-full bg-[#6699ee]" />
                              {resultSummary.characters} karakter eklendi
                            </div>
                          )}
                          {resultSummary.locations > 0 && (
                            <div className="flex items-center gap-2 text-[0.6rem] text-emerald-300/70">
                              <div className="w-2 h-2 rounded-full bg-[#44bbaa]" />
                              {resultSummary.locations} mekan eklendi
                            </div>
                          )}
                          {resultSummary.events > 0 && (
                            <div className="flex items-center gap-2 text-[0.6rem] text-emerald-300/70">
                              <div className="w-2 h-2 rounded-full bg-[#dd9988]" />
                              {resultSummary.events} olay eklendi
                            </div>
                          )}
                          {resultSummary.relationships > 0 && (
                            <div className="flex items-center gap-2 text-[0.6rem] text-emerald-300/70">
                              <div className="w-4 h-[1.5px] bg-[#8888bb]" />
                              {resultSummary.relationships} ilişki eklendi
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-[0.6rem] text-emerald-300/50 ml-7">
                          Tüm entity'ler ve ilişkiler zaten mevcut — yeni ekleme yapılmadı.
                        </p>
                      )}
                    </motion.div>
                  )}

                  {submitState === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20"
                    >
                      <AlertCircle size={16} className="text-red-400 shrink-0" />
                      <p className="text-[0.65rem] text-red-300/80 tracking-wide">
                        {errorMessage}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-5 py-2.5 text-xs uppercase tracking-[0.15em] text-white/40 hover:text-white/70 transition-colors rounded-lg border border-white/5 hover:border-white/10 cursor-pointer"
                  >
                    İptal
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isDisabled}
                    className="group flex items-center justify-center gap-2.5 px-6 py-2.5 text-xs uppercase tracking-[0.2em] font-semibold bg-gradient-to-r from-mythos-accent/90 to-mythos-accent/70 text-black rounded-lg hover:from-mythos-accent hover:to-mythos-accent/90 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer shadow-[0_0_20px_rgba(212,175,55,0.2)] min-w-[180px]"
                  >
                    {submitState === 'loading' ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Analiz Ediliyor...
                      </>
                    ) : submitState === 'success' ? (
                      <>
                        <CheckCircle2 size={16} />
                        Kosmos'a Eklendi!
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        AI ile Analiz Et
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
