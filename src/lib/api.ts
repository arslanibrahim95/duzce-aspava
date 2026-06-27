// Frontend API client for the self-contained backend (same origin; Vite proxies /api in dev).
import { MenuItem, Category } from '../types';

export interface MenuData {
  categories: Category[];
  items: MenuItem[];
}

const TOKEN_KEY = 'aspava_admin_token';
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);
export const isLoggedIn = () => !!getToken();

async function json(res: Response) {
  if (res.status === 401) {
    clearToken();
    throw new Error('401');
  }
  if (!res.ok) {
    let msg = 'İstek başarısız';
    try { msg = (await res.json()).error || msg; } catch { /* ignore */ }
    throw new Error(msg);
  }
  return res.json();
}

function authHeaders(extra: Record<string, string> = {}) {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}`, ...extra } : extra;
}

// ---- Public ----
export async function fetchMenu(): Promise<MenuData> {
  return json(await fetch('/api/menu'));
}

// Fire-and-forget: record that a guest opened a product (smart popularity ordering).
export function trackView(id: string): void {
  try {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* ignore */
  }
}
export async function fetchSettings(): Promise<Record<string, string>> {
  return json(await fetch('/api/settings'));
}

// ---- Auth ----
export async function login(email: string, password: string): Promise<{ token: string; email: string; isDefaultPassword: boolean }> {
  const data = await json(
    await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
  );
  setToken(data.token);
  return data;
}

export async function fetchAdminStatus(): Promise<{ email: string; isDefaultPassword: boolean }> {
  return json(await fetch('/api/admin/status', { headers: authHeaders() }));
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await json(
    await fetch('/api/admin/change-password', {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ currentPassword, newPassword }),
    })
  );
}

// ---- Admin: items ----
export async function createItem(item: MenuItem): Promise<MenuItem> {
  return json(await fetch('/api/items', { method: 'POST', headers: authHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify(item) }));
}
export async function updateItem(item: MenuItem): Promise<MenuItem> {
  return json(await fetch(`/api/items/${encodeURIComponent(item.id)}`, { method: 'PUT', headers: authHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify(item) }));
}
export async function deleteItem(id: string): Promise<void> {
  await json(await fetch(`/api/items/${encodeURIComponent(id)}`, { method: 'DELETE', headers: authHeaders() }));
}
export async function bulkPrice(updates: { id: string; price: number }[]): Promise<void> {
  await json(await fetch('/api/items/bulk-price', { method: 'POST', headers: authHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify({ updates }) }));
}

// ---- Admin: categories ----
export async function saveCategory(cat: Category): Promise<Category> {
  const exists = !!cat.id;
  const url = exists ? `/api/categories/${encodeURIComponent(cat.id)}` : '/api/categories';
  return json(await fetch(url, { method: exists ? 'PUT' : 'POST', headers: authHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify(cat) }));
}
export async function deleteCategory(id: string): Promise<void> {
  await json(await fetch(`/api/categories/${encodeURIComponent(id)}`, { method: 'DELETE', headers: authHeaders() }));
}
export async function reorderCategories(order: string[]): Promise<void> {
  await json(await fetch('/api/categories', { method: 'PUT', headers: authHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify({ order }) }));
}

// ---- Admin: settings ----
export async function saveSettings(values: Record<string, string>): Promise<Record<string, string>> {
  return json(await fetch('/api/settings', { method: 'PUT', headers: authHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify(values) }));
}

// ---- Admin: image upload ----
export async function uploadImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('image', file);
  const data = await json(await fetch('/api/upload', { method: 'POST', headers: authHeaders(), body: fd }));
  return data.url as string;
}
