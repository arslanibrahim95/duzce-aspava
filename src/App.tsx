import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Search,
  Phone,
  MapPin,
  Clock,
  Settings,
  Sun,
  Moon,
  X,
  Star,
  ExternalLink,
  ShieldAlert,
  ChevronDown,
  Gift,
} from 'lucide-react';

import { MenuItem, Category } from './types';
import { fetchMenu, fetchSettings } from './lib/api';
import MenuCard from './components/MenuCard';
import MenuCardSkeleton from './components/MenuCardSkeleton';
import ExperienceRating from './components/ExperienceRating';
import AdminDashboard from './components/AdminDashboard';
import LuckyCombo from './components/LuckyCombo';

const FREE_TREATS = [
  { title: 'Patates Tava', detail: 'Sıcak & Çıtır', emoji: '🍟' },
  { title: 'Sarımsaklı Cacık', detail: 'Süzme Yoğurtlu', emoji: '🥣' },
  { title: 'Mevsim Salata', detail: 'Nar Ekşili', emoji: '🥗' },
  { title: 'İrmik Helvası', detail: 'Dondurmalı', emoji: '🍮' },
  { title: 'Demleme Çay', detail: 'Sınırsız İkram', emoji: '☕' },
];

const ALLERGENS = [
  { name: 'glüten', label: 'Glüten', icon: '🌾' },
  { name: 'süt', label: 'Süt Ürünleri', icon: '🥛' },
  { name: 'kuruyemiş', label: 'Kuruyemiş', icon: '🥜' },
  { name: 'yumurta', label: 'Yumurta', icon: '🥚' },
  { name: 'susam', label: 'Susam', icon: '🥯' },
  { name: 'soya', label: 'Soya', icon: '🫘' },
  { name: 'balık', label: 'Balık', icon: '🐟' },
];

