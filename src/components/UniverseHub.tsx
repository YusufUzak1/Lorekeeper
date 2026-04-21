import { useState } from 'react';
import type { FormEvent } from 'react';
import { useUniverseStore, SEED_UNIVERSE_ID } from '@/store/useUniverseStore';
import { fetchStateFromCloud, syncStateToCloud } from '@/services/syncService';
import { Loader2, CloudDownload, CloudUpload } from 'lucide-react';
import { Sparkles, BookOpen, Plus } from 'lucide-react';

type UniverseHubProps = {
  onEnterExisting: (universeId: string) => void;
  onCreateUniverse?: () => void;
};

export function UniverseHub({ onEnterExisting, onCreateUniverse }: UniverseHubProps) {
  const { universes, addUniverse, setCurrentUniverseId, loadSeedForUniverse, deleteUniverse, replaceState } = useUniverseStore();
  const [loadingMsg, setLoadingMsg] = useState('');
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
    const newUniverse = addUniverse(data);
    setCurrentUniverseId(newUniverse.id);
    setCreatedMessage(`"${data.name}" evreni oluşturuldu!`);
    setName('');
    setSummary('');
    onCreateUniverse?.();
  };

  const handleLoadSample = () => {
    // Seed evreni daha önce oluşturulduysa, yeniden yükleme
    const existingSeed = universes.find((u) => u.id === SEED_UNIVERSE_ID);
    if (existingSeed) {
      setCurrentUniverseId(SEED_UNIVERSE_ID);
      onEnterExisting(SEED_UNIVERSE_ID);
      return;
    }

    // Yeni seed evreni oluştur
    const seedUniverse = addUniverse({
      name: 'Orta Dünya — Yüzüklerin Efendisi',
      summary: "J.R.R. Tolkien'in efsanevi evreni. Elfler, cüceler, insanlar ve hobbitler bir arada yaşar.",
      tone: 'epik',
    });

    // Overwrite the ID to use our constant
    useUniverseStore.setState((s) => ({
      universes: s.universes.map((u) =>
        u.id === seedUniverse.id ? { ...u, id: SEED_UNIVERSE_ID } : u
      ),
    }));

    loadSeedForUniverse(SEED_UNIVERSE_ID);
    setCurrentUniverseId(SEED_UNIVERSE_ID);
    onEnterExisting(SEED_UNIVERSE_ID);
  };

  const handleEnterUniverse = (id: string) => {
    setCurrentUniverseId(id);
    onEnterExisting(id);
  };

  const handleDeleteUniverse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Bu evreni kalıcı olarak silmek istediğinizden emin misiniz?')) {
      deleteUniverse(id);
    }
  };

  const handleFetchFromCloud = async () => {
    try {
      setLoadingMsg('Buluttan verileriniz indiriliyor...');
      const cloudState = await fetchStateFromCloud();
      if (cloudState) {
        replaceState(cloudState);
        alert('Verileriniz başarıyla buluttan indirildi!');
      } else {
        alert('Bulutta kayıtlı bir veriniz bulunamadı.');
      }
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoadingMsg('');
    }
  };

  const handleSyncToCloud = async () => {
    try {
      setLoadingMsg('Verileriniz buluta yedekleniyor...');
      const fullState = useUniverseStore.getState();
      await syncStateToCloud(fullState);
      alert('Tüm verileriniz başarıyla buluta yedeklendi!');
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoadingMsg('');
    }
  };

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-6xl w-full flex flex-col gap-8">
      
        {/* Cloud Sync Panel */}
        <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 border border-mythos-accent/20">
          <div>
            <h3 className="text-sm font-serif text-white/90 tracking-widest uppercase">Bulut Senkronizasyonu</h3>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Verilerinizi cihazlar arası eşitleyin</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={handleFetchFromCloud}
              disabled={!!loadingMsg}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-xs uppercase tracking-wider text-white/70 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
            >
              <CloudDownload size={14} />
              Buluttan İndir
            </button>
            <button
              onClick={handleSyncToCloud}
              disabled={!!loadingMsg}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-lg bg-mythos-accent/10 border border-mythos-accent/30 px-4 py-2 text-xs uppercase tracking-wider text-mythos-accent hover:bg-mythos-accent/20 hover:text-mythos-accent/90 transition-colors disabled:opacity-50"
            >
              <CloudUpload size={14} />
              Buluta Yedekle
            </button>
          </div>
        </div>
        
        {loadingMsg && (
          <div className="flex items-center justify-center gap-2 text-mythos-accent text-xs uppercase tracking-widest animate-pulse">
            <Loader2 size={14} className="animate-spin" /> {loadingMsg}
          </div>
        )}

        {/* Mevcut Evrenler Listesi */}
        {universes.length > 0 && (
          <div className="glass-panel rounded-2xl p-8">
            <h2 className="font-serif text-lg md:text-xl text-white/90 mb-1 tracking-[0.1em]">
              Evrenleriniz
            </h2>
            <p className="text-xs text-white/40 mb-5">Bir evrene tıklayarak dünyasına dalın.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {universes.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleEnterUniverse(u.id)}
                  className="group relative glass-panel rounded-xl p-5 text-left border border-white/5 hover:border-mythos-accent/30 transition-all duration-500 cursor-pointer overflow-hidden"
                >
                  {/* Ambient glow */}
                  <div className="absolute -top-8 -right-8 w-32 h-32 bg-mythos-accent/5 rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="relative z-10">
                    <div className="font-serif text-sm tracking-[0.12em] text-white/90 group-hover:text-[#E8D48B] transition-colors mb-1">
                      {u.name}
                    </div>
                    {u.summary && (
                      <p className="text-[0.65rem] text-white/40 leading-relaxed line-clamp-2 mb-3">
                        {u.summary}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-[0.5rem] uppercase tracking-[0.2em] text-mythos-accent/50 bg-mythos-accent/5 px-2 py-0.5 rounded border border-mythos-accent/10">
                        {u.tone}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteUniverse(u.id, e)}
                        className="text-[0.5rem] uppercase tracking-wider text-red-400/40 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Alt Bölüm: Yeni Oluştur + Örnek Veri */}
        <div className="grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)] items-stretch">

          {/* Sol: Örnek Veri ile Başlat */}
          <div className="glass-panel rounded-2xl p-8 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <h1 className="text-2xl md:text-3xl font-serif text-white/90">
                Mythos Antigravity Paneline Hoş Geldin
              </h1>
              <p className="text-sm md:text-base text-white/60">
                Hazır <span className="text-mythos-accent">MYTHOS</span> demo evreniyle keşfe çıkabilir
                ya da kendi evrenini sıfırdan tasarlayabilirsin.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLoadSample}
              className="group inline-flex items-center justify-center gap-3 rounded-full border border-mythos-accent/60 bg-mythos-accent/10 px-6 py-3 text-sm font-semibold tracking-[0.2em] uppercase text-white hover:bg-mythos-accent/30 transition-all duration-300 cursor-pointer"
            >
              <Sparkles size={16} className="text-mythos-accent group-hover:animate-pulse" />
              Örnek Veri ile Başlat
            </button>

            <div className="flex items-center gap-3 text-[0.6rem] text-white/25">
              <BookOpen size={12} />
              <span>Yüzüklerin Efendisi evreni · Karakterler, mitoloji, haritalar ve diller dahil</span>
            </div>
          </div>

          {/* Sağ: Yeni Evren Oluşturma Formu */}
          <form
            onSubmit={handleSubmit}
            className="glass-panel rounded-2xl p-8 flex flex-col gap-4"
          >
            <div>
              <h2 className="text-lg md:text-xl font-serif text-white/90 mb-1 flex items-center gap-2">
                <Plus size={18} className="text-mythos-accent/70" />
                Yeni Bir Evren Oluştur
              </h2>
              <p className="text-xs md:text-sm text-white/50">
                Evrenine bir isim, kısa özet ve ton seç — boş bir tuval olarak açılacak.
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
                className="inline-flex items-center justify-center rounded-md bg-mythos-accent/80 px-4 py-2 text-xs md:text-sm font-semibold tracking-[0.22em] uppercase text-black hover:bg-mythos-accent transition-colors cursor-pointer"
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
      </div>
    </section>
  );
}
