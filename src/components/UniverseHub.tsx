import { useState } from 'react';
import type { FormEvent } from 'react';

type UniverseHubProps = {
  onEnterExisting: () => void;
  onCreateUniverse?: (data: { name: string; summary: string; tone: string }) => void;
};

export function UniverseHub({ onEnterExisting, onCreateUniverse }: UniverseHubProps) {
  const [name, setName] = useState('');
  const [summary, setSummary] = useState('');
  const [tone, setTone] = useState('epik');
  const [createdMessage, setCreatedMessage] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setCreatedMessage('Önce evrenine bir isim ver.');
      return;
    }

    const data = { name: name.trim(), summary: summary.trim(), tone };
    onCreateUniverse?.(data);
    setCreatedMessage(`"${data.name}" için bir evren taslağı hazırlandı (şimdilik sadece bu panelde).`);
  };

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center px-6">
      <div className="max-w-6xl w-full grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)] items-stretch">
        <div className="glass-panel rounded-2xl p-8 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <h1 className="text-2xl md:text-3xl font-serif text-white/90">
              Mythos Antigravity Paneline Hoş Geldin
            </h1>
            <p className="text-sm md:text-base text-white/60">
              Buradan hazır <span className="text-mythos-accent">MYTHOS</span> evrenine girebilir
              ya da kendi evrenini tasarlamaya başlayabilirsin.
            </p>
          </div>

          <button
            type="button"
            onClick={onEnterExisting}
            className="inline-flex items-center justify-center rounded-full border border-mythos-accent/60 bg-mythos-accent/10 px-6 py-3 text-sm font-semibold tracking-[0.25em] uppercase text-white hover:bg-mythos-accent/30 transition-colors"
          >
            Mevcut MYTHOS Evrenine Gir
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="glass-panel rounded-2xl p-8 flex flex-col gap-4"
        >
          <div>
            <h2 className="text-lg md:text-xl font-serif text-white/90 mb-1">
              Yeni Bir Evren Oluştur
            </h2>
            <p className="text-xs md:text-sm text-white/50">
              Bu form şimdilik fikir panosu gibi çalışıyor; daha sonra bu bilgileri gerçek veri yapısına bağlayacağız.
            </p>
          </div>

          <label className="space-y-1 text-xs md:text-sm text-white/70">
            <span>Evren adı</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn. Gölge Halkının Krallığı"
              className="w-full rounded-md bg-black/30 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-mythos-accent/70 focus:ring-1 focus:ring-mythos-accent/70"
            />
          </label>

          <label className="space-y-1 text-xs md:text-sm text-white/70">
            <span>Kısa özet</span>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Bu evrenin temel fikrini 1-2 cümleyle not al."
              rows={4}
              className="w-full rounded-md bg-black/30 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-mythos-accent/70 focus:ring-1 focus:ring-mythos-accent/70 resize-none"
            />
          </label>

          <label className="space-y-1 text-xs md:text-sm text-white/70">
            <span>Genel ton</span>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full rounded-md bg-black/30 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-mythos-accent/70 focus:ring-1 focus:ring-mythos-accent/70"
            >
              <option value="epik">Epik / Destansı</option>
              <option value="karanlik">Karanlık Fantezi</option>
              <option value="bilimkurgu">Bilimkurgu / Kozmik</option>
              <option value="masalsi">Masalsı / Hafif</option>
            </select>
          </label>

          <div className="mt-2 flex items-center justify-between gap-4">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-mythos-accent/80 px-4 py-2 text-xs md:text-sm font-semibold tracking-[0.22em] uppercase text-black hover:bg-mythos-accent transition-colors"
            >
              Evren Taslağını Kaydet
            </button>
            {createdMessage && (
              <p className="text-[11px] md:text-xs text-mythos-accent/80 max-w-[60%]">
                {createdMessage}
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}

