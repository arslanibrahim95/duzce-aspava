# Design

Warm premium theme. Dark (akşam/köz) varsayılan; `.light` (gündüz/krem) aynı token'ları çevirir.
Kaynak: `src/index.css` (CSS değişkenleri + Tailwind 4 `@theme inline`).

## Theme

Koyu tema sahnesi: akşam 20:30, loş sıcak restoran ışığı, masada telefon. Sayfa kömür sıcaklığında,
vurgular köz (ember) ve altın. Açık tema: gündüz, krem kağıt hissi; basılı menü kartının dijital eşi.

## Colors

| Token | Dark | Light | Rol |
|---|---|---|---|
| `page` | `#17120F` | `#F7F1E9` | Sayfa zemini (sıcak kömür / krem) |
| `card` | `#221A15` | `#FFFFFF` | Kart yüzeyi |
| `card-2` | `#2C211B` | `#F3EBE1` | İkincil yüzey (input, chip) |
| `line` | `#3A2D24` | `#E7DCCD` | Kenarlıklar |
| `ink` | `#F7EFE8` | `#2A211B` | Ana metin |
| `ink-soft` | `#C9B8AC` | `#5C4F45` | İkincil metin |
| `ink-faint` | `#8A7A6E` | `#8B7D70` | Zayıf metin |
| `brand` | `#E0531F` | `#D24A18` | Köz turuncusu; birincil aksiyon + seçim |
| `brand-2` | `#C2451A` | `#B23F14` | Hover |
| `gold` | `#E5A93C` | `#B5832A` | Altın vurgu (yıldız, italik alt başlık) |
| `on-brand` | `#1A120D` | `#FFFFFF` | Brand dolgu üzeri metin |

Strateji: Restrained — sıcak tonlu nötrler + tek köz aksanı; altın yalnız küçük vurgularda.
Tailwind kullanımı: `bg-page`, `bg-card`, `text-ink`, `border-line`, `bg-brand`, `text-gold` vb.

## Typography

- **Display:** Fraunces (serif, optical sizing) — başlıklar, ürün adları, "ASPAVA" logotipi. `font-display`.
- **Body/UI:** Inter — etiketler, açıklamalar, butonlar. `font-sans`.
- **Mono:** JetBrains Mono — nadiren (kod/sayı gerektiğinde).
- Küçük boyutlarda köşeli parantezli ara değerler kullanılıyor: `text-[12px]`, `text-[13px]`.

## Shape & Elevation

- Radius dili: kartlar `rounded-3xl`, modüller `rounded-2xl`, chip/butonlar `rounded-full`.
- Gölge: düşük; hover'da `premium-card` (translateY(-5px) + sıcak gölge + brand kenarlık).
- `warm-glow`: brand renkli yumuşak ışıma (toast, vurgu anları).

## Components

- **MenuCard:** görsel üst (h-52), rozetler (En Sevilen/gold, Acılı/red), modal detay; görselsiz ürün `ImageFallback`.
- **Collapsible bölümler:** ikram listesi ve alerjen filtresi (ChevronDown + AnimatePresence height).
- **Kategori chip'leri:** pill, aktif = brand dolgu.
- **Skeleton:** `shimmer-bg` (image loading), `MenuCardSkeleton`.
- **AdminDashboard:** tam ekran panel; tutarlı form dili, dnd-kit ile kategori sıralama.

## Motion

- Kütüphane: `motion/react` (AnimatePresence + motion.div).
- Süreler 150–400ms, ease-out ağırlıklı; `cubic-bezier(0.16,1,0.3,1)` kart hover'da.
- Dekoratif animasyon yok; state değişimi (aç/kapa, toast, modal) animasyonludur.

## Background (sayfa atmosferi)

- Saf CSS, `body::before/::after` sabit katmanlar; JS ve görsel isteği yok.
- Üstte köz sıcaklığında çok hafif radial ışıma; köşelerde basılı menü kartındaki
  gravür üzüm asması motifinin çizgi-sanat SVG yankısı (data-URI, ~%4-6 opaklık).
- Tema başına opaklık ayrı ayarlanır; içerik kontrastını asla düşürmez.
