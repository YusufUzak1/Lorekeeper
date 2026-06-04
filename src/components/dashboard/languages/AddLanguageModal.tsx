import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Languages, Trash2 } from 'lucide-react';
import { useUniverseStore } from '@/store/useUniverseStore';
import type { LanguageGlyph, LanguagePhrase, LanguagePhonetic } from '@/types';

interface AddLanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddLanguageModal({ isOpen, onClose }: AddLanguageModalProps) {
  const { addLanguage } = useUniverseStore();

  const [name, setName] = useState('');
  const [family, setFamily] = useState('');
  const [writingDirection, setWritingDirection] = useState('Soldan Sağa');
  const [info, setInfo] = useState('');

  // Glyph state
  const [glyphs, setGlyphs] = useState<LanguageGlyph[]>([]);
  const [glyphChar, setGlyphChar] = useState('');
  const [glyphLabel, setGlyphLabel] = useState('');

  // Phrase state
  const [phrases, setPhrases] = useState<LanguagePhrase[]>([]);
  const [phraseOrig, setPhraseOrig] = useState('');
  const [phraseTrans, setPhraseTrans] = useState('');
  const [phraseMeaning, setPhraseMeaning] = useState('');

  // Phonetic state
  const [phonetics, setPhonetics] = useState<LanguagePhonetic[]>([]);
  const [phonSrc, setPhonSrc] = useState('');
  const [phonEq, setPhonEq] = useState('');

  const reset = () => {
    setName(''); setFamily(''); setWritingDirection('Soldan Sağa'); setInfo('');
    setGlyphs([]); setGlyphChar(''); setGlyphLabel('');
    setPhrases([]); setPhraseOrig(''); setPhraseTrans(''); setPhraseMeaning('');
    setPhonetics([]); setPhonSrc(''); setPhonEq('');
  };

  const handleClose = () => { onClose(); setTimeout(reset, 300); };

  const addGlyph = () => {
    if (!glyphChar.trim()) return;
    setGlyphs(prev => [...prev, { char: glyphChar.trim(), label: glyphLabel.trim() }]);
    setGlyphChar(''); setGlyphLabel('');
  };

  const addPhrase = () => {
    if (!phraseOrig.trim()) return;
    setPhrases(prev => [...prev, { original: phraseOrig.trim(), transcription: phraseTrans.trim(), meaning: phraseMeaning.trim() }]);
    setPhraseOrig(''); setPhraseTrans(''); setPhraseMeaning('');
  };

  const addPhonetic = () => {
    if (!phonSrc.trim()) return;
    setPhonetics(prev => [...prev, { source: phonSrc.trim(), equivalent: phonEq.trim() }]);
    setPhonSrc(''); setPhonEq('');
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    addLanguage({ name: name.trim(), family: family.trim(), writingDirection, info: info.trim(), glyphs, phrases, phonetics });
    handleClose();
  };

