import { useState, useEffect, FormEvent, ReactNode } from 'react';
import { motion } from 'motion/react';
import {
  X, Plus, Edit2, Trash2, Save, Settings, ChefHat, Layers, LogOut,
  Search, Lock, Percent, FolderPlus, Star, Flame, ShieldAlert,
} from 'lucide-react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { MenuItem, Category } from '../types';
import SortableCategoryItem from './SortableCategoryItem';
import ImageUploader from './ImageUploader';
import * as api from '../lib/api';

interface AdminDashboardProps {
  items: MenuItem[];
  categories: Category[];
  onChanged: () => void;
  onClose: () => void;
  onShowNotice: (msg: string) => void;
  isLightMode?: boolean;
}

const ALLERGEN_OPTIONS = [
  { name: 'glüten', label: 'Glüten 🌾' }, { name: 'süt', label: 'Süt 🥛' },
  { name: 'kuruyemiş', label: 'Kuruyemiş 🥜' }, { name: 'yumurta', label: 'Yumurta 🥚' },
  { name: 'susam', label: 'Susam 🥯' }, { name: 'soya', label: 'Soya 🫘' }, { name: 'balık', label: 'Balık 🐟' },
  { name: 'alkol', label: 'Alkol İçerir 🍷' }, { name: 'domuz', label: 'Domuz Eti/Bileşeni 🐷' },
];
const ICON_OPTIONS = ['Sparkles', 'Flame', 'Pizza', 'Coffee', 'Cookie', 'GlassWater', 'Gift', 'Layers', 'Utensils'];

const slugify = (s: string) =>
  s.toLowerCase().replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u')
    .replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

type ItemForm = MenuItem & { ingredientInput: string };
const emptyForm = (): ItemForm => ({
  id: '', name: '', description: '', price: 0, category: '', image: '',
  isPopular: false, isSpicy: false, isVegetarian: false, customizable: false,
  ingredients: [], allergens: [], ingredientInput: '', calories: 0,
});

