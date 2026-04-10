import { useMemo } from 'react';
import { TextMorph } from './ui/TextMorph';
import { motion } from 'framer-motion';
import { Particles } from './ui/Particles';

/* ─────────────────────────────────────────────
 * Her sayfa açılışında rastgele seçilen alıntılar.
 * Her biri bir Türkçe söz + fantastik dilde çevirisi.
 * ───────────────────────────────────────────── */
const HERO_QUOTES: {
  text: string;
  glyphs: string;
  hints: string[];
  lang: string;
}[] = [
  {
    text: 'Büyük hikayeler, sağlam temeller üzerine kurulur.',
    glyphs: 'ᛒᛦᚢᚢᚴ ᚻᛁᚴᚨᛃᛖᛚᛖᚱ ᛋᚨᚷᛚᚨᛗ ᛏᛖᛗᛖᛚᛚᛖᚱ ᚢᛉᛖᚱᛁᚾᛖ ᚴᚢᚱᚢᛚᚢᚱ',
    hints: [
      'İlk kıvılcımlar, hikâyenin başlangıç notası',
      'Yazgıyı hafızasında tutan eski gözcüler',
      'Sözcüklerin ötesinde yankılanan gizli anlatı',
      'Temelleri taşıyan görünmez mimarlar',
      'Zamanın dışındaki olası evrenlerin izi',
      'Bütün bu hikâyeyi bir arada tutan yapı taşı',
    ],
    lang: 'Elder Futhark Runik',
  },
  {
    text: 'Karanlığın içinde bile, yıldızlar yolunu aydınlatır.',
    glyphs: '𐌺𐌰𐍂𐌰𐌽𐌻𐌹𐌲𐌹𐌽 𐌹𐍃𐌹𐌽𐌳𐌴 𐌱𐌹𐌻𐌴 𐌾𐌹𐌻𐌳𐌹𐌶𐌻𐌰𐍂 𐌾𐍉𐌻𐌿𐌽𐌿 𐌰𐌾𐌳𐌹𐌽𐌻𐌰𐍄𐌹𐍂',
    hints: [
      'Gece en koyulaştığında başlayan arayış',
      'Görünmeyeni hisseden içsel pusula',
      'Umutsuzluğun tam ortasındaki cesaret kıvılcımı',
      'Gökyüzünün ölümsüz fısıltıları',
      'Kaybolmuş yolcunun bulduğu izler',
      'Sonsuz ışığın vaadi',
    ],
    lang: 'Gotik Yazı — Valyriaca',
  },
  {
    text: 'Her evren, tek bir kelimenin fısıltısıyla başlar.',
    glyphs: 'ᚺᛖᚱ ᛖᚡᚱᛖᚾ ᛏᛖᚴ ᛒᛁᚱ ᚴᛖᛚᛁᛗᛖᚾᛁᚾ ᚠᛁᛋᛁᛚᛏᛁᛋᛁᛃᛚᚨ ᛒᚨᛋᛚᚨᚱ',
    hints: [
      'Yaratılışın ilk nefesi',
      'Sonsuz olasılıkların merkezi',
      'Mümkün olanın kıyısındaki an',
      'Bir ve bölünmez olan söz',
      'Sessizliğin kırıldığı ilk titreşim',
      'Varoluşun müziğinin ilk notası',
      'Gizli başlangıçların kapısı',
    ],
    lang: 'Younger Futhark',
  },
  {
    text: 'Yazgı, yıldızlarda yazılır; kahramanlar onu okur.',
    glyphs: '𐍅𐌰𐌶𐌲𐌹 𐌾𐌹𐌻𐌳𐌹𐌶𐌻𐌰𐍂𐌳𐌰 𐍅𐌰𐌶𐌹𐌻𐌹𐍂 𐌺𐌰𐌷𐍂𐌰𐌼𐌰𐌽𐌻𐌰𐍂 𐍉𐌽𐌿 𐍉𐌺𐌿𐍂',
    hints: [
      'Değişmez kader haritası',
      'Gökcisimlerinin taşıdığı kadim mesajlar',
      'Kozmik mürekkeple yazılmış kutsal satırlar',
      'Cesareti göğe bakan gözlerde arayan ruhlar',
      'Kaderi yeniden yorumlayan irade',
      'Okumasını bilene açılan sonsuz bilgelik',
    ],
    lang: 'Gotik Yazı — Khuzdul',
  },
  {
    text: 'Unutulan efsaneler, en derin köklere sahiptir.',
    glyphs: 'ᚢᚾᚢᛏᚢᛚᚨᚾ ᛖᚠᛋᚨᚾᛖᛚᛖᚱ ᛖᚾ ᛞᛖᚱᛁᚾ ᚴᛟᚴᛚᛖᚱᛖ ᛋᚨᚻᛁᛈᛏᛁᚱ',
    hints: [
      'Zamanın sisiyle örtülmüş anlatılar',
      'Gerçeküstü yaratıkların gizli mirası',
      'Kökü en derine inen meşe en uzun yaşar',
      'Toprak altında bekleyen kadim kuvvet',
      'Unutuşun ötesinde saklanan hakikat',
      'Dünyanın temellerini saran yaşam damarları',
    ],
    lang: 'Anglo-Sakson Runik',
  },
  {
    text: 'Zaman bir nehirdir; hikayeler onun dalgalarıdır.',
    glyphs: '𐌶𐌰𐌼𐌰𐌽 𐌱𐌹𐍂 𐌽𐌴𐌷𐌹𐍂𐌳𐌹𐍂 𐌷𐌹𐌺𐌰𐍅𐌴𐌻𐌴𐍂 𐍉𐌽𐌿𐌽 𐌳𐌰𐌻𐌲𐌰𐌻𐌰𐍂𐌹𐌳𐌹𐍂',
    hints: [
      'Akışı durdurulamayan kozmik güç',
      'Her şeyin kaynağı ve varış noktası',
      'Sonsuz bir döngünün parçası',
      'Sözcüklerle şekillenen olaylar',
      'Geçmişi ve geleceği birleştiren akıntı',
      'Hafızanın taşıdığı yankılar',
    ],
    lang: 'Gotik Yazı — Adûnaic',
  },
  {
    text: 'Her kapanan kapı, bin yeni yolun başlangıcıdır.',
    glyphs: 'ᚺᛖᚱ ᚴᚨᛈᚨᚾᚨᚾ ᚴᚨᛈᛁ ᛒᛁᚾ ᛃᛖᚾᛁ ᛃᛟᛚᚢᚾ ᛒᚨᛋᛚᚨᚾᚷᛁᛋᛁᛞᛁᚱ',
    hints: [
      'Sonun aslında bir başlangıç oluşu',
      'Kilitli gibi görünen ama açık olan geçitler',
      'Dallanıp budaklanan kader ağacı',
      'Keşfedilmeyi bekleyen sayısız patika',
      'Cesaretle atılan ilk adım',
      'Her kayıp bir kazanımın habercisi',
      'Sonsuz çatallanmalar evreni',
    ],
    lang: 'Elder Futhark Runik',
  },
  {
    text: 'Gölgeler dans eder; ışık, onların hikayesini yazar.',
    glyphs: '𐌲𐍉𐌻𐌲𐌴𐌻𐌴𐍂 𐌳𐌰𐌽𐍃 𐌴𐌳𐌴𐍂 𐌹𐍃𐌹𐌺 𐍉𐌽𐌻𐌰𐍂𐌹𐌽 𐌷𐌹𐌺𐌰𐍅𐌴𐍃𐌹𐌽𐌹 𐍅𐌰𐌶𐌰𐍂',
    hints: [
      'Karanlığın içindeki ritimsel hareket',
      'Zıtlıkların birbirine olan bağımlılığı',
      'Görünmeyeni görünür yapan güç',
      'Karanlık ve aydınlığın dansı',
      'Eski masalların yeni anlatımları',
      'Evrenin mürekkepli kalemi',
    ],
    lang: 'Gotik Yazı — Tengwar transliterasyonu',
  },
];

