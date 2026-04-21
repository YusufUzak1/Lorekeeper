/* ─────────────────────────────────────────────
 * AddMythModal — Panteon'a yeni efsane ekleme
 * Mythos temasına uygun, animasyonlu modal.
 * ───────────────────────────────────────────── */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { useUniverseStore } from '@/store/useUniverseStore';

// Önceden tanımlanmış renk seçenekleri
const COLOR_OPTIONS = [
  { value: '#f2d2d8', label: 'Gül' },
  { value: '#e85050', label: 'Ateş' },
  { value: '#7ecfff', label: 'Gök' },
  { value: '#e8a0d0', label: 'Mor' },
  { value: '#4db89c', label: 'Zümrüt' },
  { value: '#B8962E', label: 'Altın' },
  { value: '#ff6b35', label: 'Turuncu' },
  { value: '#8888bb', label: 'Leylak' },
  { value: '#9966cc', label: 'Ametist' },
];

// Popüler glyph seçenekleri
const GLYPH_OPTIONS = ['✦', '◬', '⊕', '◉', '⋈', '◫', '᪥', '⊛', '♦', '✧', '⟁', '☽', '⚔', '♕', '⌘', '☀', '⊗', '⊙'];

// Tier (kategori) seçenekleri
const TIER_OPTIONS = [
  'İlk Varlıklar',
  'Tanrılar',
  'Valar',
  'Maiar',
  'Efsanevi Varlıklar',
  'Kahramanlar',
  'Canavarlar',
  'Ruhlar',
  'Özel',
];

interface AddMythModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddMythModal({ isOpen, onClose }: AddMythModalProps) {
  const { addMyth } = useUniverseStore();

  const [name, setName] = useState('');
  const [epithet, setEpithet] = useState('');
  const [tier, setTier] = useState(TIER_OPTIONS[0]);
  const [color, setColor] = useState(COLOR_OPTIONS[0].value);
  const [glyph, setGlyph] = useState(GLYPH_OPTIONS[0]);
  const [description, setDescription] = useState('');
  const [domainsInput, setDomainsInput] = useState('');

  const resetForm = () => {
    setName('');
    setEpithet('');
    setTier(TIER_OPTIONS[0]);
    setColor(COLOR_OPTIONS[0].value);
    setGlyph(GLYPH_OPTIONS[0]);
    setDescription('');
    setDomainsInput('');
  };

  const handleSubmit = () => {
    if (!name.trim()) return;

    const domains = domainsInput
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean);

    addMyth({
      tier,
      glyph,
      name: name.trim().toUpperCase(),
      epithet: epithet.trim() || 'Bilinmeyen',
      color,
      description: description.trim(),
      domains,
    });

    resetForm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
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

              {/* Header */}
              <div className="relative flex items-center justify-between px-8 pt-8 pb-4">
                <div>
                  <h2 className="font-serif text-xl tracking-[0.15em] text-[#E8D48B] uppercase">
                    Yeni Efsane Yarat
                  </h2>
                  <p className="text-[0.65rem] text-white/30 mt-1 tracking-wider">
                    Panteon'a yeni bir tanrı, varlık veya efsane ekleyin.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <div className="px-8 pb-8 flex flex-col gap-5">

                {/* Ad */}
                <label className="flex flex-col gap-1.5">
                  <span className="text-[0.6rem] uppercase tracking-[0.2em] text-white/40 font-serif">
                    Varlık Adı *
                  </span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Örn. MORGOTH"
                    className="w-full rounded-lg bg-white/[0.03] border border-white/10 px-4 py-2.5 text-sm text-white/90 outline-none focus:border-mythos-accent/50 focus:ring-1 focus:ring-mythos-accent/30 transition-all placeholder:text-white/15 tracking-wide"
                  />
                </label>

                {/* Epithet */}
                <label className="flex flex-col gap-1.5">
                  <span className="text-[0.6rem] uppercase tracking-[0.2em] text-white/40 font-serif">
                    Ünvan / Lakap
                  </span>
                  <input
                    value={epithet}
                    onChange={(e) => setEpithet(e.target.value)}
                    placeholder="Örn. Karanlığın Lordu"
                    className="w-full rounded-lg bg-white/[0.03] border border-white/10 px-4 py-2.5 text-sm text-white/90 outline-none focus:border-mythos-accent/50 focus:ring-1 focus:ring-mythos-accent/30 transition-all placeholder:text-white/15"
                  />
                </label>

