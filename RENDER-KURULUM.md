# Düzce Aspava — Kartsız Yayın (Render + Turso)

İkisi de **ücretsiz ve kredi kartı istemez.** Veriler ve görseller **Turso**'da (bulutta SQLite) durur,
uygulama **Render**'da çalışır. Kod hazır; sadece 3 ücretsiz hesap açıp birkaç değer kopyalıyorsun.

---

## Aşama 1 — Turso (veritabanı) · kartsız
1. https://turso.tech → **Sign up** (GitHub veya e-posta; kart yok).
2. Panelde **Create Database** → bir ad ver (örn. `aspava`), yakın bölge seç (Amsterdam/Frankfurt).
3. Oluşan veritabanında **Connect** / **Connection** kısmından şunları al:
   - **Database URL** → `libsql://aspava-....turso.io` (DATABASE_URL)
   - **Create Token / Auth Token** → uzun bir anahtar (DATABASE_AUTH_TOKEN)
   Bu ikisini bir kenara not et.

> CLI seversen alternatif: `turso db create aspava` + `turso db show aspava --url` + `turso db tokens create aspava`.

---

## Aşama 2 — GitHub (kodu yükle) · kartsız
1. https://github.com → ücretsiz hesap (yoksa).
2. **New repository** → ad: `duzce-aspava` → **boş** oluştur (README ekleme).
3. Bu klasörde (kod commit'i hazır) şunu çalıştır — `<kullanici>` yerine kendi GitHub adın:
```powershell
cd "C:\Users\User\Desktop\düzce-aspava"
git remote add origin https://github.com/<kullanici>/duzce-aspava.git
git push -u origin main
```
(Push sırasında GitHub girişi ister — onayla. Kolay yol: **GitHub Desktop** uygulaması.)

---

## Aşama 3 — Render (yayın) · kartsız
1. https://render.com → **Sign up** → "Sign in with GitHub" (en kolayı; repoyu bağlar). Kart yok.
2. **New → Blueprint** → `duzce-aspava` reposunu seç. Render `render.yaml`'ı okur.
3. Sorduğu **gizli değerleri** gir:
   - `DATABASE_URL` = Turso URL (Aşama 1)
   - `DATABASE_AUTH_TOKEN` = Turso token (Aşama 1)
   - `JWT_SECRET` = uzun rastgele bir değer (üret: `openssl rand -base64 32`)
   - `ADMIN_EMAIL` = arkadaşının panel e-postası
   - `ADMIN_PASSWORD` = arkadaşının panel şifresi
4. **Apply** → Render kurar ve yayınlar (~birkaç dk). Çıkan adres: `https://duzce-aspava.onrender.com`.

İlk açılışta sunucu Turso'yu otomatik doldurur (54 ürün + görseller + yönetici). Adres hazır → **QR** üret.

---

## Aşama 4 — Uyanık tutma (pinger) · kartsız · ÖNEMLİ
Render ücretsiz katmanı ~15 dk hareketsizlikte uykuya geçer; uyandığında ilk müşteri QR'ı okutunca
~30-60 sn boş ekran bekler. Bunu **ücretsiz bir ziyaretçi** ile tamamen önlüyoruz:

1. https://cron-job.org → ücretsiz **Sign up** (kart yok).
2. **Create cronjob** →
   - **Title:** `aspava-uyanik`
   - **URL:** `https://duzce-aspava.onrender.com/api/menu` (kendi adresinle)
   - **Schedule:** her **10 dakikada bir** (`Every 10 minutes`)
3. **Save.** Artık sunucu hep uyanık kalır → müşteri QR'ı okutunca menü anında açılır.

> Ücretsiz katman ayda 750 saat verir (7/24 = 720 saat) — tek servis için yeterli.

---

## Notlar
- **Güncelleme:** kodda değişiklik → `git push` → Render otomatik yeniden yayınlar.
- **Veri/görseller Turso'da kalıcı** — Render yeniden başlasa da kaybolmaz.
- Panel: yayınlı adres → footer'daki **Yönetim** → ADMIN_EMAIL/ADMIN_PASSWORD ile giriş.
