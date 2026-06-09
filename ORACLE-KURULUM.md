# Düzce Aspava — Oracle Cloud "Always Free" Kurulumu (kalıcı $0)

Sıfır aylık ücretle, kendi Linux sunucunda. Docker Compose ile tek komut çalışır; alan adı verirsen
otomatik HTTPS. Aşağıdaki aşamaları sırayla yapıyoruz — takıldığın yerde çıktıyı bana yapıştır.

---

## Aşama 1 — Oracle hesabı + sunucu (web panelinden, ~10 dk)

1. **Kaydol:** https://www.oracle.com/cloud/free/ → "Start for free". (Doğrulama için kredi kartı ister,
   **Always Free kaynaklardan ücret alınmaz.**) Bölge olarak yakın bir yer seç (örn. Frankfurt).
2. **Sunucu oluştur:** Menu → **Compute → Instances → Create Instance**.
   - Image: **Ubuntu 22.04**.
   - Shape: **Always Free eligible** olanı seç (**VM.Standard.A1.Flex** — ARM, ücretsiz 4 çekirdek/24GB;
     listede yoksa **VM.Standard.E2.1.Micro** — AMD).
   - **SSH Keys:** "Generate a key pair for me" → **private key'i indir** (örn. `aspava.key`). Sakla.
   - Create → 1-2 dk sonra sunucunun **Public IP**'sini not al.
3. **80 ve 443 portlarını aç (ağ):** Instance → "Virtual Cloud Network" linkine tıkla → **Security Lists**
   → Default Security List → **Add Ingress Rules**:
   - Kaynak `0.0.0.0/0`, IP Protocol **TCP**, Destination Port **80** → ekle.
   - Aynısını **443** için tekrarla.

> Bana yalnız **Public IP**'yi söyle (özel anahtarı/şifreyi PAYLAŞMA). Sonraki komutları birlikte yaparız.

---

## Aşama 2 — Sunucuya bağlan + Docker kur

Windows PowerShell'de (indirdiğin anahtar ve IP ile):
```powershell
# Anahtar izinlerini düzelt (bir kez)
icacls .\aspava.key /inheritance:r /grant:r "$($env:USERNAME):(R)"
# Bağlan
ssh -i .\aspava.key ubuntu@<PUBLIC_IP>
```
Sunucuya girince (artık Linux komutları):
```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
# VM güvenlik duvarında 80/443'ü aç (Oracle Ubuntu imajı kapalı gelir)
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80  -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
# docker grubunun aktif olması için çık-gir
exit
```
Tekrar `ssh -i .\aspava.key ubuntu@<PUBLIC_IP>` ile bağlan.

---

## Aşama 3 — Kodu sunucuya gönder

**Kendi bilgisayarında** (proje klasöründe, yeni bir PowerShell):
```powershell
cd "C:\Users\User\Desktop\düzce-aspava"
tar -czf aspava.tar.gz --exclude=node_modules --exclude=dist --exclude=data --exclude=.git --exclude=*.tar.gz .
scp -i .\aspava.key .\aspava.tar.gz ubuntu@<PUBLIC_IP>:~/
```
**Sunucuda:**
```bash
mkdir -p ~/aspava && tar -xzf ~/aspava.tar.gz -C ~/aspava && cd ~/aspava
```

---

## Aşama 4 — Ayarla ve çalıştır

**Sunucuda** `.env` dosyasını oluştur (arkadaşının panel girişini sen belirle):
```bash
cat > .env <<'EOF'
JWT_SECRET=BURAYA-UZUN-RASTGELE-DEGER  # üret: openssl rand -base64 32
ADMIN_EMAIL=arkadas@eposta.com
ADMIN_PASSWORD=guclu-bir-sifre
SITE_ADDRESS=:80
EOF
nano .env   # e-posta/şifreyi düzenle, Ctrl+O kaydet, Ctrl+X çık
```
Başlat:
```bash
docker compose up -d --build
```
İlk derleme birkaç dakika sürer. Bitince tarayıcıdan **http://<PUBLIC_IP>** → menü açılır 🎉
(Panel: alt footer'daki **Yönetim** → e-posta/şifre.)

---

## Aşama 5 — (opsiyonel) HTTPS — ücretsiz alan adı ile

`http://IP` çalışır ama kilit ikonu olmaz (Paylaş gibi özellikler HTTPS ister). Ücretsiz çözüm:
1. https://www.duckdns.org → giriş yap, bir alt alan adı al (örn. `aspava`), **IP'ni yaz** → `aspava.duckdns.org`.
2. Sunucuda `.env` içinde: `SITE_ADDRESS=aspava.duckdns.org` yap → `docker compose up -d`.
3. Caddy otomatik Let's Encrypt sertifikası alır → **https://aspava.duckdns.org** hazır. QR'ı buna üret.

---

## Günlük kullanım / bakım
- Güncelleme yayınlama: yeni `aspava.tar.gz`'i gönder → sunucuda `docker compose up -d --build`.
- Logları görme: `docker compose logs -f`
- Yeniden başlatma: `docker compose restart`
- Veri & görseller `aspava_data` volume'da kalıcıdır; konteyner silinse bile durur.
