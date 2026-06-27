// Database layer over libSQL: a local file in dev, hosted Turso (SQLite) in production.
// All calls are async. Images are stored IN the DB so the app can run on hosts with
// ephemeral disks (e.g. Render free tier).
import { createClient } from '@libsql/client';

// Priority: DATABASE_URL (Turso/libsql) → DB_PATH (local file on a mounted volume) → dev default.
const DB_URL =
  process.env.DATABASE_URL ||
  (process.env.DB_PATH ? `file:${process.env.DB_PATH}` : 'file:./data/app.db');

export const db = createClient({
  url: DB_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN, // undefined for local file
});

export async function init() {
  await db.execute(`CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, icon TEXT DEFAULT '', sort_order INTEGER DEFAULT 0)`);
  await db.execute(`CREATE TABLE IF NOT EXISTS menu_items (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT DEFAULT '', price INTEGER DEFAULT 0,
    category TEXT DEFAULT '', image TEXT DEFAULT '', is_popular INTEGER DEFAULT 0, is_spicy INTEGER DEFAULT 0,
    is_vegetarian INTEGER DEFAULT 0, customizable INTEGER DEFAULT 0, ingredients TEXT DEFAULT '[]',
    allergens TEXT DEFAULT '[]', sort_order INTEGER DEFAULT 0, calories INTEGER DEFAULT 0)`);
  await db.execute(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)`);
  await db.execute(`CREATE TABLE IF NOT EXISTS admin_users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL)`);
  await db.execute(`CREATE TABLE IF NOT EXISTS item_views (item_id TEXT NOT NULL, part TEXT NOT NULL, count INTEGER DEFAULT 0, PRIMARY KEY (item_id, part))`);
  await db.execute(`CREATE TABLE IF NOT EXISTS images (id TEXT PRIMARY KEY, mime TEXT DEFAULT 'image/jpeg', data BLOB)`);

  // Auto-migrate for existing tables that lack 'calories' column
  try {
    const tableInfo = await db.execute('PRAGMA table_info(menu_items)');
    const hasCalories = tableInfo.rows.some((row) => row.name === 'calories');
    if (!hasCalories) {
      await db.execute('ALTER TABLE menu_items ADD COLUMN calories INTEGER DEFAULT 0');
    }
  } catch (err) {
    console.error('Migration error:', err);
  }
}

const num = (v) => (typeof v === 'bigint' ? Number(v) : v);
function safeParse(s, fallback) { try { return JSON.parse(s); } catch { return fallback; } }
function rowToItem(r) {
  return {
    id: r.id, name: r.name, description: r.description, price: num(r.price), category: r.category, image: r.image,
    isPopular: !!num(r.is_popular), isSpicy: !!num(r.is_spicy), isVegetarian: !!num(r.is_vegetarian),
    customizable: !!num(r.customizable), ingredients: safeParse(r.ingredients, []), allergens: safeParse(r.allergens, []),
    calories: r.calories !== undefined ? num(r.calories) : 0,
  };
}

// ---- Day-part (time-of-day ordering) ----
export function currentPart(date = new Date()) {
  const hh = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Istanbul', hour: '2-digit', hour12: false }).format(date);
  const hour = parseInt(hh, 10) % 24;
  if (hour >= 6 && hour < 11) return 'sabah';
  if (hour >= 11 && hour < 15) return 'ogle';
  if (hour >= 15 && hour < 18) return 'ikindi';
  if (hour >= 18 && hour < 23) return 'aksam';
  return 'gece';
}
export async function recordView(itemId) {
  if (!itemId || typeof itemId !== 'string') return;
  // SELECT'li INSERT: sadece menüde gerçekten var olan ürünler sayılır (uydurma ID ile tablo şişirilemez).
  await db.execute({
    sql: `INSERT INTO item_views (item_id, part, count)
          SELECT id, ?, 1 FROM menu_items WHERE id = ?
          ON CONFLICT(item_id, part) DO UPDATE SET count = count + 1`,
    args: [currentPart(), itemId],
  });
}

// ---- Reads ----
export async function getMenu() {
  const part = currentPart();
  const cats = (await db.execute('SELECT id, name, icon FROM categories ORDER BY sort_order, name')).rows;
  const score = new Map((await db.execute({ sql: 'SELECT item_id, count FROM item_views WHERE part = ?', args: [part] })).rows.map((r) => [r.item_id, num(r.count)]));
  const total = new Map((await db.execute('SELECT item_id, SUM(count) AS total FROM item_views GROUP BY item_id')).rows.map((r) => [r.item_id, num(r.total)]));
  const rows = (await db.execute('SELECT * FROM menu_items')).rows;
  rows.sort((a, b) => {
    const sa = score.get(a.id) || 0, sb = score.get(b.id) || 0;
    if (sb !== sa) return sb - sa;
    return num(a.sort_order) - num(b.sort_order);
  });
  const items = rows.map((r) => ({ ...rowToItem(r), views: total.get(r.id) || 0 }));
  return { categories: cats.map((c) => ({ id: c.id, name: c.name, icon: c.icon })), items, part };
}
export async function getSettings() {
  const rows = (await db.execute('SELECT key, value FROM settings')).rows;
  const out = {}; for (const r of rows) out[r.key] = r.value; return out;
}

// ---- Item writes ----
export async function upsertItem(item) {
  await db.execute({
    sql: `INSERT INTO menu_items (id,name,description,price,category,image,is_popular,is_spicy,is_vegetarian,customizable,ingredients,allergens,sort_order,calories)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
          ON CONFLICT(id) DO UPDATE SET name=excluded.name,description=excluded.description,price=excluded.price,category=excluded.category,
            image=excluded.image,is_popular=excluded.is_popular,is_spicy=excluded.is_spicy,is_vegetarian=excluded.is_vegetarian,
            customizable=excluded.customizable,ingredients=excluded.ingredients,allergens=excluded.allergens,sort_order=excluded.sort_order,
            calories=excluded.calories`,
    args: [item.id, item.name ?? '', item.description ?? '', Math.round(Number(item.price) || 0), item.category ?? '', item.image ?? '',
      item.isPopular ? 1 : 0, item.isSpicy ? 1 : 0, item.isVegetarian ? 1 : 0, item.customizable ? 1 : 0,
      JSON.stringify(item.ingredients ?? []), JSON.stringify(item.allergens ?? []), Number(item.sortOrder ?? item.sort_order ?? 0),
      Number(item.calories ?? 0)],
  });
  const r = (await db.execute({ sql: 'SELECT * FROM menu_items WHERE id = ?', args: [item.id] })).rows[0];
  return r ? rowToItem(r) : null;
}
export async function deleteItem(id) { await db.execute({ sql: 'DELETE FROM menu_items WHERE id = ?', args: [id] }); }
export async function bulkUpdatePrices(updates) {
  const stmts = updates.map((u) => ({ sql: 'UPDATE menu_items SET price = ? WHERE id = ?', args: [Math.round(u.price), u.id] }));
  if (stmts.length) await db.batch(stmts, 'write');
}

// ---- Category writes ----
export async function upsertCategory(cat) {
  await db.execute({
    sql: `INSERT INTO categories (id,name,icon,sort_order) VALUES (?,?,?,?)
          ON CONFLICT(id) DO UPDATE SET name=excluded.name,icon=excluded.icon,sort_order=excluded.sort_order`,
    args: [cat.id, cat.name ?? '', cat.icon ?? '', Number(cat.sortOrder ?? cat.sort_order ?? 0)],
  });
  const r = (await db.execute({ sql: 'SELECT id,name,icon FROM categories WHERE id = ?', args: [cat.id] })).rows[0];
  return r ? { id: r.id, name: r.name, icon: r.icon } : null;
}
export async function deleteCategory(id) { await db.execute({ sql: 'DELETE FROM categories WHERE id = ?', args: [id] }); }
export async function reorderCategories(ids) {
  const stmts = ids.map((id, i) => ({ sql: 'UPDATE categories SET sort_order = ? WHERE id = ?', args: [i, id] }));
  if (stmts.length) await db.batch(stmts, 'write');
}

// ---- Settings / admin ----
export async function setSetting(key, value) {
  await db.execute({ sql: 'INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', args: [key, String(value)] });
}
export async function getAdminByEmail(email) {
  return (await db.execute({ sql: 'SELECT * FROM admin_users WHERE email = ?', args: [String(email).toLowerCase()] })).rows[0] || null;
}
export async function upsertAdmin(email, passwordHash) {
  await db.execute({ sql: 'INSERT INTO admin_users (email,password_hash) VALUES (?,?) ON CONFLICT(email) DO UPDATE SET password_hash=excluded.password_hash', args: [String(email).toLowerCase(), passwordHash] });
}
export async function countItems() { return num((await db.execute('SELECT COUNT(*) AS n FROM menu_items')).rows[0].n); }

// ---- Images (stored in DB) ----
export async function putImage(id, buffer, mime) {
  await db.execute({ sql: 'INSERT INTO images (id,mime,data) VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET mime=excluded.mime,data=excluded.data', args: [id, mime || 'image/jpeg', buffer] });
  return id;
}
export async function getImage(id) {
  const r = (await db.execute({ sql: 'SELECT mime, data FROM images WHERE id = ?', args: [id] })).rows[0];
  if (!r || !r.data) return null;
  return { mime: r.mime || 'image/jpeg', data: Buffer.from(r.data) };
}
