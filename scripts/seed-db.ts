// One-time local seed: pushes the menu (data.ts) + images + an admin user into the DB.
// Run: npm run seed   (uses ADMIN_EMAIL / ADMIN_PASSWORD from env or .env)
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { MENU_ITEMS, CATEGORIES } from '../src/data';
import { init, upsertItem, upsertCategory, setSetting, upsertAdmin, countItems, putImage } from '../server/db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC_IMAGES = join(ROOT, 'public', 'images', 'menu');

await init();

const realCats = CATEGORIES.filter((c) => c.id !== 'all');
for (let i = 0; i < realCats.length; i++) {
  const c = realCats[i];
  await upsertCategory({ id: c.id, name: c.name, icon: c.icon, sortOrder: i });
}

let imgCount = 0;
for (let i = 0; i < MENU_ITEMS.length; i++) {
  const item = MENU_ITEMS[i];
  let image = '';
  const src = join(SRC_IMAGES, `${item.id}.jpg`);
  if (existsSync(src)) {
    await putImage(item.id, readFileSync(src), 'image/jpeg');
    image = `/img/${item.id}`;
    imgCount++;
  }
  await upsertItem({ ...item, image, sortOrder: i });
}

await setSetting('google_review_url', 'https://maps.app.goo.gl/WGZqh9YfZzH9XUPs8');
await setSetting('google_review_delay', '20');

const email = process.env.ADMIN_EMAIL || 'admin@aspava.local';
const password = process.env.ADMIN_PASSWORD || 'aspava1234';
await upsertAdmin(email, bcrypt.hashSync(password, 10));

console.log(`Seed tamam: ${await countItems()} ürün, ${imgCount} görsel DB'ye yazıldı.`);
console.log(`Yönetici girişi: ${email} ${process.env.ADMIN_PASSWORD ? '(env şifresi)' : '(VARSAYILAN: aspava1234 — değiştir!)'}`);
