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
const JWT_SECRET = process.env.JWT_SECRET || 'dev-insecure-secret-change-me';

const app = express();
app.use(express.json({ limit: '2mb' }));

function requireAuth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Giriş gerekli' });
  try { req.admin = jwt.verify(token, JWT_SECRET); next(); }
  catch { return res.status(401).json({ error: 'Oturum geçersiz' }); }
}
const wrap = (fn) => (req, res) => fn(req, res).catch((e) => { console.error(e); res.status(500).json({ error: 'Sunucu hatası' }); });

// ---- Public reads ----
app.get('/api/menu', wrap(async (req, res) => res.json(await getMenu())));
app.get('/api/settings', wrap(async (req, res) => res.json(await getSettings())));
app.post('/api/track', wrap(async (req, res) => { try { await recordView(req.body?.id); } catch { /* ignore */ } res.json({ ok: true }); }));

// ---- Images (served from DB) ----
app.get('/img/:id', wrap(async (req, res) => {
  const img = await getImage(req.params.id);
  if (!img) return res.status(404).end();
  res.set('Cache-Control', 'public, max-age=86400');
  res.type(img.mime).send(img.data);
}));

// ---- Login ----
app.post('/api/login', wrap(async (req, res) => {
  const { email, password } = req.body || {};
  const user = await getAdminByEmail(email || '');
  if (!user || !bcrypt.compareSync(String(password || ''), user.password_hash)) {
    return res.status(401).json({ error: 'E-posta veya şifre hatalı' });
  }
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
  try { await seedIfEmpty(); } catch (e) { console.error('Seed hatası:', e); }
  app.listen(PORT, () => console.log(`Aspava backend → http://localhost:${PORT}`));
})();
