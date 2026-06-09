// One-shot: sync menu_items + categories (and new item images) from server/seed-data.json
// into an EXISTING (non-empty) database. Unlike seed-runtime, this runs even when the DB
// already has data — use it after editing seed-data.json to push price/description/new-item
// changes to a live DB. Does NOT touch admin users or settings.
//
// Local DB (default):   node scripts/sync-db.js
// Production (Turso):    DATABASE_URL=libsql://... DATABASE_AUTH_TOKEN=... node scripts/sync-db.js
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { init, upsertItem, upsertCategory, putImage } from '../server/db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const dataPath = join(ROOT, 'server', 'seed-data.json');
const SRC_IMAGES = join(ROOT, 'public', 'images', 'menu');

const data = JSON.parse(readFileSync(dataPath, 'utf8'));

await init();

for (const c of data.categories) {
  await upsertCategory({ id: c.id, name: c.name, icon: c.icon, sortOrder: c.sort_order });
}

let withImage = 0;
for (const it of data.items) {
  const src = join(SRC_IMAGES, `${it.id}.jpg`);
  let image = it.image; // fallback: static /images/menu path from seed-data
  if (existsSync(src)) {
    await putImage(it.id, readFileSync(src), 'image/jpeg');
    image = `/img/${it.id}`;
    withImage++;
  }
  await upsertItem({ ...it, image, sortOrder: it.sort_order });
}

const target = process.env.DATABASE_URL || 'file:./data/app.db';
console.log(`Sync tamam: ${data.items.length} ürün, ${data.categories.length} kategori, ${withImage} görsel → ${target}`);
process.exit(0);