export default function AdminDashboard({ items, categories, onChanged, onClose, onShowNotice, isLightMode = false }: AdminDashboardProps) {
  const [loggedIn, setLoggedIn] = useState(api.isLoggedIn());
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginErr, setLoginErr] = useState('');
  const [busy, setBusy] = useState(false);

  const [isDefaultPassword, setIsDefaultPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePasswordError, setChangePasswordError] = useState('');
  const [changePasswordSuccess, setChangePasswordSuccess] = useState('');
  const [changingPasswordBusy, setChangingPasswordBusy] = useState(false);

  const [activeTab, setActiveTab] = useState<'menu' | 'categories' | 'settings'>('menu');

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ItemForm>(emptyForm());
  const [isNewItem, setIsNewItem] = useState(false);
  const [menuSearch, setMenuSearch] = useState('');

  const [catEditing, setCatEditing] = useState(false);
  const [catForm, setCatForm] = useState<Category & { isNew: boolean }>({ id: '', name: '', icon: 'Sparkles', isNew: true });

  const [gUrl, setGUrl] = useState('');
  const [gDelay, setGDelay] = useState('20');
  const [bulkPct, setBulkPct] = useState(10);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  useEffect(() => {
    api.fetchSettings().then((s) => {
      setGUrl(s.google_review_url || '');
      setGDelay(s.google_review_delay || '20');
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (loggedIn) {
      api.fetchAdminStatus()
        .then((s) => setIsDefaultPassword(s.isDefaultPassword))
        .catch(() => {});
    }
  }, [loggedIn]);

  // ---------- Auth ----------
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setLoginErr('');
    try {
      const data = await api.login(email.trim(), password);
      setLoggedIn(true);
      setIsDefaultPassword(data.isDefaultPassword);
      onShowNotice('Giriş başarılı. 👋');
    } catch (err) {
      setLoginErr((err as Error).message || 'Giriş başarısız');
    } finally {
      setBusy(false);
    }
  };
  const handleLogout = () => { api.clearToken(); setLoggedIn(false); onShowNotice('Çıkış yapıldı.'); };

  // ---------- Password Change ----------
  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setChangePasswordError('');
    setChangePasswordSuccess('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setChangePasswordError('Lütfen tüm alanları doldurun.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setChangePasswordError('Yeni şifreler eşleşmiyor.');
      return;
    }
    if (newPassword.length < 6) {
      setChangePasswordError('Yeni şifre en az 6 karakter olmalıdır.');
      return;
    }
    setChangingPasswordBusy(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      setChangePasswordSuccess('Şifreniz başarıyla güncellendi. ✅');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsDefaultPassword(false);
      onShowNotice('Yönetici şifresi güncellendi.');
    } catch (err) {
      setChangePasswordError((err as Error).message || 'Şifre güncellenemedi.');
    } finally {
      setChangingPasswordBusy(false);
    }
  };

  // ---------- Item CRUD ----------
  const openAdd = () => { setForm(emptyForm()); setIsNewItem(true); setEditing(true); };
  const openEdit = (it: MenuItem) => {
    setForm({ ...it, ingredients: it.ingredients || [], allergens: it.allergens || [], ingredientInput: '', calories: it.calories || 0 });
    setIsNewItem(false); setEditing(true);
  };
  const addIngredient = () => {
    const v = form.ingredientInput.trim();
    if (!v) return;
    setForm({ ...form, ingredients: [...(form.ingredients || []), v], ingredientInput: '' });
  };
  const removeIngredient = (ing: string) => setForm({ ...form, ingredients: (form.ingredients || []).filter((i) => i !== ing) });
  const toggleAllergen = (name: string) => {
    const cur = form.allergens || [];
    setForm({ ...form, allergens: cur.includes(name) ? cur.filter((a) => a !== name) : [...cur, name] });
  };

  const saveItem = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { onShowNotice('Ürün adı gerekli.'); return; }
    if (!form.category) { onShowNotice('Kategori seçin.'); return; }
    const { ingredientInput, ...rest } = form;
    const payload: MenuItem = {
      ...rest,
      id: isNewItem ? `${slugify(form.name)}-${Date.now().toString(36).slice(-4)}` : form.id,
      price: Math.round(Number(form.price) || 0),
      calories: Number(form.calories) || 0,
    };
    setBusy(true);
    try {
      if (isNewItem) await api.createItem(payload); else await api.updateItem(payload);
      onShowNotice(isNewItem ? 'Ürün eklendi. ✅' : 'Ürün güncellendi. ✅');
      setEditing(false); onChanged();
    } catch (err) { onShowNotice('Hata: ' + (err as Error).message); }
    finally { setBusy(false); }
  };
  const deleteItem = async (id: string, name: string) => {
    if (!window.confirm(`"${name}" ürününü silmek istediğinize emin misiniz?`)) return;
    try { await api.deleteItem(id); onShowNotice('Ürün silindi.'); onChanged(); }
    catch (err) { onShowNotice('Hata: ' + (err as Error).message); }
  };

  // ---------- Category CRUD ----------
  const openAddCat = () => { setCatForm({ id: '', name: '', icon: 'Sparkles', isNew: true }); setCatEditing(true); };
  const openEditCat = (c: Category) => { setCatForm({ ...c, isNew: false }); setCatEditing(true); };
  const saveCat = async (e: FormEvent) => {
    e.preventDefault();
    if (!catForm.name.trim()) { onShowNotice('Kategori adı gerekli.'); return; }
    const payload: Category = { id: catForm.isNew ? slugify(catForm.name) : catForm.id, name: catForm.name.trim(), icon: catForm.icon };
    try { await api.saveCategory(payload); onShowNotice('Kategori kaydedildi.'); setCatEditing(false); onChanged(); }
    catch (err) { onShowNotice('Hata: ' + (err as Error).message); }
  };
  const deleteCat = async (id: string, name: string) => {
    if (!window.confirm(`"${name}" kategorisini silmek istiyor musunuz? (Ürünler silinmez, kategorisiz kalır)`)) return;
    try { await api.deleteCategory(id); onShowNotice('Kategori silindi.'); onChanged(); }
    catch (err) { onShowNotice('Hata: ' + (err as Error).message); }
  };
  const onDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldI = categories.findIndex((c) => c.id === active.id);
    const newI = categories.findIndex((c) => c.id === over.id);
    if (oldI < 0 || newI < 0) return;
    const order = arrayMove(categories, oldI, newI).map((c) => c.id);
    try { await api.reorderCategories(order); onChanged(); } catch (err) { onShowNotice('Hata: ' + (err as Error).message); }
  };

  // ---------- Settings + bulk price ----------
  const saveGoogle = async () => {
    try { await api.saveSettings({ google_review_url: gUrl, google_review_delay: gDelay }); onShowNotice('Ayarlar kaydedildi. 💾'); }
    catch (err) { onShowNotice('Hata: ' + (err as Error).message); }
  };
  const applyBulk = async () => {
    const updates = items.filter((i) => i.price > 0).map((i) => ({ id: i.id, price: Math.max(0, Math.round(i.price * (1 + bulkPct / 100))) }));
    if (!updates.length) { onShowNotice('Güncellenecek ürün yok.'); return; }
    if (!window.confirm(`${updates.length} ürünün fiyatı %${bulkPct} ${bulkPct >= 0 ? 'artırılacak' : 'azaltılacak'}. Onaylıyor musunuz?`)) return;
    try { await api.bulkPrice(updates); onShowNotice(`${updates.length} ürünün fiyatı güncellendi. 💸`); onChanged(); }
    catch (err) { onShowNotice('Hata: ' + (err as Error).message); }
  };

  const filteredItems = items.filter((i) => {
    const q = menuSearch.toLowerCase();
    return i.name.toLowerCase().includes(q) || (categories.find((c) => c.id === i.category)?.name || '').toLowerCase().includes(q);
  });

  // ---------- Render ----------
  const shell = (children: ReactNode) => (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }}
        className="bg-card border border-line w-full max-w-5xl h-[94vh] rounded-3xl flex flex-col overflow-hidden shadow-2xl"
      >
        {children}
      </motion.div>
    </div>
  );

  // ----- Login gate -----
  if (!loggedIn) {
    return shell(
      <div className="flex-1 flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-brand/10 text-brand rounded-2xl"><Lock className="w-6 h-6" /></div>
            <h2 className="text-lg font-sans font-bold text-ink">Yönetici Girişi</h2>
            <p className="text-[13px] text-ink-faint">Menüyü düzenlemek için giriş yapın.</p>
          </div>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-posta"
            className="w-full text-sm bg-card-2 border border-line focus:border-brand rounded-xl px-4 py-3 text-ink focus:outline-none" />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Şifre"
            className="w-full text-sm bg-card-2 border border-line focus:border-brand rounded-xl px-4 py-3 text-ink focus:outline-none" />
          {loginErr && <p className="text-[13px] text-red-500 text-center">{loginErr}</p>}
          <button type="submit" disabled={busy} className="w-full bg-brand text-on-brand font-bold py-3 rounded-xl hover:bg-brand-2 transition cursor-pointer disabled:opacity-60">
            {busy ? 'Giriş yapılıyor…' : 'Giriş Yap'}
          </button>
          <button type="button" onClick={onClose} className="w-full text-[13px] text-ink-faint hover:text-ink transition cursor-pointer">Kapat</button>
        </form>
      </div>
    );
  }

  // ----- Panel -----
  return shell(
    <>
      {/* Header */}
      <div className="bg-card-2 px-4 py-3 border-b border-line flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="p-2 bg-brand/10 text-brand rounded-xl"><Settings className="w-5 h-5" /></span>
          <div>
            <h2 className="text-[13px] font-sans font-bold text-ink">Aspava Yönetim Paneli</h2>
            <p className="text-[11px] text-ink-faint">Menü • Kategori • Ayarlar</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {[['menu', 'Menü', ChefHat], ['categories', 'Kategoriler', Layers], ['settings', 'Ayarlar', Settings]].map(([id, label, Icon]: any) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`px-3 py-2 rounded-xl text-[12px] font-semibold flex items-center gap-1.5 cursor-pointer transition ${activeTab === id ? 'bg-brand text-on-brand' : 'text-ink-soft hover:text-ink hover:bg-card'}`}>
              <Icon className="w-3.5 h-3.5" /> <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
          <button onClick={handleLogout} title="Çıkış" className="p-2 rounded-xl text-ink-soft hover:text-red-500 hover:bg-card cursor-pointer transition"><LogOut className="w-4 h-4" /></button>
          <button onClick={onClose} title="Kapat" className="p-2 rounded-xl text-ink-soft hover:text-ink hover:bg-card cursor-pointer transition"><X className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isDefaultPassword && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 rounded-2xl p-4 flex items-start gap-3 mb-2">
            <span className="p-2 bg-red-500/15 text-red-500 rounded-xl shrink-0"><ShieldAlert className="w-5 h-5" /></span>
            <div>
              <h4 className="text-sm font-bold">Güvenlik Uyarısı: Varsayılan Şifre Aktif</h4>
              <p className="text-[12.5px] opacity-90 mt-0.5">Yönetici şifreniz hala varsayılan şifre ("aspava1234") olarak ayarlı. Sitenizin güvenliği için lütfen en kısa sürede <strong>Ayarlar</strong> sekmesinden şifrenizi değiştirin.</p>
            </div>
          </div>
        )}

        {/* ===== MENU TAB ===== */}
        {activeTab === 'menu' && !editing && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                <input value={menuSearch} onChange={(e) => setMenuSearch(e.target.value)} placeholder="Ürün ara…"
                  className="w-full text-sm bg-card-2 border border-line focus:border-brand rounded-xl pl-9 pr-3 py-2.5 text-ink focus:outline-none" />
              </div>
              <button onClick={openAdd} className="bg-brand text-on-brand font-bold text-[13px] px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer hover:bg-brand-2 transition shrink-0">
                <Plus className="w-4 h-4" /> Yeni Ürün
              </button>
            </div>
            <p className="text-[12px] text-ink-faint">{filteredItems.length} ürün</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {filteredItems.map((it) => (
                <div key={it.id} className="bg-card-2 border border-line rounded-2xl p-3 flex items-center gap-3">
                  {it.image ? <img src={it.image} alt="" className="w-12 h-12 rounded-xl object-cover border border-line shrink-0" />
                    : <div className="w-12 h-12 rounded-xl bg-card border border-line flex items-center justify-center text-brand shrink-0"><ChefHat className="w-5 h-5" /></div>}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-semibold text-ink truncate">{it.name}</h4>
                      {it.isPopular && <Star className="w-3 h-3 text-gold fill-gold shrink-0" />}
                      {it.isSpicy && <Flame className="w-3 h-3 text-red-500 fill-red-500 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-ink-faint truncate">
                      {categories.find((c) => c.id === it.category)?.name || it.category} · {it.price} ₺
                      {it.views ? <span className="text-brand"> · 👁 {it.views}</span> : null}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => openEdit(it)} className="p-2 rounded-lg bg-card border border-line text-ink-soft hover:text-brand cursor-pointer transition"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => deleteItem(it.id, it.name)} className="p-2 rounded-lg bg-card border border-line text-ink-soft hover:text-red-500 cursor-pointer transition"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== ITEM EDITOR ===== */}
        {activeTab === 'menu' && editing && (
          <form onSubmit={saveItem} className="space-y-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-sans font-semibold text-ink">{isNewItem ? 'Yeni Ürün' : 'Ürünü Düzenle'}</h3>
              <button type="button" onClick={() => setEditing(false)} className="text-[13px] text-ink-faint hover:text-ink cursor-pointer">← Listeye dön</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[11px] font-semibold text-ink-faint uppercase tracking-wider">Ürün Adı</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ör: Adana Kebap"
                  className="w-full text-sm bg-card-2 border border-line focus:border-brand rounded-xl px-3 py-2.5 text-ink focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-ink-faint uppercase tracking-wider">Fiyat (₺)</label>
                <input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  className="w-full text-sm bg-card-2 border border-line focus:border-brand rounded-xl px-3 py-2.5 text-ink focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-ink-faint uppercase tracking-wider">Kalori (kcal)</label>
                <input type="number" min="0" value={form.calories || 0} onChange={(e) => setForm({ ...form, calories: Number(e.target.value) })} placeholder="Ör: 300"
                  className="w-full text-sm bg-card-2 border border-line focus:border-brand rounded-xl px-3 py-2.5 text-ink focus:outline-none" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-ink-faint uppercase tracking-wider">Kategori</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full text-sm bg-card-2 border border-line focus:border-brand rounded-xl px-3 py-2.5 text-ink focus:outline-none">
                <option value="">Seçin…</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-ink-faint uppercase tracking-wider">Açıklama</label>
              <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full text-sm bg-card-2 border border-line focus:border-brand rounded-xl px-3 py-2.5 text-ink focus:outline-none resize-none" />
            </div>

            <ImageUploader value={form.image} onChange={(v) => setForm({ ...form, image: v })} onShowNotice={onShowNotice} />

            {/* Ingredients */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-ink-faint uppercase tracking-wider">İçindekiler</label>
              <div className="flex gap-2">
                <input value={form.ingredientInput} onChange={(e) => setForm({ ...form, ingredientInput: e.target.value })}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addIngredient(); } }}
                  placeholder="Malzeme yazıp Enter…" className="flex-1 text-sm bg-card-2 border border-line focus:border-brand rounded-xl px-3 py-2.5 text-ink focus:outline-none" />
                <button type="button" onClick={addIngredient} className="bg-card-2 border border-line text-ink-soft hover:text-brand px-4 rounded-xl cursor-pointer transition"><Plus className="w-4 h-4" /></button>
              </div>
              {(form.ingredients || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(form.ingredients || []).map((ing, i) => (
                    <span key={i} className="text-[12px] text-ink-soft bg-card-2 border border-line pl-2.5 pr-1 py-1 rounded-full flex items-center gap-1">
                      {ing}<button type="button" onClick={() => removeIngredient(ing)} className="text-ink-faint hover:text-red-500 cursor-pointer"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Allergens */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-ink-faint uppercase tracking-wider">Alerjenler</label>
              <div className="flex flex-wrap gap-1.5">
                {ALLERGEN_OPTIONS.map((a) => {
                  const on = (form.allergens || []).includes(a.name);
                  return (
                    <button type="button" key={a.name} onClick={() => toggleAllergen(a.name)}
                      className={`text-[12px] px-3 py-1.5 rounded-full border cursor-pointer transition ${on ? 'bg-red-500/10 border-red-500/40 text-red-500' : 'bg-card-2 border-line text-ink-soft hover:border-brand/40'}`}>
                      {a.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Flags */}
            <div className="flex flex-wrap gap-2">
              {([['isPopular', 'En Sevilen ⭐'], ['isSpicy', 'Acılı 🌶️'], ['isVegetarian', 'Vejetaryen 🥗'], ['customizable', 'Özelleştirilebilir ⚙️']] as const).map(([k, label]) => (
                <button type="button" key={k} onClick={() => setForm({ ...form, [k]: !form[k] })}
                  className={`text-[12px] px-3 py-2 rounded-xl border cursor-pointer transition ${form[k] ? 'bg-brand/10 border-brand/40 text-brand font-semibold' : 'bg-card-2 border-line text-ink-soft hover:border-brand/40'}`}>
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button type="submit" disabled={busy} className="bg-brand text-on-brand font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer hover:bg-brand-2 transition disabled:opacity-60">
                <Save className="w-4 h-4" /> {busy ? 'Kaydediliyor…' : 'Kaydet'}
              </button>
              <button type="button" onClick={() => setEditing(false)} className="text-[13px] text-ink-faint hover:text-ink px-4 py-2.5 cursor-pointer">Vazgeç</button>
            </div>
          </form>
        )}

        {/* ===== CATEGORIES TAB ===== */}
        {activeTab === 'categories' && (
          <div className="space-y-3 max-w-2xl mx-auto">
            {!catEditing ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-display font-bold text-ink">Kategoriler</h3>
                  <button onClick={openAddCat} className="bg-brand text-on-brand font-bold text-[13px] px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer hover:bg-brand-2 transition">
                    <FolderPlus className="w-4 h-4" /> Kategori Ekle
                  </button>
                </div>
                <p className="text-[12px] text-ink-faint">Sürükleyip sıralayabilirsiniz.</p>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                  <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {categories.map((c) => (
                        <SortableCategoryItem key={c.id} id={c.id} cat={c} isSelected={false} isLightMode={isLightMode}
                          productCount={items.filter((i) => i.category === c.id).length} onEdit={openEditCat} onDelete={deleteCat} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </>
            ) : (
              <form onSubmit={saveCat} className="space-y-4">
                <h3 className="text-base font-display font-bold text-ink">{catForm.isNew ? 'Yeni Kategori' : 'Kategoriyi Düzenle'}</h3>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-ink-faint uppercase tracking-wider">Kategori Adı</label>
                  <input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} placeholder="Ör: Çorbalar"
                    className="w-full text-sm bg-card-2 border border-line focus:border-brand rounded-xl px-3 py-2.5 text-ink focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-ink-faint uppercase tracking-wider">İkon</label>
                  <div className="flex flex-wrap gap-1.5">
                    {ICON_OPTIONS.map((ic) => (
                      <button type="button" key={ic} onClick={() => setCatForm({ ...catForm, icon: ic })}
                        className={`text-[12px] px-3 py-1.5 rounded-lg border cursor-pointer transition ${catForm.icon === ic ? 'bg-brand/10 border-brand/40 text-brand' : 'bg-card-2 border-line text-ink-soft'}`}>{ic}</button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button type="submit" className="bg-brand text-on-brand font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer hover:bg-brand-2 transition"><Save className="w-4 h-4" /> Kaydet</button>
                  <button type="button" onClick={() => setCatEditing(false)} className="text-[13px] text-ink-faint hover:text-ink px-4 cursor-pointer">Vazgeç</button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ===== SETTINGS TAB ===== */}
        {activeTab === 'settings' && (
          <div className="space-y-5 max-w-2xl mx-auto">
            {/* Bulk price */}
            <div className="bg-card-2 border border-line rounded-2xl p-4 space-y-3">
              <h3 className="text-sm font-display font-bold text-ink flex items-center gap-2"><Percent className="w-4 h-4 text-brand" /> Toplu Fiyat Güncelleme</h3>
              <p className="text-[12px] text-ink-faint">Tüm (ücretli) ürünlerin fiyatını yüzdeyle değiştirin.</p>
              <div className="flex items-center gap-2">
                <input type="number" value={bulkPct} onChange={(e) => setBulkPct(Number(e.target.value))}
                  className="w-24 text-sm bg-card border border-line focus:border-brand rounded-xl px-3 py-2.5 text-ink focus:outline-none" />
                <span className="text-sm text-ink-soft">%</span>
                <button onClick={applyBulk} className="bg-brand text-on-brand font-bold text-[13px] px-4 py-2.5 rounded-xl cursor-pointer hover:bg-brand-2 transition">Uygula</button>
              </div>
            </div>

            {/* Google review */}
            <div className="bg-card-2 border border-line rounded-2xl p-4 space-y-3">
              <h3 className="text-sm font-display font-bold text-ink flex items-center gap-2"><Star className="w-4 h-4 text-gold" /> Google Yorum Hatırlatması</h3>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-ink-faint uppercase tracking-wider">Google Yorum Linki</label>
                <input type="url" value={gUrl} onChange={(e) => setGUrl(e.target.value)} placeholder="https://maps.app.goo.gl/…"
                  className="w-full text-sm bg-card border border-line focus:border-brand rounded-xl px-3 py-2.5 text-ink focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-ink-faint uppercase tracking-wider">Gecikme (saniye)</label>
                <input type="number" min="3" max="180" value={gDelay} onChange={(e) => setGDelay(e.target.value)}
                  className="w-32 text-sm bg-card border border-line focus:border-brand rounded-xl px-3 py-2.5 text-ink focus:outline-none" />
              </div>
              <button onClick={saveGoogle} className="bg-brand text-on-brand font-bold text-[13px] px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer hover:bg-brand-2 transition"><Save className="w-4 h-4" /> Kaydet</button>
            </div>

            {/* Şifre Değiştirme Formu */}
            <form onSubmit={handleChangePassword} className="bg-card-2 border border-line rounded-2xl p-4 space-y-3">
              <h3 className="text-sm font-display font-bold text-ink flex items-center gap-2"><Lock className="w-4 h-4 text-brand" /> Yönetici Şifresini Değiştir</h3>
              <p className="text-[12px] text-ink-faint">Hesap güvenliğiniz için varsayılan şifreyi değiştirin ve düzenli aralıklarla güncelleyin.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-ink-faint uppercase tracking-wider">Mevcut Şifre</label>
                  <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full text-sm bg-card border border-line focus:border-brand rounded-xl px-3 py-2.5 text-ink focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-ink-faint uppercase tracking-wider">Yeni Şifre</label>
                  <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full text-sm bg-card border border-line focus:border-brand rounded-xl px-3 py-2.5 text-ink focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-ink-faint uppercase tracking-wider">Yeni Şifre (Tekrar)</label>
                  <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full text-sm bg-card border border-line focus:border-brand rounded-xl px-3 py-2.5 text-ink focus:outline-none" />
                </div>
              </div>

              {changePasswordError && <p className="text-[12.5px] text-red-500">{changePasswordError}</p>}
              {changePasswordSuccess && <p className="text-[12.5px] text-green-500 font-medium">{changePasswordSuccess}</p>}

              <button type="submit" disabled={changingPasswordBusy}
                className="bg-brand text-on-brand font-bold text-[13px] px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer hover:bg-brand-2 transition disabled:opacity-60">
                <Save className="w-4 h-4" /> {changingPasswordBusy ? 'Güncelleniyor…' : 'Şifreyi Güncelle'}
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
