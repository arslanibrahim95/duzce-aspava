import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, RotateCw, Utensils, Gift, ClipboardCheck, Share2, ChevronLeft } from 'lucide-react';
import { MenuItem } from '../types';

interface LuckyComboProps {
  open: boolean;
  onClose: () => void;
  items: MenuItem[];
}

type Reward = { emoji: string; label: string; discount?: number; lucky?: boolean };

const TREATS: Reward[] = [
  { emoji: '🍟', label: 'Patates Tava İkramı' },
  { emoji: '🥣', label: 'Sarımsaklı Cacık İkramı' },
  { emoji: '🥗', label: 'Mevsim Salata İkramı' },
  { emoji: '🍮', label: 'İrmik Helvası İkramı' },
  { emoji: '☕', label: 'Demleme Çay İkramı' },
];
const SMALL_DISCOUNT: Reward = { emoji: '🎟️', label: '%5 indirim', discount: 5 };
const LUCKY_REWARD: Reward = { emoji: '🍀', label: 'ŞANSLI SAAT · %10 indirim', discount: 10, lucky: true };
const REEL_REWARDS: Reward[] = [...TREATS, SMALL_DISCOUNT, { emoji: '🎟️', label: '%10 indirim', discount: 10 }];
const HYPE = ['Bugünün şanslı ikilisi! 🎉', 'İşte sana özel kombin! 🔥', 'Köşk gibi sofra! 🍽️', 'Şans senden yana! ✨'];

function turkeyHour(): number {
  const hh = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Istanbul', hour: '2-digit', hour12: false }).format(new Date());
  return parseInt(hh, 10) % 24;
}
function isLuckyHour(): boolean {
  const h = turkeyHour();
  return h >= 15 && h < 17; // ikindi — yavaş saatlerde trafik için şanslı saat
}

// Weighted-random: popular-now items favored, everyone has a chance. Optionally exclude the last pick.
function weightedPick(pool: MenuItem[], excludeId?: string): MenuItem | null {
  let p = pool;
  if (excludeId && pool.length > 1) p = pool.filter((it) => it.id !== excludeId);
  if (!p.length) return null;
  const weights = p.map((it) => (it.views || 0) + 1);
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < p.length; i++) { r -= weights[i]; if (r <= 0) return p[i]; }
  return p[p.length - 1];
}
function pickReward(lucky: boolean): Reward {
  if (lucky) return LUCKY_REWARD;
  return Math.random() < 0.18 ? SMALL_DISCOUNT : TREATS[Math.floor(Math.random() * TREATS.length)];
}