export default function App() {
  // ---------- Menu data (loaded from the backend) ----------
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ---------- Browse state ----------
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [avoidAllergens, setAvoidAllergens] = useState<string[]>([]);
  const [isAllergenOpen, setIsAllergenOpen] = useState(false);
  const [isPromoOpen, setIsPromoOpen] = useState(false);
  const [isMenuLoading, setIsMenuLoading] = useState(true);
  const [isBackofficeOpen, setIsBackofficeOpen] = useState(false);
  const [isComboOpen, setIsComboOpen] = useState(false);
  const [globalNotice, setGlobalNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setGlobalNotice(msg);
    setTimeout(() => setGlobalNotice(null), 4000);
  };

  // ---------- Load menu from backend (re-callable after admin edits) ----------
  const loadMenu = async () => {
    try {
      const data = await fetchMenu();
      setMenuItems(data.items);
      setCategories(data.categories);
      setLoadError(null);
    } catch {
      setLoadError('Menü yüklenemedi. Lütfen sayfayı yenileyin.');
    } finally {
      setIsMenuLoading(false);
    }
  };
  useEffect(() => {
    loadMenu();
  }, []);

  // ---------- Theme ----------
  const [isLightMode, setIsLightMode] = useState<boolean>(
    () => typeof window !== 'undefined' && localStorage.getItem('aspava_theme') === 'light'
  );
  useEffect(() => {
    document.documentElement.classList.toggle('light', isLightMode);
    localStorage.setItem('aspava_theme', isLightMode ? 'light' : 'dark');
  }, [isLightMode]);

  const handleCategorySelect = (catId: string) => {
    setActiveCategory(catId);
  };

  // ---------- Google review reminder (from backend settings) ----------
  const [googleReviewUrl, setGoogleReviewUrl] = useState('https://maps.app.goo.gl/WGZqh9YfZzH9XUPs8');
  const [googleReviewDelay, setGoogleReviewDelay] = useState(20);
  const [showGooglePopup, setShowGooglePopup] = useState(false);
  useEffect(() => {
    fetchSettings()
      .then((s) => {
        if (s.google_review_url) setGoogleReviewUrl(s.google_review_url);
        if (s.google_review_delay) setGoogleReviewDelay(Number(s.google_review_delay) || 20);
      })
      .catch(() => {});
  }, []);
  useEffect(() => {
    if (localStorage.getItem('aspava_google_review_done_dismissed') === 'true') return;
    const t = setTimeout(() => setShowGooglePopup(true), googleReviewDelay * 1000);
    return () => clearTimeout(t);
  }, [googleReviewDelay]);

  const dismissGooglePopup = () => {
    setShowGooglePopup(false);
    localStorage.setItem('aspava_google_review_done_dismissed', 'true');
  };

  // Category tabs (prepend the synthetic "Tümü" tab to the real categories)
  const navCategories: Category[] = [{ id: 'all', name: 'Tümü', icon: 'Sparkles' }, ...categories];

  // ---------- Filtering ----------
  const searchAndCategory = menuItems.filter((item) => {
    const inCategory = activeCategory === 'all' || item.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const inSearch =
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      (item.ingredients && item.ingredients.some((ing) => ing.toLowerCase().includes(q)));
    return inCategory && inSearch;
  });
  const filteredMenuItems = searchAndCategory.filter(
    (item) => avoidAllergens.length === 0 || !avoidAllergens.some((a) => item.allergens?.includes(a))
  );
  const allergenHiddenCount = searchAndCategory.length - filteredMenuItems.length;

  return (
    // Zemin html'de; bg-page burada olursa body::before/::after süslemesini örter
    <div className="min-h-screen text-ink overflow-x-hidden">
      {/* Top ribbon */}
      <div className="bg-brand text-on-brand py-2 px-4 text-center text-[12.5px] font-medium">
        📢 Tüm ana yemeklerin yanında <span className="font-bold">5 farklı Ankara usulü ikram</span> sınırsız ve ücretsizdir
      </div>

      {/* Toast */}
      <AnimatePresence>
        {globalNotice && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto"
          >
            <div className="bg-card border border-brand/30 rounded-2xl px-4 py-3.5 shadow-2xl flex items-start gap-3 warm-glow">
              <span className="p-1.5 bg-brand/10 text-brand rounded-xl shrink-0">
                <Sparkles className="w-4 h-4" />
              </span>
              <p className="text-sm text-ink leading-relaxed">{globalNotice}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-7">
        {/* Header */}
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand text-on-brand rounded-2xl flex items-center justify-center font-display font-black text-2xl shadow-lg shrink-0">
              A
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight leading-none flex items-baseline gap-2">
                ASPAVA
                <span className="text-sm font-display italic font-medium text-gold">Düzce</span>
              </h1>
              <p className="text-[12px] text-ink-faint mt-1">Seçkin Meze &amp; Enfes Kebap · Ankara Usulü</p>
            </div>
          </div>

        </header>

        {/* Treats & info — collapsible */}
        <div className="bg-card border border-line rounded-2xl overflow-hidden">
          <button
            onClick={() => setIsPromoOpen(!isPromoOpen)}
            className="w-full flex items-center justify-between gap-3 p-4 hover:bg-card-2/50 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand/10 text-brand shrink-0">
                <Gift className="w-4.5 h-4.5" />
              </span>
              <div>
                <span className="text-sm font-display font-bold text-ink block">Sınırsız &amp; Ücretsiz İkramlarımız</span>
                <span className="text-[12px] text-ink-faint">Her ana yemeğin yanında 5 farklı Ankara usulü ikram</span>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-ink-faint transition-transform shrink-0 ${isPromoOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence initial={false}>
            {isPromoOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-0 grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {FREE_TREATS.map((t, i) => (
                    <div key={i} className="bg-card-2 border border-line rounded-xl p-3 text-center">
                      <span className="text-2xl block">{t.emoji}</span>
                      <span className="text-[12.5px] font-semibold text-ink block mt-1.5">{t.title}</span>
                      <span className="text-[11px] text-ink-faint block">{t.detail}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Lucky Combo — gamified smart suggestion */}
        <button
          onClick={() => setIsComboOpen(true)}
          className="w-full group bg-gradient-to-r from-brand/15 via-card to-gold/10 border border-brand/25 hover:border-brand/50 rounded-2xl px-4 py-3.5 flex items-center justify-between gap-3 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎰</span>
            <div className="text-left">
              <span className="text-sm font-display font-bold text-ink block">Şanslı Kombin'i Çevir</span>
              <span className="text-[12px] text-ink-faint">Bugüne özel ana yemek + içecek önerisi — dene şansını!</span>
            </div>
          </div>
          <span className="text-[12px] font-bold text-brand bg-brand/10 border border-brand/20 px-3 py-1.5 rounded-full whitespace-nowrap group-hover:bg-brand group-hover:text-on-brand transition shrink-0">
            ÇEVİR →
          </span>
        </button>

        {/* Categories — wrap on mobile so all are visible without horizontal scrolling */}
        <div className="flex flex-wrap gap-2">
            {navCategories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`cursor-pointer px-4 sm:px-5 py-2.5 rounded-full text-[13px] sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 border ${
                    isActive
                      ? 'bg-brand text-on-brand border-transparent shadow-md'
                      : 'bg-card text-ink-soft border-line hover:border-brand/40 hover:text-ink'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
        </div>

        {/* Search */}
        <div className="relative max-w-xl">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none">
            <Search className="w-4.5 h-4.5" />
          </span>
          <input
            type="text"
            placeholder="Yemek veya malzeme ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm bg-card border border-line focus:border-brand rounded-full pl-12 pr-24 py-3.5 focus:outline-none text-ink placeholder:text-ink-faint transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-medium bg-card-2 hover:bg-line text-ink-soft px-3 py-1.5 rounded-full transition cursor-pointer"
            >
              Temizle
            </button>
          )}
        </div>

        {/* Allergen filter — collapsible */}
        <div className="bg-card border border-line rounded-2xl overflow-hidden">
          <button
            onClick={() => setIsAllergenOpen(!isAllergenOpen)}
            className="w-full flex items-center justify-between gap-3 p-4 hover:bg-card-2/50 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand/10 text-brand shrink-0">
                <ShieldAlert className="w-4.5 h-4.5" />
              </span>
              <div>
                <span className="text-sm font-display font-bold text-ink block">Alerjen Filtresi</span>
                <span className="text-[12px] text-ink-faint">
                  {avoidAllergens.length > 0
                    ? `${avoidAllergens.length} hassasiyet seçili · ${allergenHiddenCount} ürün gizli`
                    : 'Hassasiyet duyduğunuz gıdaları gizleyin'}
                </span>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-ink-faint transition-transform shrink-0 ${isAllergenOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence initial={false}>
            {isAllergenOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-0 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {ALLERGENS.map((a) => {
                      const selected = avoidAllergens.includes(a.name);
                      return (
                        <button
                          key={a.name}
                          onClick={() => {
                            setAvoidAllergens((prev) =>
                              selected ? prev.filter((x) => x !== a.name) : [...prev, a.name]
                            );
                          }}
                          className={`cursor-pointer text-[13px] font-medium px-3.5 py-2 rounded-full border flex items-center gap-2 transition-all ${
                            selected
                              ? 'bg-red-500/10 border-red-500/40 text-red-500'
                              : 'bg-card-2 border-line hover:border-brand/40 text-ink-soft hover:text-ink'
                          }`}
                        >
                          <span>{a.icon}</span>
                          <span>{a.label}</span>
                          {selected && <span className="text-[10px] font-bold">✕</span>}
                        </button>
                      );
                    })}
                  </div>
                  {avoidAllergens.length > 0 && (
                    <button
                      onClick={() => setAvoidAllergens([])}
                      className="cursor-pointer text-[12px] font-medium text-brand hover:text-brand-2 transition"
                    >
                      Tüm filtreleri temizle
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Menu grid */}
        <section>
          {isMenuLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <MenuCardSkeleton key={`sk-${i}`} />
              ))}
            </div>
          ) : loadError ? (
            <div className="bg-card border border-dashed border-line rounded-3xl p-12 text-center space-y-3">
              <p className="text-base font-display font-bold text-ink">{loadError}</p>
              <button
                onClick={() => { setIsMenuLoading(true); loadMenu(); }}
                className="cursor-pointer text-sm font-semibold text-brand hover:text-brand-2 transition"
              >
                Tekrar dene
              </button>
            </div>
          ) : filteredMenuItems.length === 0 ? (
            <div className="bg-card border border-dashed border-line rounded-3xl p-12 text-center space-y-3">
              <p className="text-base font-display font-bold text-ink">Aradığınız kriterlerde ürün bulunamadı</p>
              <p className="text-sm text-ink-faint max-w-sm mx-auto">
                Farklı bir kelime deneyin veya kategorilerden tüm seçenekleri inceleyin.
              </p>
              <button
                onClick={() => {
                  handleCategorySelect('all');
                  setSearchQuery('');
                  setAvoidAllergens([]);
                }}
                className="cursor-pointer text-sm font-semibold text-brand hover:text-brand-2 transition"
              >
                Filtreleri sıfırla
              </button>
            </div>
          ) : (
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {filteredMenuItems.map((item) => (
                <MenuCard key={item.id} item={item} />
              ))}
            </motion.div>
          )}
        </section>

        {/* Experience rating */}
        <section className="bg-card border border-line rounded-3xl p-5 md:p-6">
          <div className="max-w-2xl mx-auto">
            <ExperienceRating />
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-line pt-8 pb-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2.5">
              <h4 className="text-sm font-display font-bold text-ink">Düzce Aspava</h4>
              <p className="text-[13px] text-ink-soft leading-relaxed">
                Ankara'nın meşhur fırın esintisini her dilim ve dürüme katıyoruz. <strong className="text-ink font-semibold">Royal Gold AVM</strong>'deki şubemizde sizleri ağırlamaktan mutluluk duyarız.
              </p>
              <div className="flex items-start gap-2 text-[13px] text-ink-soft">
                <MapPin className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <span>Royal Gold AVM, Kültür Mah. İstanbul Cad. No:14, Düzce Merkez</span>
              </div>
            </div>
            <div className="space-y-2.5">
              <h4 className="text-sm font-display font-bold text-ink">İletişim</h4>
              <p className="text-[13px] text-ink-soft leading-relaxed">
                Rezervasyon ve bilgi için bizi arayabilirsiniz.
              </p>
              <div className="flex items-center gap-2 text-[13px] text-ink-soft">
                <Phone className="w-4 h-4 text-brand shrink-0" />
                <span className="font-medium">+90 (380) 555 14 14</span>
              </div>
            </div>
            <div className="space-y-2.5">
              <h4 className="text-sm font-display font-bold text-ink">Çalışma Saatleri</h4>
              <p className="text-[13px] text-ink-soft leading-relaxed">
                Köz ateşimiz hiç sönmez, çayımız hiç soğumaz.
              </p>
              <div className="flex items-center gap-2 text-[13px] text-ink-soft">
                <Clock className="w-4 h-4 text-brand shrink-0" />
                <span>Her gün 11:00 – 24:00</span>
              </div>
            </div>
          </div>

          <div className="border-t border-line pt-5 flex flex-col sm:flex-row justify-between items-center gap-2 text-[12px] text-ink-faint">
            <span className="flex items-center gap-3">
              © 2026 Düzce Aspava · Dijital Menü
              <button
                onClick={() => setIsBackofficeOpen(true)}
                className="flex items-center gap-1 text-ink-faint hover:text-brand transition cursor-pointer"
                title="Yönetim Paneli"
              >
                <Settings className="w-3.5 h-3.5" />
                Yönetim
              </button>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Masada nakit veya kredi kartı geçerlidir
            </span>
          </div>
        </footer>
      </div>

      {/* Lucky Combo game */}
      <LuckyCombo open={isComboOpen} onClose={() => setIsComboOpen(false)} items={menuItems} />

      {/* Admin dashboard */}
      <AnimatePresence>
        {isBackofficeOpen && (
          <AdminDashboard
            items={menuItems}
            categories={categories}
            onChanged={loadMenu}
            onClose={() => setIsBackofficeOpen(false)}
            onShowNotice={showNotice}
            isLightMode={isLightMode}
          />
        )}
      </AnimatePresence>

      {/* Google review reminder */}
      <AnimatePresence>
        {showGooglePopup && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="fixed bottom-24 left-6 z-50 max-w-sm w-[calc(100%-3rem)] p-5 rounded-2xl bg-card border border-line shadow-2xl"
          >
            <button
              onClick={dismissGooglePopup}
              className="absolute top-3 right-3 p-1.5 rounded-lg text-ink-faint hover:text-ink hover:bg-card-2 transition cursor-pointer"
              aria-label="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="space-y-3">
              <div className="flex gap-0.5 text-gold">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-display font-bold text-ink">Deneyiminiz hoşunuza gittiyse?</h4>
                <p className="text-[13px] text-ink-soft leading-relaxed">
                  Google Haritalar'da bizi değerlendirerek küçük işletmemize büyük destek olabilirsiniz.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <a
                  href={googleReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={dismissGooglePopup}
                  className="flex-1 cursor-pointer py-2.5 px-3 bg-brand hover:bg-brand-2 text-on-brand rounded-xl text-[13px] font-bold text-center transition flex items-center justify-center gap-1.5"
                >
                  Google'da Puanla
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={dismissGooglePopup}
                  className="py-2.5 px-3 rounded-xl text-[13px] font-medium bg-card-2 hover:bg-line text-ink-soft transition cursor-pointer"
                >
                  Sonra
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Theme toggle */}
      <button
        onClick={() => setIsLightMode(!isLightMode)}
        className="fixed bottom-6 right-6 z-40 cursor-pointer w-12 h-12 rounded-full bg-card border border-line hover:border-brand/40 text-gold shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        title={isLightMode ? 'Gece moduna geç' : 'Gündüz moduna geç'}
      >
        {isLightMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </button>
    </div>
  );
}
