import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Star, Info, X, Utensils, ArrowRight } from 'lucide-react';
import { MenuItem } from '../types';
import { trackView } from '../lib/api';

interface MenuCardProps {
  item: MenuItem;
  key?: string;
}

const ALLERGEN_INFO: Record<string, { label: string; style: string }> = {
  'glüten':     { label: 'Glüten 🌾',        style: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 font-semibold' },
  'süt':        { label: 'Süt Ürünleri 🥛',  style: 'bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400 font-semibold' },
  'kuruyemiş':  { label: 'Kuruyemiş 🥜',     style: 'bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400 font-semibold' },
  'yumurta':    { label: 'Yumurta 🥚',       style: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-600 dark:text-yellow-400 font-semibold' },
  'susam':      { label: 'Susam 🥯',         style: 'bg-yellow-600/10 border-yellow-600/30 text-yellow-700 dark:text-yellow-400 font-semibold' },
  'soya':       { label: 'Soya 🫘',          style: 'bg-stone-500/10 border-stone-500/30 text-stone-600 dark:text-stone-400 font-semibold' },
  'balık':      { label: 'Balık 🐟',         style: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400 font-semibold' },
  'alkol':      { label: 'Alkol İçerir 🍷',   style: 'bg-purple-500/15 border-purple-500/40 text-purple-600 dark:text-purple-400 font-bold uppercase text-[11px] tracking-wider px-2.5' },
  'domuz':      { label: 'Domuz Eti/Bileşeni 🐷', style: 'bg-rose-500/20 border-rose-500/50 text-rose-600 dark:text-rose-400 font-bold uppercase text-[11px] tracking-wider px-2.5 animate-pulse' },
};

const allergenShort = (a: string) => (ALLERGEN_INFO[a]?.label ?? a);

// Helper function to color-code and highlight ingredients containing allergens/alcohol/pork
function getIngredientStyle(ing: string): string {
  const lower = ing.toLowerCase();
  
  // Pork or Alcohol (High regulatory warnings)
  if (lower.includes('domuz') || lower.includes('jambon')) {
    return 'bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400 font-bold ring-1 ring-rose-500/20';
  }
  if (lower.includes('alkol') || lower.includes('şarap') || lower.includes('bira') || lower.includes('likör')) {
    return 'bg-purple-500/15 border-purple-500/40 text-purple-600 dark:text-purple-400 font-bold ring-1 ring-purple-500/20';
  }
  
  // Common allergens matching keywords
  const allergenKeywords = [
    'glüten', 'gluten', 'un', 'buğday', 'lavaş', 'pide', 'ekmek',
    'süt', 'peynir', 'yoğurt', 'tereyağ', 'kaymak', 'krema',
    'fıstık', 'ceviz', 'fındık', 'badem', 'kuruyemiş',
    'yumurta',
    'susam',
    'soya',
    'balık'
  ];
  
  if (allergenKeywords.some(kw => lower.includes(kw))) {
    return 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 font-semibold';
  }
  
  return 'bg-card-2 border-line text-ink-soft';
}

// Optional preferences a guest can verbally request from the waiter.
function buildPreferences(item: MenuItem): { label: string; extra?: string }[] {
  if (!item.customizable) return [];
  const prefs: { label: string; extra?: string }[] = [
    { label: 'Soslu / Sossuz 🍅' },
    { label: 'Soğanlı / Soğansız 🧅' },
  ];
  if (['donerler', 'kebaplar'].includes(item.category)) {
    prefs.push({ label: 'Kaşarlı 🧀', extra: '+30 ₺' });
    prefs.push({ label: 'Bol Etli (Double) 🥩', extra: '+120 ₺' });
  }
  return prefs;
}

export default function MenuCard({ item }: MenuCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isModalImageLoaded, setIsModalImageLoaded] = useState(false);

  const preferences = buildPreferences(item);

  const ImageFallback = ({ big = false }: { big?: boolean }) => (
    <div className="w-full h-full bg-gradient-to-br from-card to-card-2 flex flex-col items-center justify-center relative">
      <div className={`rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center ${big ? 'w-16 h-16' : 'w-14 h-14'}`}>
        <Utensils className={`text-brand ${big ? 'w-7 h-7' : 'w-6 h-6'}`} />
      </div>
      <span className="text-[11px] font-display font-semibold text-ink-soft mt-2.5 tracking-wide">
        Düzce Aspava
      </span>
    </div>
  );

  return (
    <>
      <motion.div
        whileHover={{ y: -2 }}
        onClick={() => { setIsModalOpen(true); trackView(item.id); }}
        className="premium-card group bg-card border border-line rounded-3xl overflow-hidden flex flex-col cursor-pointer shadow-sm"
      >
        {/* Image */}
        <div className="relative h-52 w-full overflow-hidden bg-card-2">
          {item.image && !imageError ? (
            <>
              {!isImageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute inset-0 shimmer-bg opacity-60" />
                  <Utensils className="w-6 h-6 text-brand/25 animate-pulse relative z-10" />
                </div>
              )}
              <img
                src={item.image}
                alt={item.name}
                loading="lazy"
                referrerPolicy="no-referrer"
                onLoad={() => setIsImageLoaded(true)}
                onError={() => setImageError(true)}
                className="relative z-[1] w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </>
          ) : (
            <ImageFallback />
          )}

          {/* Top gradient for badge legibility */}
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/45 to-transparent pointer-events-none" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {item.isPopular && (
              <span className="flex items-center gap-1 bg-gold text-[#1A120D] text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
                <Star className="w-3 h-3 fill-[#1A120D]" />
                En Sevilen
              </span>
            )}
            {item.isSpicy && (
              <span className="flex items-center gap-1 bg-red-600 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-md">
                <Flame className="w-3 h-3 fill-white" />
                Acılı
              </span>
            )}
          </div>

        </div>

        {/* Body */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-lg font-display font-bold text-ink leading-tight">{item.name}</h3>
          <p className="text-sm text-ink-soft leading-relaxed mt-1 line-clamp-2">{item.description}</p>

          {/* İçindekiler — full content */}
          {item.ingredients && item.ingredients.length > 0 && (
            <div className="mt-3">
              <span className="text-[10px] font-semibold text-ink-faint uppercase tracking-wide block mb-1.5">İçindekiler</span>
              <div className="flex flex-wrap gap-1.5">
                {item.ingredients.map((ing, k) => (
                  <span key={k} className={`px-2 py-0.5 rounded-full border transition ${getIngredientStyle(ing)}`}>
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Allergen line */}
          {item.allergens && item.allergens.length > 0 && (
            <div className="mt-2.5">
              <span className="text-[11px] text-ink-faint">
                ⚠️ Alerjen/Uyarı: <span className="text-ink-soft font-medium">{item.allergens.map(allergenShort).join(', ')}</span>
              </span>
            </div>
          )}

          {/* Footer: price + action */}
          <div className="mt-auto pt-3.5 border-t border-line/60 flex items-end justify-between">
            <div className="leading-none">
              <span className="text-[11px] text-ink-faint font-medium mb-0.5 block">Porsiyon Fiyatı</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-display font-bold text-brand">
                  {item.price > 0 ? `${item.price} ₺` : 'İkram'}
                </span>
                {item.calories > 0 && (
                  <span className="text-[12px] text-ink-soft bg-card-2 border border-line px-2 py-0.5 rounded-full font-medium" title="Enerji Değeri">
                    ⚡ {item.calories} kcal
                  </span>
                )}
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-soft group-hover:text-brand group-hover:gap-2.5 transition-all">
              Detayları Gör
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </motion.div>

      {/* Read-only detail modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              className="bg-card border border-line rounded-t-3xl sm:rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative z-10 max-h-[92vh] flex flex-col"
            >
              {/* Hero image */}
              <div className="relative h-44 sm:h-52 shrink-0 bg-card-2">
                {item.image && !imageError ? (
                  <>
                    {!isModalImageLoaded && <div className="absolute inset-0 shimmer-bg opacity-60" />}
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      onLoad={() => setIsModalImageLoaded(true)}
                      onError={() => setImageError(true)}
                      className="relative z-[1] w-full h-full object-cover"
                    />
                  </>
                ) : (
                  <ImageFallback big />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-3 right-3 p-2 bg-black/40 backdrop-blur-md rounded-full text-white/90 hover:text-white transition cursor-pointer"
                  aria-label="Kapat"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3">
                  <h4 className="text-2xl font-display font-bold text-white drop-shadow-md leading-tight">{item.name}</h4>
                  <span className="shrink-0 inline-flex items-baseline bg-brand text-on-brand font-sans font-bold px-3 py-1.5 rounded-full shadow-lg text-base">
                    {item.price > 0 ? `${item.price} ₺` : 'İKRAM'}
                  </span>
                </div>
              </div>

              {/* Scroll content */}
              <div className="p-5 space-y-5 overflow-y-auto">
                {(item.isPopular || item.isSpicy || item.calories) && (
                  <div className="flex flex-wrap gap-1.5">
                    {item.isPopular && (
                      <span className="flex items-center gap-1 bg-gold/15 text-gold border border-gold/30 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                        <Star className="w-3 h-3 fill-current" /> En Sevilen
                      </span>
                    )}
                    {item.isSpicy && (
                      <span className="flex items-center gap-1 bg-red-500/10 text-red-500 border border-red-500/25 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                        <Flame className="w-3 h-3 fill-current" /> Acılı
                      </span>
                    )}
                    {item.calories && item.calories > 0 && (
                      <span className="flex items-center gap-1 bg-brand/10 text-brand border border-brand/25 text-[11px] font-bold px-2.5 py-1 rounded-full">
                        ⚡ {item.calories} kcal (Kalori)
                      </span>
                    )}
                  </div>
                )}

                <p className="text-sm text-ink-soft leading-relaxed">{item.description}</p>

                {/* Ingredients */}
                {item.ingredients && item.ingredients.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-ink-faint uppercase tracking-wider">İçindekiler</span>
                    <div className="flex flex-wrap gap-1.5">
                      {item.ingredients.map((ing, idx) => (
                        <span key={idx} className={`text-[13px] border px-3 py-1 rounded-full transition ${getIngredientStyle(ing)}`}>
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Optional preferences (verbal to waiter) */}
                {preferences.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <span className="text-xs font-semibold text-ink-faint uppercase tracking-wider">Garsona İletebileceğiniz Tercihler</span>
                    <div className="flex flex-wrap gap-1.5">
                      {preferences.map((p, idx) => (
                        <span key={idx} className="text-[13px] text-ink-soft bg-brand/5 border border-brand/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                          {p.label}
                          {p.extra && <span className="text-[11px] font-semibold text-brand">{p.extra}</span>}
                        </span>
                      ))}
                    </div>
                    <p className="text-[12px] text-ink-faint leading-relaxed">
                      Bu tercihleri siparişinizi verirken garsonunuza sözlü olarak belirtebilirsiniz.
                    </p>
                  </div>
                )}

                {/* Allergens */}
                {item.allergens && item.allergens.length > 0 && (
                  <div className="space-y-2 pt-1 border-t border-line">
                    <span className="text-xs font-semibold text-red-500 uppercase tracking-wider flex items-center gap-1.5 pt-3">
                      ⚠️ Alerjen Uyarısı
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {item.allergens.map((a, idx) => {
                        const info = ALLERGEN_INFO[a] ?? { label: a, style: 'bg-card-2 border-line text-ink-soft' };
                        return (
                          <span key={idx} className={`text-[13px] border px-3 py-1 rounded-full font-medium ${info.style}`}>
                            {info.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Free treats reminder */}
                <div className="flex items-start gap-2.5 bg-card-2 border border-line rounded-2xl p-3.5">
                  <Info className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <p className="text-[12.5px] text-ink-soft leading-relaxed">
                    Tüm ana yemeklerin yanında <span className="font-semibold text-ink">5 farklı Ankara usulü ikram</span> (patates, cacık, salata, helva, çay) sınırsız ve ücretsizdir.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