function pickRandom() {
  return HERO_QUOTES[Math.floor(Math.random() * HERO_QUOTES.length)];
}

type HeroSectionProps = {
  onEnterUniverse?: () => void;
  onLogin?: () => void;
  onRegister?: () => void;
};

export function HeroSection({ onEnterUniverse, onLogin, onRegister }: HeroSectionProps) {
  // Her sayfa açılışında tek seferlik rastgele seçim
  const quote = useMemo(() => pickRandom(), []);

  return (
    <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background elements to simulate digital ruins and space depth */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full bg-mythos-accent filter blur-[120px] opacity-10 mix-blend-screen" />
      </div>
      
      {/* 3D placeholder grid / floating ruins vibe */}
      <div 
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          transform: 'perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px)',
          transformOrigin: 'top center'
        }}
      />

      {/* Fire ashes particles effect */}
      <Particles className="absolute inset-0 z-[5] opacity-80" />

      <div className="z-10 w-full max-w-4xl px-6 flex flex-col items-center justify-center gap-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="glass-panel px-8 py-12 rounded-2xl w-full flex flex-col items-center justify-center min-h-[300px] gap-4"
        >
          <TextMorph 
            initialText={quote.text}
            morphText={quote.glyphs}
            wordHints={quote.hints}
            className="text-2xl md:text-4xl lg:text-5xl font-serif text-white/90 leading-tight"
            delay={4000}
          />
          {/* Hangi fantastik dile dönüştüğünü gösteren küçük etiket */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 5.2 }}
            className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-mythos-accent/40 font-sans"
          >
            — {quote.lang} —
          </motion.span>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 5.5 }}
          className="flex items-center gap-3"
        >
          <button
            className="rounded-full border border-mythos-accent/50 bg-mythos-accent/10 px-5 py-2 text-xs font-sans tracking-[0.22em] uppercase text-white hover:bg-mythos-accent/25 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-mythos-accent/80 focus-visible:ring-offset-2 focus-visible:ring-offset-mythos-bg"
            onClick={onLogin}
            type="button"
          >
            Giris Yap
          </button>
          <button
            className="rounded-full border border-white/20 bg-white/5 px-5 py-2 text-xs font-sans tracking-[0.22em] uppercase text-white/90 hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-mythos-bg"
            onClick={onRegister}
            type="button"
          >
            Kayit Ol
          </button>
          <button
            className="text-xs font-sans text-white/45 tracking-[0.22em] uppercase cursor-pointer hover:text-mythos-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-mythos-accent/80 focus-visible:ring-offset-2 focus-visible:ring-offset-mythos-bg"
            onClick={onEnterUniverse}
            type="button"
          >
            Misafir Girisi
          </button>
        </motion.div>
      </div>
    </section>
  );
}
