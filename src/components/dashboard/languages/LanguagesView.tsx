import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUniverseStore } from '@/store/useUniverseStore';
import { Languages, Plus, BookOpen, Mic, AlignCenter, Trash2, ChevronRight } from 'lucide-react';
import type { Language } from '@/types';
import { AddLanguageModal } from './AddLanguageModal';

type LanguageTab = 'glyphs' | 'phrases' | 'phonetics' | 'info';

export function LanguagesView() {
  const { getLanguagesForCurrentUniverse, deleteLanguage } = useUniverseStore();
  const languages = getLanguagesForCurrentUniverse();

  const [activeLanguageId, setActiveLanguageId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<LanguageTab>('glyphs');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Aktif dil objesi
  const activeLanguage = useMemo<Language | null>(
    () => languages.find(l => l.id === activeLanguageId) ?? (languages.length > 0 ? languages[0] : null),
    [languages, activeLanguageId]
  );

  // Modal kapanınca yeni dili seçili yap
  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const TABS: { key: LanguageTab; label: string; icon: React.ReactNode }[] = [
    { key: 'glyphs',    label: 'Alfabe & Glifler',  icon: <Languages size={14} /> },
    { key: 'phrases',   label: 'Sözlük & Cümleler', icon: <BookOpen size={14} /> },
    { key: 'phonetics', label: 'Fonetik Eşdeğerler', icon: <Mic size={14} /> },
    { key: 'info',      label: 'Dil Bilgisi',        icon: <AlignCenter size={14} /> },
  ];

  return (
    <div className="h-full w-full bg-[#0a0a0b] flex flex-col md:flex-row relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-mythos-accent/5 via-black to-black opacity-30" />

      {/* ── Sol Panel: Dil Listesi ── */}
      <div className="w-full md:w-72 flex-shrink-0 border-b md:border-b-0 md:border-r border-white/10 bg-black/40 backdrop-blur-md z-10 flex flex-col">
        <div className="p-6 border-b border-white/5 flex flex-col gap-4">
          <div>
            <h2 className="font-serif text-xl tracking-[0.2em] text-[#E8D48B] uppercase flex items-center gap-2">
              <Languages size={18} /> Diller
            </h2>
            <p className="text-[0.6rem] text-white/40 tracking-wider mt-1 uppercase font-serif">Elfçe, Kademli ve Ötesi</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full group inline-flex justify-center items-center gap-2 px-4 py-2 rounded-sm border border-mythos-accent/30 bg-mythos-accent/5 text-[#E8D48B] text-[0.6rem] uppercase tracking-[0.25em] font-serif hover:bg-mythos-accent/15 hover:border-mythos-accent/50 transition-all cursor-pointer"
          >
            <Plus size={14} className="group-hover:rotate-90 transition-transform duration-300" />
            Yeni Dil Ekle
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-col gap-1">
          {languages.length === 0 && (
            <div className="text-center p-6 text-white/20 text-[0.65rem] font-serif uppercase tracking-widest border border-dashed border-white/10 rounded-lg mt-2">
              Henüz dil eklenmedi
            </div>
          )}
          {languages.map((lang) => {
            const isActive = (activeLanguage?.id === lang.id);
            return (
              <button
                key={lang.id}
                onClick={() => { setActiveLanguageId(lang.id); setActiveTab('glyphs'); }}
                className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between gap-2 group ${
                  isActive
                    ? 'bg-white/[0.06] border-mythos-accent/40 text-[#E8D48B]'
                    : 'border-transparent bg-transparent hover:bg-white/[0.03] text-white/60 hover:text-white/90'
                }`}
              >
                <div>
                  <div className="font-serif text-[0.7rem] tracking-wider">{lang.name}</div>
                  <div className="text-[0.55rem] font-serif text-white/30 mt-0.5 uppercase tracking-widest">{lang.family}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteLanguage(lang.id); }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400/50 hover:text-red-400 cursor-pointer p-1"
                  >
                    <Trash2 size={12} />
                  </button>
                  {isActive && <ChevronRight size={14} className="text-mythos-accent shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Sağ Panel: Dil Detayları ── */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {!activeLanguage ? (
          <div className="flex-1 flex items-center justify-center text-white/20 flex-col gap-4">
            <Languages size={48} className="opacity-20" />
            <p className="font-serif text-sm tracking-widest uppercase">Bir dil seçin veya yeni bir dil ekleyin</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex-shrink-0 px-8 pt-8 pb-0 z-10">
              <motion.div
                key={activeLanguage.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <h3 className="font-serif text-3xl tracking-[0.2em] text-[#E8D48B] uppercase drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                  {activeLanguage.name}
                </h3>
                <div className="flex items-center gap-4 mt-2 text-[0.6rem] font-serif text-white/40 uppercase tracking-widest">
                  <span>{activeLanguage.family}</span>
                  {activeLanguage.writingDirection && (
                    <><span className="text-white/10">·</span><span>{activeLanguage.writingDirection}</span></>
                  )}
                </div>
              </motion.div>

              {/* Sekmeler */}
              <div className="flex gap-0 border-b border-white/10 overflow-x-auto">
                {TABS.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-5 py-2.5 font-serif text-[0.55rem] tracking-[0.15em] uppercase transition-all whitespace-nowrap border-b-2 ${
                      activeTab === tab.key
                        ? 'text-[#E8D48B] border-mythos-accent drop-shadow-[0_0_8px_rgba(212,175,55,0.3)]'
                        : 'text-white/40 border-transparent hover:text-white/70'
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab İçeriği */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeLanguage.id}-${activeTab}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >

                  {/* ── GLYPHS TAB ── */}
                  {activeTab === 'glyphs' && (
                    <div>
                      {activeLanguage.glyphs.length === 0 ? (
                        <EmptyState label="Henüz glyph eklenmedi" />
                      ) : (
                        <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-3">
                          {activeLanguage.glyphs.map((g, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.02 }}
                              className="flex flex-col items-center gap-1 p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:border-mythos-accent/30 hover:bg-white/[0.04] transition-all group cursor-default"
                            >
                              <span className="font-serif text-2xl text-[#E8D48B] drop-shadow-[0_0_8px_rgba(212,175,55,0.3)]">
                                {g.char}
                              </span>
                              <span className="text-[0.5rem] text-white/30 font-serif uppercase tracking-wider">
                                {g.label}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── PHRASES TAB ── */}
                  {activeTab === 'phrases' && (
                    <div className="flex flex-col gap-3">
                      {activeLanguage.phrases.length === 0 ? (
                        <EmptyState label="Henüz sözcük/cümle eklenmedi" />
                      ) : (
                        activeLanguage.phrases.map((p, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="grid grid-cols-3 gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:border-white/10 transition-all"
                          >
                            <div>
                              <div className="text-[0.55rem] text-white/30 uppercase tracking-widest font-serif mb-1">Özgün</div>
                              <div className="font-serif text-[#E8D48B] text-sm tracking-wider">{p.original}</div>
                            </div>
                            <div>
                              <div className="text-[0.55rem] text-white/30 uppercase tracking-widest font-serif mb-1">Transkripsiyon</div>
                              <div className="font-serif italic text-white/70 text-sm">{p.transcription}</div>
                            </div>
                            <div>
                              <div className="text-[0.55rem] text-white/30 uppercase tracking-widest font-serif mb-1">Anlam</div>
                              <div className="font-serif text-white/90 text-sm">{p.meaning}</div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  )}

                  {/* ── PHONETICS TAB ── */}
                  {activeTab === 'phonetics' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {activeLanguage.phonetics.length === 0 ? (
                        <div className="col-span-full"><EmptyState label="Henüz fonetik eşdeğer eklenmedi" /></div>
                      ) : (
                        activeLanguage.phonetics.map((ph, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.02 }}
                            className="rounded-xl border border-white/5 bg-white/[0.02] p-4 flex items-center gap-4 hover:border-mythos-accent/20 transition-all"
                          >
                            <span className="font-serif text-xl text-[#E8D48B]">{ph.source}</span>
                            <div className="text-white/20 text-lg">→</div>
                            <span className="font-serif text-lg text-white/70">{ph.equivalent}</span>
                          </motion.div>
                        ))
                      )}
                    </div>
                  )}

                  {/* ── INFO TAB ── */}
                  {activeTab === 'info' && (
                    <div className="max-w-2xl">
                      <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
                        <p className="font-serif italic text-white/70 leading-relaxed tracking-wide text-sm">
                          {activeLanguage.info || 'Bu dil hakkında henüz herhangi bir bilgi eklenmedi.'}
                        </p>
                      </div>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      <AddLanguageModal isOpen={isModalOpen} onClose={handleModalClose} />
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="text-center p-12 text-white/20 text-[0.65rem] font-serif uppercase tracking-widest border border-dashed border-white/10 rounded-xl">
      {label}
    </div>
  );
}