function ProductReel({ item, spinning, label }: { item: MenuItem | null; spinning: boolean; label: string }) {
  return (
    <div className="flex-1 min-w-0">
      <span className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider block mb-1.5 text-center">{label}</span>
      <div className="relative h-24 rounded-2xl border border-line bg-card-2 overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.div key={item?.id || 'e'} initial={{ y: spinning ? 26 : 0, opacity: spinning ? 0 : 1 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -26, opacity: 0 }} transition={{ duration: spinning ? 0.08 : 0.3 }} className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-1.5">
            {item?.image ? <img src={item.image} alt="" className={`w-11 h-11 rounded-lg object-cover border border-line ${spinning ? 'blur-[1px]' : ''}`} />
              : <div className="w-11 h-11 rounded-lg bg-card border border-line flex items-center justify-center text-brand"><Utensils className="w-5 h-5" /></div>}
            <span className="text-[11px] font-semibold text-ink text-center leading-tight line-clamp-1 w-full">{item?.name || '—'}</span>
            {!spinning && item && item.price > 0 && <span className="text-[10.5px] text-brand font-bold">{item.price} ₺</span>}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function LuckyCombo({ open, onClose, items }: LuckyComboProps) {
  const drinks = items.filter((i) => i.category === 'icecekler');
  const mains = items.filter((i) => i.category !== 'icecekler' && i.price > 0);

  const [spinning, setSpinning] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [showWaiter, setShowWaiter] = useState(false);
  const [reelMain, setReelMain] = useState<MenuItem | null>(null);
  const [reelDrink, setReelDrink] = useState<MenuItem | null>(null);
  const [reelReward, setReelReward] = useState<Reward>(REEL_REWARDS[0]);
  const [mainPick, setMainPick] = useState<MenuItem | null>(null);
  const [drinkPick, setDrinkPick] = useState<MenuItem | null>(null);
  const [reward, setReward] = useState<Reward | null>(null);
  const [hype, setHype] = useState(HYPE[0]);
  const lucky = isLuckyHour();

  const timers = useRef<number[]>([]);
  const lastMain = useRef<string | undefined>(undefined);
  const lastDrink = useRef<string | undefined>(undefined);
  const clearTimers = () => { timers.current.forEach((t) => { clearInterval(t); clearTimeout(t); }); timers.current = []; };

  const spin = () => {
    if (!mains.length) return;
    clearTimers();
    setSpinning(true); setRevealed(false); setShowWaiter(false);
    setMainPick(null); setDrinkPick(null); setReward(null);

    const fMain = weightedPick(mains, lastMain.current);
    const fDrink = weightedPick(drinks, lastDrink.current);
    const fReward = pickReward(lucky);

    const a = window.setInterval(() => setReelMain(mains[Math.floor(Math.random() * mains.length)]), 80);
    const b = drinks.length ? window.setInterval(() => setReelDrink(drinks[Math.floor(Math.random() * drinks.length)]), 80) : 0;
    const c = window.setInterval(() => setReelReward(REEL_REWARDS[Math.floor(Math.random() * REEL_REWARDS.length)]), 90);
    timers.current.push(a, c); if (b) timers.current.push(b);

    timers.current.push(window.setTimeout(() => { clearInterval(a); setReelMain(fMain); }, 1100));
    timers.current.push(window.setTimeout(() => { if (b) clearInterval(b); setReelDrink(fDrink); }, 1700));
    timers.current.push(window.setTimeout(() => {
      clearInterval(c);
      if (fReward) setReelReward(fReward);
      setMainPick(fMain); setDrinkPick(fDrink); setReward(fReward);
      if (fMain) lastMain.current = fMain.id;
      if (fDrink) lastDrink.current = fDrink.id;
      setHype(HYPE[Math.floor(Math.random() * HYPE.length)]);
      setSpinning(false); setRevealed(true);
    }, 2400));
  };

  useEffect(() => {
    if (open) spin();
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const baseTotal = (mainPick?.price || 0) + (drinkPick?.price || 0);
  const discounted = reward?.discount ? Math.round(baseTotal * (1 - reward.discount / 100)) : baseTotal;

  const share = async () => {
    const text = `Aspava'da şanslı kombinim: ${mainPick?.name}${drinkPick ? ` + ${drinkPick.name}` : ''}` +
      (reward ? ` — ödül: ${reward.label}` : '') + ` (${discounted} ₺)`;
    try {
      if (typeof (navigator as any).share === 'function') {
        await (navigator as any).share({ title: 'Düzce Aspava · Şanslı Kombin', text, url: window.location.href });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text + ' ' + window.location.href);
      }
    } catch { /* user cancelled */ }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className="relative z-10 w-full max-w-md bg-card border border-line rounded-3xl overflow-hidden shadow-2xl">

            {/* ===== Garsona Göster view ===== */}
            {showWaiter && revealed ? (
              <div className="p-6 text-center space-y-4">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-brand bg-brand/10 border border-brand/20 px-3 py-1 rounded-full uppercase tracking-wider">
                  <ClipboardCheck className="w-3.5 h-3.5" /> Garsona Gösterin
                </span>
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-3">
                    {mainPick?.image && <img src={mainPick.image} className="w-16 h-16 rounded-xl object-cover border border-line" alt="" />}
                    {drinkPick?.image && <img src={drinkPick.image} className="w-16 h-16 rounded-xl object-cover border border-line" alt="" />}
                  </div>
                  <h3 className="text-xl font-display font-bold text-ink leading-tight">
                    {mainPick?.name}{drinkPick ? ` + ${drinkPick.name}` : ''}
                  </h3>
                </div>
                {reward && (
                  <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 text-ink rounded-xl px-4 py-2 text-sm font-semibold">
                    <span className="text-lg">{reward.emoji}</span> Ödül: {reward.label}
                  </div>
                )}
                <div className="text-2xl font-display font-bold text-brand">
                  {discounted} ₺{reward?.discount ? <span className="text-base text-ink-faint line-through ml-2 font-bold">{baseTotal} ₺</span> : null}
                </div>
                <p className="text-[12px] text-ink-faint">+ 5 Ankara usulü ikram ücretsiz</p>
                <button onClick={() => setShowWaiter(false)} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-soft hover:text-ink transition cursor-pointer">
                  <ChevronLeft className="w-4 h-4" /> Geri
                </button>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="bg-gradient-to-r from-brand/15 to-gold/10 border-b border-line px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 bg-brand/15 text-brand rounded-xl">🎰</span>
                    <div>
                      <h3 className="text-base font-sans font-semibold text-ink leading-tight">Şanslı Kombin</h3>
                      <p className="text-[11px] text-ink-faint">Bugüne özel öneri — çevir, ödülü kap!</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="p-1.5 rounded-lg text-ink-faint hover:text-ink hover:bg-card-2 transition cursor-pointer"><X className="w-4 h-4" /></button>
                </div>

                <div className="p-5 space-y-4">
                  {lucky && (
                    <div className="text-center text-[12px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/25 rounded-xl py-2 animate-pulse">
                      🍀 ŞANSLI SAAT AKTİF! Bu kombine %10 indirim garanti.
                    </div>
                  )}

                  {/* Product reels */}
                  <div className="flex items-stretch gap-3">
                    <ProductReel item={reelMain} spinning={spinning} label="Ana Yemek" />
                    {drinks.length > 0 && <ProductReel item={reelDrink} spinning={spinning} label="İçecek" />}
                  </div>

                  {/* Reward reel */}
                  <div>
                    <span className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider block mb-1.5 text-center">Ödül</span>
                    <div className="relative h-14 rounded-2xl border border-gold/30 bg-gold/5 overflow-hidden flex items-center justify-center">
                      <AnimatePresence mode="popLayout">
                        <motion.div key={reelReward.label} initial={{ y: spinning ? 18 : 0, opacity: spinning ? 0 : 1 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -18, opacity: 0 }} transition={{ duration: spinning ? 0.09 : 0.3 }}
                          className="absolute inset-0 flex items-center justify-center gap-2">
                          <span className="text-xl">{reelReward.emoji}</span>
                          <span className={`text-[13px] font-bold ${reelReward.discount ? 'text-brand' : 'text-ink'}`}>{reelReward.label}</span>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Result */}
                  <AnimatePresence mode="wait">
                    {revealed ? (
                      <motion.div key="res" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                        <p className="text-center text-sm font-display font-bold text-ink">{hype}</p>
                        <div className="flex items-center justify-between bg-card-2 border border-line rounded-2xl px-4 py-3">
                          <span className="text-[12px] text-ink-soft">Kombin tutarı</span>
                          <span className="text-lg font-display font-bold text-brand">
                            {discounted} ₺{reward?.discount ? <span className="text-[12px] text-ink-faint line-through ml-1.5 font-bold">{baseTotal} ₺</span> : null}
                          </span>
                        </div>
                        <div className="flex items-start gap-2 text-[11.5px] text-ink-soft bg-brand/5 border border-brand/15 rounded-xl px-3 py-2.5">
                          <Gift className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                          <span>Yanında <strong className="text-ink">5 ikram ücretsiz</strong>. Kombini ve ödülü garsonunuza gösterin.</span>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.p key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center text-[13px] text-ink-faint flex items-center justify-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-brand animate-pulse" /> Şansın çevriliyor…
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Actions */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-2">
                      <button onClick={spin} disabled={spinning} className="flex-1 bg-brand text-on-brand font-bold py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-brand-2 transition disabled:opacity-60">
                        <RotateCw className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} /> {spinning ? 'Çevriliyor…' : 'Tekrar Çevir'}
                      </button>
                      <button onClick={() => setShowWaiter(true)} disabled={!revealed} className="flex-1 bg-card-2 border border-line text-ink font-semibold py-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer hover:border-brand/40 transition disabled:opacity-50">
                        <ClipboardCheck className="w-4 h-4" /> Garsona Göster
                      </button>
                    </div>
                    <div className="flex items-center justify-center gap-4 text-[12px]">
                      <button onClick={share} disabled={!revealed} className="flex items-center gap-1.5 text-ink-soft hover:text-brand transition cursor-pointer disabled:opacity-50">
                        <Share2 className="w-3.5 h-3.5" /> Paylaş
                      </button>
                      <button onClick={onClose} className="text-ink-faint hover:text-ink transition cursor-pointer">Kapat</button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