  const inputCls = "w-full rounded-lg bg-white/[0.03] border border-white/10 px-4 py-2.5 text-sm text-white/90 outline-none focus:border-mythos-accent/50 focus:ring-1 focus:ring-mythos-accent/30 transition-all font-serif";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm pointer-events-auto"
            onClick={handleClose}
          />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0e0e10]/95 backdrop-blur-xl shadow-2xl p-6 md:p-8 pointer-events-auto overflow-y-auto max-h-[90vh] custom-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-32 bg-mythos-accent/10 rounded-full blur-[60px] pointer-events-none" />

              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-serif text-lg tracking-[0.1em] text-[#E8D48B] uppercase flex items-center gap-2">
                    <Languages size={18} /> Yeni Dil Oluştur
                  </h2>
                  <p className="text-[0.65rem] text-white/40 tracking-wider mt-1">Evreninizin sesini ve yazısını yaratın.</p>
                </div>
                <button type="button" onClick={handleClose} className="p-1.5 rounded-lg text-white/30 hover:text-white/80 hover:bg-white/5 transition-all cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-8">

                {/* ── 1. Temel Bilgiler ── */}
                <Section title="Temel Bilgiler">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex flex-col gap-2 flex-1">
                      <label className={labelCls}>Dil Adı *</label>
                      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Örn: Quenya" className={inputCls} />
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                      <label className={labelCls}>Dil Ailesi</label>
                      <input type="text" value={family} onChange={e => setFamily(e.target.value)} placeholder="Örn: Elvish" className={inputCls} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className={labelCls}>Yazı Yönü</label>
                    <div className="flex gap-2">
                      {['Soldan Sağa', 'Sağdan Sola', 'Yukarıdan Aşağıya'].map(dir => (
                        <button key={dir} type="button" onClick={() => setWritingDirection(dir)}
                          className={`flex-1 py-2 px-3 rounded-lg text-[0.6rem] uppercase tracking-wider font-serif border transition-all cursor-pointer ${
                            writingDirection === dir ? 'bg-white/10 border-white/30 text-white' : 'bg-transparent border-white/5 text-white/40 hover:border-white/20 hover:text-white/70'
                          }`}
                        >
                          {dir}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className={labelCls}>Dil Bilgisi / Lore</label>
                    <textarea value={info} onChange={e => setInfo(e.target.value)} placeholder="Bu dilin kökeni, tarihi, özellikleri..." rows={3}
                      className={`${inputCls} resize-none italic leading-relaxed`}
                    />
                  </div>
                </Section>

                {/* ── 2. Glifler ── */}
                <Section title={`Alfabe & Glifler (${glyphs.length})`}>
                  <div className="flex gap-2 items-end">
                    <div className="flex flex-col gap-1.5 w-24">
                      <label className={labelCls}>Karakter</label>
                      <input type="text" value={glyphChar} onChange={e => setGlyphChar(e.target.value)} placeholder="ᚠ" maxLength={4}
                        className={`${inputCls} text-center text-lg text-[#E8D48B]`}
                        onKeyDown={e => { if (e.key === 'Enter') addGlyph(); }}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1">
                      <label className={labelCls}>Etiket (opsiyonel)</label>
                      <input type="text" value={glyphLabel} onChange={e => setGlyphLabel(e.target.value)} placeholder="Örn: 'a' sesi"
                        className={inputCls}
                        onKeyDown={e => { if (e.key === 'Enter') addGlyph(); }}
                      />
                    </div>
                    <button onClick={addGlyph} className="h-[42px] px-4 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/30 hover:bg-white/10 transition-all cursor-pointer text-[0.7rem] font-serif whitespace-nowrap">
                      + Ekle
                    </button>
                  </div>
                  {glyphs.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {glyphs.map((g, i) => (
                        <div key={i} className="flex items-center gap-1.5 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 group">
                          <span className="font-serif text-lg text-[#E8D48B]">{g.char}</span>
                          {g.label && <span className="text-[0.55rem] text-white/40 font-serif">{g.label}</span>}
                          <button onClick={() => setGlyphs(prev => prev.filter((_, idx) => idx !== i))} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400/60 hover:text-red-400 cursor-pointer ml-1"><Trash2 size={10} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </Section>

                {/* ── 3. Sözcükler & Cümleler ── */}
                <Section title={`Sözlük & Cümleler (${phrases.length})`}>
                  <div className="flex flex-col md:flex-row gap-2 items-end">
                    <div className="flex flex-col gap-1.5 flex-1">
                      <label className={labelCls}>Özgün</label>
                      <input type="text" value={phraseOrig} onChange={e => setPhraseOrig(e.target.value)} placeholder="Namárië" className={`${inputCls} text-[#E8D48B]`} />
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1">
                      <label className={labelCls}>Transkripsiyon</label>
                      <input type="text" value={phraseTrans} onChange={e => setPhraseTrans(e.target.value)} placeholder="Na-maa-ree-eh" className={inputCls} />
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1">
                      <label className={labelCls}>Anlam</label>
                      <input type="text" value={phraseMeaning} onChange={e => setPhraseMeaning(e.target.value)} placeholder="Elveda / Hoşça kal" className={inputCls} />
                    </div>
                    <button onClick={addPhrase} className="h-[42px] px-4 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/30 hover:bg-white/10 transition-all cursor-pointer text-[0.7rem] font-serif whitespace-nowrap">
                      + Ekle
                    </button>
                  </div>
                  {phrases.length > 0 && (
                    <div className="flex flex-col gap-2 mt-2">
                      {phrases.map((p, i) => (
                        <div key={i} className="flex items-center justify-between gap-3 bg-white/[0.02] border border-white/5 rounded-lg px-4 py-2 text-[0.65rem] font-serif group">
                          <span className="text-[#E8D48B] w-1/3 truncate">{p.original}</span>
                          <span className="text-white/50 italic flex-1 truncate">{p.transcription}</span>
                          <span className="text-white/80 flex-1 truncate">{p.meaning}</span>
                          <button onClick={() => setPhrases(prev => prev.filter((_, idx) => idx !== i))} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400/60 hover:text-red-400 cursor-pointer shrink-0"><Trash2 size={12} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </Section>

                {/* ── 4. Fonetikler ── */}
                <Section title={`Fonetik Eşdeğerler (${phonetics.length})`}>
                  <div className="flex gap-2 items-end">
                    <div className="flex flex-col gap-1.5 w-1/3">
                      <label className={labelCls}>Kaynak Ses</label>
                      <input type="text" value={phonSrc} onChange={e => setPhonSrc(e.target.value)} placeholder="th" className={`${inputCls} text-[#E8D48B] text-center`} />
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1">
                      <label className={labelCls}>Türkçe/Fonetik Karşılığı</label>
                      <input type="text" value={phonEq} onChange={e => setPhonEq(e.target.value)} placeholder="d / t arası " className={inputCls} />
                    </div>
                    <button onClick={addPhonetic} className="h-[42px] px-4 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/30 hover:bg-white/10 transition-all cursor-pointer text-[0.7rem] font-serif whitespace-nowrap">
                      + Ekle
                    </button>
                  </div>
                  {phonetics.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {phonetics.map((ph, i) => (
                        <div key={i} className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 group">
                          <span className="font-serif text-[#E8D48B]">{ph.source}</span>
                          <span className="text-white/20">→</span>
                          <span className="font-serif text-white/70">{ph.equivalent}</span>
                          <button onClick={() => setPhonetics(prev => prev.filter((_, idx) => idx !== i))} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400/60 hover:text-red-400 cursor-pointer ml-1"><Trash2 size={10} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </Section>

                {/* ── Submit ── */}
                <button
                  onClick={handleSubmit}
                  disabled={!name.trim()}
                  className="w-full py-3.5 rounded-lg bg-gradient-to-r from-mythos-accent/90 to-mythos-accent/60 text-black font-semibold text-xs tracking-[0.2em] uppercase transition-all hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus size={14} /> Dili Kaydet
                </button>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

const labelCls = "text-[0.6rem] uppercase tracking-widest text-white/40 font-serif";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="font-serif text-[0.6rem] uppercase tracking-[0.2em] text-white/50">{title}</span>
        <div className="flex-1 h-[1px] bg-white/5" />
      </div>
      {children}
    </div>
  );
}
