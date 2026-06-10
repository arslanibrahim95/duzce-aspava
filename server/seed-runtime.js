// Auto-seeds an empty database on boot from server/seed-data.json + bundled images.
// Images are read from public/images/menu and stored IN the database (served via /img/:id).
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { upsertItem, upsertCategory, setSetting, upsertAdmin, countItems, putImage } from './db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

export async function seedIfEmpty() {
  if ((await countItems()) > 0) return false;
  const dataPath = join(__dirname, 'seed-data.json');
  if (!existsSync(dataPath)) return false;

  const data = JSON.parse(readFileSync(dataPath, 'utf8'));
  const SRC_IMAGES = join(ROOT, 'public', 'images', 'menu');

  for (const c of data.categories) await upsertCategory({ id: c.id, name: c.name, icon: c.icon, sortOrder: c.sort_order });

  for (const it of data.items) {
    let image = '';
    const src = join(SRC_IMAGES, `${it.id}.jpg`);
    if (existsSync(src)) {
      await putImage(it.id, readFileSync(src), 'image/jpeg');
      image = `/img/${it.id}`;
    }
    await upsertItem({ ...it, image, sortOrder: it.sort_order });
  }
  for (const [k, v] of Object.entries(data.settings || {})) await setSetting(k, v);

  const email = process.env.ADMIN_EMAIL || 'admin@aspava.local';
  if (process.env.NODE_ENV === 'production' && !process.env.ADMIN_PASSWORD) {
    throw new Error('ADMIN_PASSWORD tanımlı değil — production seed varsayılan şifreyle yapılmaz. .env dosyasına ADMIN_PASSWORD ekleyin.');
  }
  const password = process.env.ADMIN_PASSWORD || 'aspava1234';
  await upsertAdmin(email, bcrypt.hashSync(password, 10));
  console.log(`Auto-seed tamam: ${data.items.length} ürün, admin: ${email}`);
  return true;
}
