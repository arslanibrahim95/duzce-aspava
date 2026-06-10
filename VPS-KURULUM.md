# Düzce Aspava — Kendi Sunucunda (VPS) Yayına Alma

Her şey **tek sunucuda**: menü, veritabanı, görseller, web sitesi. Turso/dış servis yok.
Otomatik HTTPS (kilit ikonu) + otomatik güvenlik güncellemeleri ile düşük bakım.

**Aylık maliyet:** Sunucu ~4€ (≈140₺) + alan adı yıllık ~150-200₺.
**Senin süren:** ~20-30 dk (çoğu bekleme). Teknik kısmı script yapıyor.

---

## Adım 1 — Alan adı al (~10 dk)
Bir kayıt sitesinden (örn. **isimtescil.net**, **Namecheap**, **Cloudflare**) bir alan adı al:
`duzceaspava.com` veya `aspavaduzce.com` gibi. Kartla ödeme yapılır.

## Adım 2 — Sunucu oluştur (Hetzner, ~5 dk)
1. https://www.hetzner.com/cloud → üye ol, giriş yap.
2. **New Project** → **Add Server**.
3. Konum: **Nuremberg/Falkenstein** (Almanya, Türkiye'ye yakın).
4. Image: **Ubuntu 24.04**.
5. Tip: **CX22** (2 vCPU / 4 GB — fazlasıyla yeter, ~4€/ay).
6. Oluştur. Sana bir **IP adresi** (örn. `5.75.x.x`) ve root şifresi/erişimi verilir.

## Adım 3 — Alan adını sunucuya bağla (DNS, ~5 dk)
Alan adını aldığın sitenin **DNS** ayarlarında iki kayıt ekle (IP = Hetzner IP'si):

| Tip | İsim | Değer |
|-----|------|-------|
| A   | @    | `SUNUCU_IP` |
| A   | www  | `SUNUCU_IP` |

(Yayılması birkaç dakika–1 saat sürebilir.)

## Adım 4 — Tek komutla kur (~5 dk + derleme)
Hetzner panelinde sunucunun **">_ Console"** (web terminal) düğmesine bas, `root` ile gir ve şunu yapıştır:

```bash
curl -fsSL https://raw.githubusercontent.com/arslanibrahim95/duzce-aspava/main/scripts/vps-setup.sh -o vps-setup.sh
sudo bash vps-setup.sh
```

Script sana 3 şey soracak:
- **Alan adı** → `duzceaspava.com` (Adım 1'de aldığın)
- **Panel e-postası** → menüyü yöneteceğin e-posta
- **Panel şifresi** → kendine güçlü bir şifre

Gerisini kendi halleder (Docker kurar, derler, HTTPS sertifikası alır, menüyü yükler).

## Adım 5 — Bitti ✅
- Site: `https://senin-alanadın.com`
- **Yönetim paneli:** sitenin en altındaki **"Yönetim"** yazısına tıkla → e-posta + şifre ile gir.
  Buradan fiyat, ürün, görsel, açıklama düzenleyebilirsin.

---

## Yedekleme & geri yükleme

Kurulum scripti **her gece 03:30'da otomatik yedek** alır: menü, fiyatlar, görseller ve panel
hesabı `/opt/aspava/backups/` altına kopyalanır (son 14 gün tutulur). Senin yapman gereken bir şey yok.

- **Elle yedek almak için** (örn. büyük değişiklik öncesi):
  ```bash
  bash /opt/aspava/scripts/backup.sh
  ```
- **Yedeği kendi bilgisayarına indirmek için** (ayda bir önerilir) — kendi bilgisayarında:
  ```bash
  scp root@SUNUCU_IP:/opt/aspava/backups/app-*.db .
  ```
- **Geri yükleme** (sunucu Console'unda; TARIH kısmını `ls /opt/aspava/backups` ile seç):
  ```bash
  cd /opt/aspava
  docker compose cp backups/app-TARIH.db app:/data/app.db
  docker compose restart app
  ```
- **Ekstra güvence (önerilir):** Hetzner panelinde sunucunun **Backups** özelliğini aç
  (aylık ~1€, sunucunun tamamının kopyası). Disk bozulsa bile her şey geri gelir.

## Sık işler
- **Menüde değişiklik:** Yönetim panelinden yap (anında yansır). Sunucuya dokunmana gerek yok.
- **Koddan güncelleme geldiğinde:** Console'da:
  ```bash
  cd /opt/aspava && git pull && docker compose up -d --build
  ```
- **Ayarları değiştir (şifre vb.):** `nano /opt/aspava/.env` → kaydet → `docker compose up -d` ile yeniden başlat.

> Notlar: QR kodu Adım 5'teki adrese yönlendir. Veriler `/data` diskinde kalıcıdır;
> güncellemelerde silinmez. Yedek için ara sıra `/opt/aspava` üzerinde `docker compose exec`
> ile `app.db` dosyasını indirebilirsin (istersen sana bir yedek komutu da hazırlarım).
