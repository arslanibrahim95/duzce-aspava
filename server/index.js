// Self-contained backend: serves the built React app + JSON API. Data + images live in libSQL
// (local file in dev, hosted Turso in production — works on hosts with ephemeral disks).
import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  init, getMenu, getSettings, upsertItem, deleteItem, bulkUpdatePrices,
  upsertCategory, deleteCategory, reorderCategories, setSetting,
  getAdminByEmail, recordView, putImage, getImage,
} from './db.js';
import { seedIfEmpty } from './seed-runtime.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PORT = process.env.PORT || 8787;
const PROD = process.env.NODE_ENV === 'production';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-insecure-secret-change-me';
if (PROD && !process.env.JWT_SECRET) {
  console.error('HATA: JWT_SECRET tanımlı değil. Production güvensiz varsayılanla başlatılmaz — .env dosyasına güçlü bir JWT_SECRET ekleyin.');
  process.exit(1);
}

const app = express();
app.set('trust proxy', 1); // Caddy/Render reverse proxy arkasında gerçek istemci IP'si için
app.use(express.json({ limit: '2mb' }));

// Brute-force koruması: IP başına 10 dakikada en fazla 5 başarısız giriş denemesi.
const LOGIN_WINDOW_MS = 10 * 60 * 1000;
const LOGIN_MAX_FAILS = 5;
const loginFails = new Map(); // ip -> { count, resetAt }
function loginLimiter(req, res, next) {
  const now = Date.now();
  if (loginFails.size > 1000) for (const [ip, r] of loginFails) if (now > r.resetAt) loginFails.delete(ip);
  const rec = loginFails.get(req.ip);
  if (rec && now > rec.resetAt) { loginFails.delete(req.ip); return next(); }
  if (rec && rec.count >= LOGIN_MAX_FAILS) {
    return res.status(429).json({ error: 'Çok fazla hatalı deneme. Lütfen 10 dakika sonra tekrar deneyin.' });
  }
  next();
}
function recordLoginFail(ip) {
  const now = Date.now();
  const rec = loginFails.get(ip);
  if (!rec || now > rec.resetAt) loginFails.set(ip, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
  else rec.count += 1;
}

function requireAuth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Giriş gerekli' });
  try { req.admin = jwt.verify(token, JWT_SECRET); next(); }
  catch { return res.status(401).json({ error: 'Oturum geçersiz' }); }
}
const wrap = (fn) => (req, res) => fn(req, res).catch((e) => { console.error(e); res.status(500).json({ error: 'Sunucu hatası' }); });

// /api/track herkese açık: IP başına dakikada 30 kayıtla sınırla (sıralama manipülasyonu / DB şişirme önlemi).
// Limit aşımında sessizce 200 dönülür — saldırgana sinyal verme, istemciyi basit tut.
const TRACK_WINDOW_MS = 60 * 1000;
const TRACK_MAX = 30;
const trackHits = new Map(); // ip -> { count, resetAt }
function allowTrack(ip) {
  const now = Date.now();
  if (trackHits.size > 5000) for (const [k, r] of trackHits) if (now > r.resetAt) trackHits.delete(k);
  const rec = trackHits.get(ip);
  if (!rec || now > rec.resetAt) { trackHits.set(ip, { count: 1, resetAt: now + TRACK_WINDOW_MS }); return true; }
  rec.count += 1;
  return rec.count <= TRACK_MAX;
}

// ---- Public reads ----
app.get('/api/menu', wrap(async (req, res) => res.json(await getMenu())));
app.get('/api/settings', wrap(async (req, res) => res.json(await getSettings())));
app.post('/api/track', wrap(async (req, res) => {
  if (allowTrack(req.ip)) { try { await recordView(req.body?.id); } catch { /* ignore */ } }
  res.json({ ok: true });
}));

// ---- Images (served from DB) ----
app.get('/img/:id', wrap(async (req, res) => {
  const img = await getImage(req.params.id);
  if (!img) return res.status(404).end();
  res.set('Cache-Control', 'public, max-age=86400');
  res.type(img.mime).send(img.data);
}));

// ---- Login ----
app.post('/api/login', loginLimiter, wrap(async (req, res) => {
  const { email, password } = req.body || {};
  const user = await getAdminByEmail(email || '');
  if (!user || !(await bcrypt.compare(String(password || ''), user.password_hash))) {
    recordLoginFail(req.ip);
    return res.status(401).json({ error: 'E-posta veya şifre hatalı' });
  }
  loginFails.delete(req.ip);
  const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, email: user.email });
}));

// ---- Admin: items ----
app.post('/api/items', requireAuth, wrap(async (req, res) => res.json(await upsertItem(req.body))));
app.put('/api/items/:id', requireAuth, wrap(async (req, res) => res.json(await upsertItem({ ...req.body, id: req.params.id }))));
app.delete('/api/items/:id', requireAuth, wrap(async (req, res) => { await deleteItem(req.params.id); res.json({ ok: true }); }));
app.post('/api/items/bulk-price', requireAuth, wrap(async (req, res) => {
  const updates = Array.isArray(req.body?.updates) ? req.body.updates : [];
  await bulkUpdatePrices(updates); res.json({ ok: true, count: updates.length });
}));

// ---- Admin: categories ----
app.post('/api/categories', requireAuth, wrap(async (req, res) => res.json(await upsertCategory(req.body))));
app.put('/api/categories/:id', requireAuth, wrap(async (req, res) => res.json(await upsertCategory({ ...req.body, id: req.params.id }))));
app.delete('/api/categories/:id', requireAuth, wrap(async (req, res) => { await deleteCategory(req.params.id); res.json({ ok: true }); }));
app.put('/api/categories', requireAuth, wrap(async (req, res) => { await reorderCategories(req.body?.order || []); res.json({ ok: true }); }));

// ---- Admin: settings ----
app.put('/api/settings', requireAuth, wrap(async (req, res) => {
  for (const [k, v] of Object.entries(req.body || {})) await setSetting(k, v);
  res.json(await getSettings());
}));

// ---- Admin: image upload (stored in DB) ----
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 6 * 1024 * 1024 }, fileFilter: (req, file, cb) => cb(null, file.mimetype.startsWith('image/')) });
app.post('/api/upload', requireAuth, upload.single('image'), wrap(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Görsel yüklenemedi' });
  const id = `up_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  await putImage(id, req.file.buffer, req.file.mimetype);
  res.json({ url: `/img/${id}` });
}));

// ---- Static: built frontend ----
const DIST = join(ROOT, 'dist');
if (existsSync(DIST)) {
  app.use(express.static(DIST));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/img')) return res.status(404).end();
    res.sendFile(join(DIST, 'index.html'));
  });
}

(async () => {
  await init();
  try { await seedIfEmpty(); } catch (e) {
    console.error('Seed hatası:', e);
    if (PROD) process.exit(1); // prod'da yarım/güvensiz seed ile yayına çıkma
  }
  app.listen(PORT, () => console.log(`Aspava backend → http://localhost:${PORT}`));
})();
