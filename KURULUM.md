# Düzce Aspava — Kurulum & Dağıtım

Kendi kendine yeten uygulama: **React önyüz + Node/Express + gömülü SQLite** (üyeliksiz veritabanı).
Tek sunucu hem menüyü hem yönetici API'sini sunar. Görseller diske (`/data/uploads`) yazılır.

## Yerelde çalıştırma

```bash
npm install
npm run seed       # SQLite'a 43 ürün + görseller + yönetici ekler (ilk sefer)
npm run build      # React önyüzünü derler (dist/)
npm run server     # http://localhost:8787  (API + önyüz tek sunucudan)
```

Geliştirme modu (anlık değişiklik): iki terminal →
```bash
npm run server:dev   # backend (8787)
npm run dev          # vite (3000) — /api ve /uploads backend'e proxy'lenir
```

### Yönetici girişi
`.env` dosyasıyla (veya ortam değişkeniyle) belirleyin; yoksa varsayılan: `admin@aspava.local` / `aspava1234`.
```
JWT_SECRET=uzun-rastgele-deger
ADMIN_EMAIL=arkadas@ornek.com
ADMIN_PASSWORD=guclu-sifre
```
Panel: sağ üst **Panel** → e-posta/şifre ile giriş.

## Yayına alma (Fly.io — tek seferlik, birlikte yapılır)

> Veritabanı üyeliği YOK; sadece barındırma için Fly hesabı/girişi (tek sefer).

```bash
# 1. Fly CLI kur ve giriş yap (interaktif — kendiniz çalıştırın)
#    Windows: iwr https://fly.io/install.ps1 -useb | iex
fly auth login

# 2. Uygulamayı oluştur (fly.toml hazır; app adını sorarsa benzersiz bir ad verin)
fly launch --no-deploy --copy-config

# 3. Kalıcı volume (SQLite + görseller burada kalır)
fly volumes create aspava_data --size 1 --region fra

# 4. Gizli değerler (panelden değil, komutla)
fly secrets set JWT_SECRET=uzun-rastgele-deger ADMIN_EMAIL=arkadas@ornek.com ADMIN_PASSWORD=guclu-sifre

# 5. Yayınla
fly deploy
```

İlk açılışta sunucu boş veritabanını otomatik tohumlar (43 ürün + görseller + yönetici).
Çıkan URL'e **QR** üretip masalara koyun. Arkadaşın `URL` → **Panel** → giriş → menüyü yönetir;
değişiklikler tüm müşterilere anında yansır. Bakım gerekmez.

## Mimari özet
- `server/index.js` — Express: `/api/*` + statik `dist/` + `/uploads/*`.
- `server/db.js` — better-sqlite3 şema/sorgular. `server/seed-runtime.js` — ilk açılış tohumlaması.
- `src/lib/api.ts` — önyüz API istemcisi. `src/App.tsx` menüyü API'den çeker.
- `src/components/AdminDashboard.tsx` — giriş + Menü/Kategoriler/Ayarlar (sipariş/ödeme/masa/garson YOK).
- Veri+görseller `/data` volume'da kalıcı.
