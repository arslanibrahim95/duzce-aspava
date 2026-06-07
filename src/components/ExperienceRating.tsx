import { useState, FormEvent, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MessageSquare, CheckCircle, Gift, Sparkles, Heart, Utensils, Zap, ThumbsUp } from 'lucide-react';

interface ExperienceRatingProps {
  orderId?: string;
  tableNo?: string;
  onClosed?: () => void;
}

export default function ExperienceRating({ orderId = 'GEN-999', tableNo = '', onClosed }: ExperienceRatingProps) {
  const [tasteRating, setTasteRating] = useState(0);
  const [serviceRating, setServiceRating] = useState(0);
  const [treatsRating, setTreatsRating] = useState(0);

  const [tasteHover, setTasteHover] = useState(0);
  const [serviceHover, setServiceHover] = useState(0);
  const [treatsHover, setTreatsHover] = useState(0);

  const [comments, setComments] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const QUICK_TAGS = [
    'Sıcak Geldi 🔥',
    'Lavaş Çok Taze 🥖',
    'Sos Kıvamı Muhteşem 🌶️',
    'İkramlar İnanılmaz 🎁',
    'Hızlı ve Güler Yüzlü ⚡',
    'Porsiyon Doyurucuydu 🍽️',
    'Temizlik Harika ✨',
  ];

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const isFormValid = tasteRating > 0 && serviceRating > 0 && treatsRating > 0;

  const handleRatingSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    const userRatingData = {
      orderId,
      tableNo,
      ratings: { taste: tasteRating, service: serviceRating, treats: treatsRating },
      tags: selectedTags,
      comments,
      timestamp: new Date().toISOString(),
    };
    const previous = JSON.parse(localStorage.getItem('aspava_ratings') || '[]');
    localStorage.setItem('aspava_ratings', JSON.stringify([...previous, userRatingData]));
    setIsSubmitted(true);
  };

  const renderRatingRow = (
    label: string,
    description: string,
    currentRating: number,
    setRating: (r: number) => void,
    hoverValue: number,
    setHover: (h: number) => void,
    categoryIcon: ReactNode
  ) => (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <div className="text-brand bg-brand/10 p-2 rounded-xl shrink-0">{categoryIcon}</div>
        <div>
          <span className="text-sm font-semibold text-ink block">{label}</span>
          <span className="text-[12px] text-ink-faint block leading-tight">{description}</span>
        </div>
      </div>
      <div className="flex items-center gap-0.5 shrink-0">
        {[1, 2, 3, 4, 5].map((starValue) => {
          const isActive = (hoverValue || currentRating) >= starValue;
          return (
            <button
              type="button"
              key={starValue}
              onClick={() => setRating(starValue)}
              onMouseEnter={() => setHover(starValue)}
              onMouseLeave={() => setHover(0)}
              className="p-0.5 focus:outline-none transition-transform active:scale-125 cursor-pointer"
            >
              <Star className={`w-6 h-6 transition-all duration-150 ${isActive ? 'fill-gold text-gold' : 'text-line'}`} />
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <motion.form
            key="feedback-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleRatingSubmit}
            className="space-y-5"
          >
            <div className="text-center md:text-left space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-[11px] text-brand font-semibold">
                <Sparkles className="w-3 h-3" />
                <span>{tableNo ? `Masa ${tableNo}` : 'Düzce Aspava'} · Deneyiminizi Değerlendirin</span>
              </div>
              <h4 className="text-xl font-display font-bold text-ink">Deneyiminiz nasıldı?</h4>
              <p className="text-[13px] text-ink-soft leading-relaxed">
                Ziyaretiniz bizim için değerli. Şeflerimize ve servis ekibimize puan vererek gelişmemize katkı sunun.
              </p>
            </div>

            <div className="bg-card-2 border border-line rounded-2xl p-4 space-y-4">
              {renderRatingRow('Yemeklerin Lezzeti', 'Köz pişimi, sos ve lavaş tazeliği', tasteRating, setTasteRating, tasteHover, setTasteHover, <Utensils className="w-4 h-4" />)}
              <div className="border-t border-line" />
              {renderRatingRow('Servis & Hız', 'Garsonların ilgisi ve hızı', serviceRating, setServiceRating, serviceHover, setServiceHover, <Zap className="w-4 h-4" />)}
              <div className="border-t border-line" />
              {renderRatingRow('İkramların Bolluğu', 'Sınırsız patates, cacık, helva, salata', treatsRating, setTreatsRating, treatsHover, setTreatsHover, <Gift className="w-4 h-4" />)}
            </div>

            <div className="space-y-2">
              <span className="text-[12px] font-semibold text-ink-soft block">Özellikle beğendikleriniz:</span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`text-[12px] px-3 py-1.5 rounded-full border transition cursor-pointer ${
                        isSelected
                          ? 'bg-brand/10 border-brand/40 text-brand font-semibold'
                          : 'bg-card border-line text-ink-soft hover:border-brand/40'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-ink-soft flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-ink-faint" />
                Şefimize veya garsonumuza notunuz:
              </label>
              <div className="relative">
                <textarea
                  rows={2}
                  maxLength={250}
                  placeholder="Gözlemlerinizi yazın..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full text-sm bg-card border border-line focus:border-brand rounded-xl p-3 focus:outline-none text-ink placeholder:text-ink-faint resize-none"
                />
                <span className="absolute bottom-2 right-3 text-[11px] text-ink-faint">{comments.length}/250</span>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={!isFormValid}
                className={`w-full py-3.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 ${
                  isFormValid
                    ? 'cursor-pointer bg-brand text-on-brand hover:bg-brand-2'
                    : 'bg-card-2 border border-line text-ink-faint cursor-not-allowed'
                }`}
              >
                <ThumbsUp className="w-4 h-4 shrink-0" />
                Geri Bildirimi Gönder
              </button>
              {!isFormValid && (
                <p className="text-center text-[12px] text-ink-faint mt-2">Lütfen 3 kriterin tümüne yıldız verin.</p>
              )}
            </div>
          </motion.form>
        ) : (
          <motion.div
            key="thank-you-layout"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6 px-2 space-y-5"
          >
            <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="space-y-1 max-w-sm mx-auto">
              <h4 className="text-lg font-display font-bold text-ink flex items-center justify-center gap-1.5">
                Teşekkürler! <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              </h4>
              <p className="text-sm text-ink-soft leading-relaxed">
                Geri bildiriminiz ekibimize iletildi. Sayenizde kalitemizi en üst seviyede tutuyoruz.
              </p>
            </div>

            <div className="max-w-md mx-auto bg-card-2 border border-brand/30 rounded-2xl p-4 warm-glow space-y-2.5">
              <div className="flex items-center gap-2 justify-center text-brand">
                <Gift className="w-5 h-5" />
                <span className="text-[12px] font-bold tracking-wide">ASPAVA İKRAMI 🎁</span>
              </div>
              <div className="space-y-0.5">
                <h5 className="text-sm font-semibold text-ink">Ücretsiz Fırın Sütlaç Kazandınız!</h5>
                <p className="text-[12px] text-ink-soft leading-relaxed">
                  Bir sonraki ziyaretinizde dondurmalı fırın sütlacınız Aspava ikramıdır.
                </p>
              </div>
              <div className="bg-card border border-dashed border-line px-3 py-1.5 rounded-lg inline-block text-sm text-brand font-bold select-all">
                KUPON: <span className="text-ink font-black">ASPAVA-SUTLAC2026</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClosed || (() => setIsSubmitted(false))}
              className="cursor-pointer text-sm bg-card-2 hover:bg-line border border-line text-ink-soft px-5 py-2.5 rounded-xl transition font-medium"
            >
              Yeni Değerlendirme Ekle
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