                {/* Tier + Glyph Row */}
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[0.6rem] uppercase tracking-[0.2em] text-white/40 font-serif">
                      Sınıf / Kategori
                    </span>
                    <select
                      value={tier}
                      onChange={(e) => setTier(e.target.value)}
                      className="w-full rounded-lg bg-white/[0.03] border border-white/10 px-4 py-2.5 text-sm text-white/90 outline-none focus:border-mythos-accent/50 transition-all"
                    >
                      {TIER_OPTIONS.map((t) => (
                        <option key={t} value={t} className="bg-[#0e0e10] text-white">
                          {t}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[0.6rem] uppercase tracking-[0.2em] text-white/40 font-serif">
                      Sembol (Glyph)
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {GLYPH_OPTIONS.map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGlyph(g)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all cursor-pointer border ${
                            glyph === g
                              ? 'border-mythos-accent/60 bg-mythos-accent/15 text-[#E8D48B] shadow-[0_0_10px_rgba(212,175,55,0.2)]'
                              : 'border-white/5 bg-white/[0.02] text-white/40 hover:bg-white/[0.05] hover:text-white/70'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Renk Seçimi */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[0.6rem] uppercase tracking-[0.2em] text-white/40 font-serif">
                    Renk
                  </span>
                  <div className="flex gap-2">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setColor(c.value)}
                        title={c.label}
                        className={`w-8 h-8 rounded-full transition-all cursor-pointer border-2 ${
                          color === c.value
                            ? 'border-white/80 scale-110 shadow-[0_0_12px_rgba(255,255,255,0.2)]'
                            : 'border-transparent hover:border-white/20 hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.value }}
                      />
                    ))}
                  </div>
                </div>

                {/* Açıklama */}
                <label className="flex flex-col gap-1.5">
                  <span className="text-[0.6rem] uppercase tracking-[0.2em] text-white/40 font-serif">
                    Açıklama
                  </span>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Kısa bir geçmiş veya hikaye..."
                    rows={3}
                    className="w-full rounded-lg bg-white/[0.03] border border-white/10 px-4 py-2.5 text-sm text-white/90 outline-none focus:border-mythos-accent/50 focus:ring-1 focus:ring-mythos-accent/30 transition-all placeholder:text-white/15 resize-none"
                  />
                </label>

                {/* Domains */}
                <label className="flex flex-col gap-1.5">
                  <span className="text-[0.6rem] uppercase tracking-[0.2em] text-white/40 font-serif">
                    Etki Alanları (virgülle ayırın)
                  </span>
                  <input
                    value={domainsInput}
                    onChange={(e) => setDomainsInput(e.target.value)}
                    placeholder="Örn. Ateş, Yıkım, Korku"
                    className="w-full rounded-lg bg-white/[0.03] border border-white/10 px-4 py-2.5 text-sm text-white/90 outline-none focus:border-mythos-accent/50 focus:ring-1 focus:ring-mythos-accent/30 transition-all placeholder:text-white/15"
                  />
                  {/* Live preview of domains */}
                  {domainsInput.trim() && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {domainsInput.split(',').filter(d => d.trim()).map((d, i) => (
                        <span
                          key={i}
                          className="text-[0.55rem] uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/40"
                        >
                          {d.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </label>

                {/* Preview Card */}
                {name.trim() && (
                  <div className="border border-white/5 rounded-xl p-4 bg-white/[0.01] relative overflow-hidden">
                    <div className="absolute -top-8 -right-8 w-32 h-32 blur-[50px] opacity-15 rounded-full" style={{ backgroundColor: color }} />
                    <div className="text-[0.5rem] uppercase tracking-[0.2em] text-white/25 mb-2 font-serif">Önizleme</div>
                    <div className="flex items-center gap-3 relative z-10">
                      <span className="text-3xl" style={{ color, textShadow: `0 0 10px ${color}80` }}>{glyph}</span>
                      <div>
                        <div className="font-serif text-base tracking-[0.1em] text-white/90">{name.toUpperCase()}</div>
                        <div className="font-serif italic text-[0.7rem] opacity-60" style={{ color }}>{epithet || 'Bilinmeyen'}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 text-xs uppercase tracking-[0.15em] text-white/40 hover:text-white/70 transition-colors rounded-lg border border-white/5 hover:border-white/10 cursor-pointer"
                  >
                    İptal
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!name.trim()}
                    className="group px-6 py-2.5 text-xs uppercase tracking-[0.2em] font-semibold bg-gradient-to-r from-mythos-accent/90 to-mythos-accent/70 text-black rounded-lg hover:from-mythos-accent hover:to-mythos-accent/90 transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                  >
                    <Sparkles size={14} className="group-hover:animate-pulse" />
                    Efsaneyi Yarat
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
