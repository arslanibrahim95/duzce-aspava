// Generates server/seed-data.json from data.ts so the production server can auto-seed
// an empty database on first boot (no tsx/src needed at runtime).
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { MENU_ITEMS, CATEGORIES } from '../src/data';

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = join(__dirname, '..', 'server', 'seed-data.json');

const data = {
  categories: CATEGORIES.filter((c) => c.id !== 'all').map((c, i) => ({ id: c.id, name: c.name, icon: c.icon, sort_order: i })),
  items: MENU_ITEMS.map((it, i) => ({ ...it, sort_order: i })),
  settings: {
    google_review_url: 'https://maps.app.goo.gl/WGZqh9YfZzH9XUPs8',
    google_review_delay: '20',
  },
};

writeFileSync(out, JSON.stringify(data, null, 2), 'utf8');
console.log(`server/seed-data.json yazıldı: ${data.items.length} ürün, ${data.categories.length} kategori.`);
